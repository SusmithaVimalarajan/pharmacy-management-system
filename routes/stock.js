const express = require("express");

const db = require("../config/db");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET ALL STOCK
// =====================================================

router.get(
    "/",
    authenticateToken,
    (req, res) => {

        const sql = `
            SELECT
                m.medicine_id,
                m.medicine_name,
                c.category_name,
                s.supplier_name,
                m.batch_number,
                m.quantity,
                m.reorder_level,
                m.selling_price,
                m.expiry_date,

                CASE
                    WHEN m.quantity <= m.reorder_level
                    THEN 'Low Stock'
                    ELSE 'Normal'
                END AS stock_status

            FROM medicines m

            LEFT JOIN categories c
                ON m.category_id = c.category_id

            LEFT JOIN suppliers s
                ON m.supplier_id = s.supplier_id

            ORDER BY m.medicine_id DESC
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
// SEARCH STOCK
// =====================================================

router.get(
    "/search",
    authenticateToken,
    (req, res) => {

        const search =
            req.query.q || "";

        const keyword =
            `%${search}%`;

        const sql = `
            SELECT
                m.medicine_id,
                m.medicine_name,
                c.category_name,
                s.supplier_name,
                m.batch_number,
                m.quantity,
                m.reorder_level,
                m.selling_price,
                m.expiry_date,

                CASE
                    WHEN m.quantity <= m.reorder_level
                    THEN 'Low Stock'
                    ELSE 'Normal'
                END AS stock_status

            FROM medicines m

            LEFT JOIN categories c
                ON m.category_id = c.category_id

            LEFT JOIN suppliers s
                ON m.supplier_id = s.supplier_id

            WHERE
                m.medicine_name LIKE ?
                OR m.batch_number LIKE ?
                OR c.category_name LIKE ?

            ORDER BY m.medicine_id DESC
        `;

        db.query(
            sql,
            [
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
// GET LOW STOCK
// =====================================================

router.get(
    "/low-stock",
    authenticateToken,
    (req, res) => {

        const sql = `
            SELECT
                m.medicine_id,
                m.medicine_name,
                c.category_name,
                m.quantity,
                m.reorder_level,
                m.expiry_date
            FROM medicines m

            LEFT JOIN categories c
                ON m.category_id = c.category_id

            WHERE
                m.quantity <= m.reorder_level

            ORDER BY
                m.quantity ASC
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
// GET SINGLE STOCK
// =====================================================

router.get(
    "/:id",
    authenticateToken,
    (req, res) => {

        const medicineId =
            req.params.id;

        const sql = `
            SELECT
                medicine_id,
                medicine_name,
                quantity,
                reorder_level
            FROM medicines
            WHERE medicine_id = ?
        `;

        db.query(
            sql,
            [medicineId],
            (error, results) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message: "Database error."
                    });
                }

                if (
                    results.length === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Medicine not found."
                    });
                }

                res.json(results[0]);
            }
        );
    }
);


// =====================================================
// UPDATE STOCK
// Admin / Pharmacist
// =====================================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "pharmacist"),
    (req, res) => {

        const medicineId =
            req.params.id;

        const {
            quantity,
            reorder_level
        } = req.body;


        if (
            quantity === undefined ||
            quantity === "" ||
            Number(quantity) < 0
        ) {

            return res.status(400).json({
                message:
                    "Valid stock quantity is required."
            });
        }


        if (
            reorder_level === undefined ||
            reorder_level === "" ||
            Number(reorder_level) < 0
        ) {

            return res.status(400).json({
                message:
                    "Valid reorder level is required."
            });
        }


        const sql = `
            UPDATE medicines
            SET
                quantity = ?,
                reorder_level = ?
            WHERE medicine_id = ?
        `;


        db.query(
            sql,
            [
                Number(quantity),
                Number(reorder_level),
                medicineId
            ],
            (error, result) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message:
                            "Failed to update stock."
                    });
                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Medicine not found."
                    });
                }


                res.json({
                    message:
                        "Stock updated successfully."
                });
            }
        );
    }
);


module.exports = router;