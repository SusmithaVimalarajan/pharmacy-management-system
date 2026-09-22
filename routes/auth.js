const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../config/db");

const router = express.Router();


router.post("/login", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {

        return res.status(400).json({
            message: "Username and password are required."
        });
    }


    const sql = `
        SELECT user_id, full_name, username, password, role, status
        FROM users
        WHERE username = ?
    `;


    db.query(sql, [username], async (error, results) => {

        if (error) {

            console.error(error);

            return res.status(500).json({
                message: "Database error."
            });
        }


        if (results.length === 0) {

            return res.status(401).json({
                message: "Invalid username or password."
            });
        }


        const user = results[0];


        if (user.status !== "active") {

            return res.status(403).json({
                message: "Your account is inactive."
            });
        }


        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatch) {

            return res.status(401).json({
                message: "Invalid username or password."
            });
        }


        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );


        res.json({
            message: "Login successful",
            token: token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                username: user.username,
                role: user.role
            }
        });

    });

});


module.exports = router;