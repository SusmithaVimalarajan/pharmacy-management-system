const express = require("express");

const db = require("../config/db");

const {
    authenticateToken
} = require("../middleware/authMiddleware");


const router = express.Router();


router.get(
    "/",
    authenticateToken,
    (req, res) => {

        const sql = `

            SELECT

                medicine_id,

                medicine_name,

                batch_number,

                expiry_date,

                quantity,

                CASE

                    WHEN expiry_date IS NULL
                        THEN 'No Expiry Date'

                    WHEN expiry_date < CURDATE()
                        THEN 'Expired'

                    WHEN expiry_date <= DATE_ADD(
                        CURDATE(),
                        INTERVAL 30 DAY
                    )
                        THEN 'Expiring Soon'

                    ELSE 'Valid'

                END AS status,

                CASE

                    WHEN expiry_date IS NULL
                        THEN NULL

                    ELSE DATEDIFF(
                        expiry_date,
                        CURDATE()
                    )

                END AS days_remaining

            FROM medicines

            ORDER BY

                CASE

                    WHEN expiry_date IS NULL
                        THEN 4

                    WHEN expiry_date < CURDATE()
                        THEN 1

                    WHEN expiry_date <= DATE_ADD(
                        CURDATE(),
                        INTERVAL 30 DAY
                    )
                        THEN 2

                    ELSE 3

                END,

                expiry_date ASC

        `;


        db.query(
            sql,
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


router.get(
    "/summary",
    authenticateToken,
    (req, res) => {

        const sql = `

            SELECT

                COUNT(
                    CASE
                        WHEN expiry_date IS NOT NULL
                        THEN 1
                    END
                ) AS totalWithExpiry,

                COUNT(
                    CASE
                        WHEN expiry_date < CURDATE()
                        THEN 1
                    END
                ) AS expired,

                COUNT(
                    CASE
                        WHEN expiry_date >= CURDATE()
                        AND expiry_date <= DATE_ADD(
                            CURDATE(),
                            INTERVAL 30 DAY
                        )
                        THEN 1
                    END
                ) AS expiringSoon,

                COUNT(
                    CASE
                        WHEN expiry_date > DATE_ADD(
                            CURDATE(),
                            INTERVAL 30 DAY
                        )
                        THEN 1
                    END
                ) AS valid

            FROM medicines

        `;


        db.query(
            sql,
            (error, results) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message: "Database error."
                    });

                }


                res.json(results[0]);

            }
        );

    }
);


module.exports = router;