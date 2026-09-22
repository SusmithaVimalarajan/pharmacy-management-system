const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../config/db");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET ALL USERS
// =====================================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const sql = `
            SELECT
                user_id,
                full_name,
                username,
                email,
                role,
                status,
                created_at
            FROM users
            ORDER BY user_id ASC
        `;

        db.query(sql, (error, results) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    message: "Database error."
                });
            }

            res.json(results);
        });
    }
);


// =====================================================
// SEARCH USERS
// =====================================================

router.get(
    "/search",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const search = req.query.q || "";

        const keyword = `%${search}%`;

        const sql = `
            SELECT
                user_id,
                full_name,
                username,
                email,
                role,
                status,
                created_at
            FROM users
            WHERE
                full_name LIKE ?
                OR username LIKE ?
                OR email LIKE ?
                OR role LIKE ?
            ORDER BY user_id ASC
        `;

        db.query(
            sql,
            [
                keyword,
                keyword,
                keyword,
                keyword
            ],
            (error, results) => {

                if (error) {
                    console.error(error);

                    return res.status(500).json({
                        message: "Database error."
                    });
                }

                res.json(results);
            }
        );
    }
);


// =====================================================
// GET SINGLE USER
// =====================================================

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const userId = req.params.id;

        const sql = `
            SELECT
                user_id,
                full_name,
                username,
                email,
                role,
                status
            FROM users
            WHERE user_id = ?
        `;

        db.query(
            sql,
            [userId],
            (error, results) => {

                if (error) {
                    console.error(error);

                    return res.status(500).json({
                        message: "Database error."
                    });
                }

                if (results.length === 0) {

                    return res.status(404).json({
                        message: "User not found."
                    });
                }

                res.json(results[0]);
            }
        );
    }
);


// =====================================================
// ADD USER
// =====================================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {

        const {
            full_name,
            username,
            email,
            password,
            role,
            status
        } = req.body;

        if (
            !full_name ||
            !username ||
            !password ||
            !role
        ) {

            return res.status(400).json({
                message:
                    "Full name, username, password and role are required."
            });
        }

        const allowedRoles = [
            "admin",
            "pharmacist",
            "staff"
        ];

        if (!allowedRoles.includes(role)) {

            return res.status(400).json({
                message: "Invalid user role."
            });
        }

        const allowedStatus = [
            "active",
            "inactive"
        ];

        if (
            status &&
            !allowedStatus.includes(status)
        ) {

            return res.status(400).json({
                message: "Invalid user status."
            });
        }

        try {

            const hashedPassword =
                await bcrypt.hash(password, 10);

            const sql = `
                INSERT INTO users
                (
                    full_name,
                    username,
                    email,
                    password,
                    role,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    full_name.trim(),
                    username.trim(),
                    email || null,
                    hashedPassword,
                    role,
                    status || "active"
                ],
                (error, result) => {

                    if (error) {

                        console.error(error);

                        if (
                            error.code === "ER_DUP_ENTRY"
                        ) {

                            return res.status(409).json({
                                message:
                                    "Username or email already exists."
                            });
                        }

                        return res.status(500).json({
                            message:
                                "Failed to add user."
                        });
                    }

                    res.status(201).json({
                        message:
                            "User added successfully.",
                        user_id:
                            result.insertId
                    });
                }
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Failed to process password."
            });
        }
    }
);


// =====================================================
// UPDATE USER
// =====================================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {

        const userId = req.params.id;

        const {
            full_name,
            username,
            email,
            password,
            role,
            status
        } = req.body;

        if (
            !full_name ||
            !username ||
            !role
        ) {

            return res.status(400).json({
                message:
                    "Full name, username and role are required."
            });
        }

        const allowedRoles = [
            "admin",
            "pharmacist",
            "staff"
        ];

        if (!allowedRoles.includes(role)) {

            return res.status(400).json({
                message: "Invalid user role."
            });
        }

        const allowedStatus = [
            "active",
            "inactive"
        ];

        if (
            status &&
            !allowedStatus.includes(status)
        ) {

            return res.status(400).json({
                message: "Invalid user status."
            });
        }

        try {

            let sql;
            let values;

            if (password && password.trim() !== "") {

                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );

                sql = `
                    UPDATE users
                    SET
                        full_name = ?,
                        username = ?,
                        email = ?,
                        password = ?,
                        role = ?,
                        status = ?
                    WHERE user_id = ?
                `;

                values = [
                    full_name.trim(),
                    username.trim(),
                    email || null,
                    hashedPassword,
                    role,
                    status || "active",
                    userId
                ];

            } else {

                sql = `
                    UPDATE users
                    SET
                        full_name = ?,
                        username = ?,
                        email = ?,
                        role = ?,
                        status = ?
                    WHERE user_id = ?
                `;

                values = [
                    full_name.trim(),
                    username.trim(),
                    email || null,
                    role,
                    status || "active",
                    userId
                ];
            }

            db.query(
                sql,
                values,
                (error, result) => {

                    if (error) {

                        console.error(error);

                        if (
                            error.code === "ER_DUP_ENTRY"
                        ) {

                            return res.status(409).json({
                                message:
                                    "Username or email already exists."
                            });
                        }

                        return res.status(500).json({
                            message:
                                "Failed to update user."
                        });
                    }

                    if (
                        result.affectedRows === 0
                    ) {

                        return res.status(404).json({
                            message:
                                "User not found."
                        });
                    }

                    res.json({
                        message:
                            "User updated successfully."
                    });
                }
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Failed to process password."
            });
        }
    }
);


// =====================================================
// DELETE USER
// =====================================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const userId = req.params.id;

        if (
            Number(userId) ===
            Number(req.user.user_id)
        ) {

            return res.status(400).json({
                message:
                    "You cannot delete your own account."
            });
        }

        const sql = `
            DELETE FROM users
            WHERE user_id = ?
        `;

        db.query(
            sql,
            [userId],
            (error, result) => {

                if (error) {

                    console.error(error);

                    if (
                        error.code ===
                        "ER_ROW_IS_REFERENCED_2"
                    ) {

                        return res.status(409).json({
                            message:
                                "Cannot delete this user because the user is linked to existing records."
                        });
                    }

                    return res.status(500).json({
                        message:
                            "Failed to delete user."
                    });
                }

                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "User not found."
                    });
                }

                res.json({
                    message:
                        "User deleted successfully."
                });
            }
        );
    }
);


module.exports = router;