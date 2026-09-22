const bcrypt = require("bcryptjs");

const db = require("./config/db");


async function createAdmin() {

    const password = "admin123";

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
            "System Administrator",
            "admin",
            "admin@gmail.com",
            hashedPassword,
            "admin",
            "active"
        ],
        (error, result) => {

            if (error) {

                console.error(error);

                return;
            }


            console.log(
                "Admin user created successfully."
            );

            console.log("Username: admin");
            console.log("Password: admin123");

            process.exit();

        }
    );

}


createAdmin();