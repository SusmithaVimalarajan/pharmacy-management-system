
const express = require("express");

const db = require("../config/db");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET ALL MEDICINES
// =====================================================

router.get(
    "/",
    authenticateToken,
    (req, res) => {

        const sql = `
            SELECT
                m.medicine_id,
                m.medicine_name,
                m.category_id,
                c.category_name,
                m.supplier_id,
                s.supplier_name,
                m.batch_number,
                m.purchase_price,
                m.selling_price,
                m.quantity,
                m.reorder_level,
                m.expiry_date,
                m.created_at
            FROM medicines m
            LEFT JOIN categories c
                ON m.category_id = c.category_id
            LEFT JOIN suppliers s
                ON m.supplier_id = s.supplier_id
            ORDER BY m.medicine_id ASC
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
// SEARCH MEDICINES
// =====================================================

router.get(
    "/search",
    authenticateToken,
    (req, res) => {

        const search =
            req.query.q || "";

        const sql = `
            SELECT
                m.medicine_id,
                m.medicine_name,
                m.category_id,
                c.category_name,
                m.supplier_id,
                s.supplier_name,
                m.batch_number,
                m.purchase_price,
                m.selling_price,
                m.quantity,
                m.reorder_level,
                m.expiry_date
            FROM medicines m
            LEFT JOIN categories c
                ON m.category_id = c.category_id
            LEFT JOIN suppliers s
                ON m.supplier_id = s.supplier_id
            WHERE
                m.medicine_name LIKE ?
                OR m.batch_number LIKE ?
                OR c.category_name LIKE ?
            ORDER BY m.medicine_id ASC
        `;

        const keyword =
            `%${search}%`;

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
// GET SINGLE MEDICINE
// =====================================================

router.get(
    "/:id",
    authenticateToken,
    (req, res) => {

        const medicineId =
            req.params.id;

        const sql = `
            SELECT
                m.medicine_id,
                m.medicine_name,
                m.category_id,
                c.category_name,
                m.supplier_id,
                s.supplier_name,
                m.batch_number,
                m.purchase_price,
                m.selling_price,
                m.quantity,
                m.reorder_level,
                m.expiry_date
            FROM medicines m
            LEFT JOIN categories c
                ON m.category_id = c.category_id
            LEFT JOIN suppliers s
                ON m.supplier_id = s.supplier_id
            WHERE m.medicine_id = ?
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

                if (results.length === 0) {

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
// ADD MEDICINE
// =====================================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "admin",
        "pharmacist"
    ),
    (req, res) => {

        const {
            medicine_name,
            category_id,
            supplier_id,
            batch_number,
            purchase_price,
            selling_price,
            quantity,
            reorder_level,
            expiry_date
        } = req.body;


        // =========================
        // REQUIRED FIELD VALIDATION
        // =========================

        if (
            !medicine_name ||
            selling_price === undefined ||
            selling_price === ""
        ) {

            return res.status(400).json({
                message:
                    "Medicine name and selling price are required."
            });

        }


        // =========================
        // SELLING PRICE VALIDATION
        // =========================

        if (
            Number.isNaN(
                Number(selling_price)
            ) ||
            Number(selling_price) < 0
        ) {

            return res.status(400).json({
                message:
                    "Selling price must be a valid positive number."
            });

        }


        // =========================
        // PURCHASE PRICE VALIDATION
        // =========================

        if (
            purchase_price !== undefined &&
            purchase_price !== "" &&
            (
                Number.isNaN(
                    Number(purchase_price)
                ) ||
                Number(purchase_price) < 0
            )
        ) {

            return res.status(400).json({
                message:
                    "Purchase price must be a valid positive number."
            });

        }


        // =========================
        // QUANTITY VALIDATION
        // =========================

        if (
            quantity !== undefined &&
            quantity !== "" &&
            (
                !Number.isInteger(
                    Number(quantity)
                ) ||
                Number(quantity) < 0
            )
        ) {

            return res.status(400).json({
                message:
                    "Quantity must be a valid whole number."
            });

        }


        // =========================
        // REORDER LEVEL VALIDATION
        // =========================

        if (
            reorder_level !== undefined &&
            reorder_level !== "" &&
            (
                !Number.isInteger(
                    Number(reorder_level)
                ) ||
                Number(reorder_level) < 0
            )
        ) {

            return res.status(400).json({
                message:
                    "Reorder level must be a valid whole number."
            });

        }


        // =========================
        // INSERT MEDICINE
        // =========================

        const sql = `
            INSERT INTO medicines
            (
                medicine_name,
                category_id,
                supplier_id,
                batch_number,
                purchase_price,
                selling_price,
                quantity,
                reorder_level,
                expiry_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                medicine_name.trim(),
                category_id || null,
                supplier_id || null,
                batch_number || null,
                purchase_price || 0,
                selling_price,
                quantity || 0,
                reorder_level || 10,
                expiry_date || null
            ],
            (error, result) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message:
                            "Failed to add medicine."
                    });
                }


                res.status(201).json({

                    message:
                        "Medicine added successfully.",

                    medicine_id:
                        result.insertId

                });

            }
        );

    }
);


// =====================================================
// UPDATE MEDICINE
// =====================================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "admin",
        "pharmacist"
    ),
    (req, res) => {

        const medicineId =
            req.params.id;


        const {
            medicine_name,
            category_id,
            supplier_id,
            batch_number,
            purchase_price,
            selling_price,
            quantity,
            reorder_level,
            expiry_date
        } = req.body;


        // =========================
        // REQUIRED FIELD VALIDATION
        // =========================

        if (
            !medicine_name ||
            selling_price === undefined ||
            selling_price === ""
        ) {

            return res.status(400).json({
                message:
                    "Medicine name and selling price are required."
            });

        }


        // =========================
        // SELLING PRICE VALIDATION
        // =========================

        if (
            Number.isNaN(
                Number(selling_price)
            ) ||
            Number(selling_price) < 0
        ) {

            return res.status(400).json({
                message:
                    "Selling price must be a valid positive number."
            });

        }


        // =========================
        // PURCHASE PRICE VALIDATION
        // =========================

        if (
            purchase_price !== undefined &&
            purchase_price !== "" &&
            (
                Number.isNaN(
                    Number(purchase_price)
                ) ||
                Number(purchase_price) < 0
            )
        ) {

            return res.status(400).json({
                message:
                    "Purchase price must be a valid positive number."
            });

        }


        // =========================
        // QUANTITY VALIDATION
        // =========================

        if (
            quantity !== undefined &&
            quantity !== "" &&
            (
                !Number.isInteger(
                    Number(quantity)
                ) ||
                Number(quantity) < 0
            )
        ) {

            return res.status(400).json({
                message:
                    "Quantity must be a valid whole number."
            });

        }


        // =========================
        // REORDER LEVEL VALIDATION
        // =========================

        if (
            reorder_level !== undefined &&
            reorder_level !== "" &&
            (
                !Number.isInteger(
                    Number(reorder_level)
                ) ||
                Number(reorder_level) < 0
            )
        ) {

            return res.status(400).json({
                message:
                    "Reorder level must be a valid whole number."
            });

        }


        // =========================
        // UPDATE MEDICINE
        // =========================

        const sql = `
            UPDATE medicines
            SET
                medicine_name = ?,
                category_id = ?,
                supplier_id = ?,
                batch_number = ?,
                purchase_price = ?,
                selling_price = ?,
                quantity = ?,
                reorder_level = ?,
                expiry_date = ?
            WHERE medicine_id = ?
        `;


        db.query(
            sql,
            [
                medicine_name.trim(),
                category_id || null,
                supplier_id || null,
                batch_number || null,
                purchase_price || 0,
                selling_price,
                quantity || 0,
                reorder_level || 10,
                expiry_date || null,
                medicineId
            ],
            (error, result) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message:
                            "Failed to update medicine."
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
                        "Medicine updated successfully."

                });

            }
        );

    }
);


// =====================================================
// DELETE MEDICINE
// =====================================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const medicineId =
            req.params.id;


        const sql = `
            DELETE FROM medicines
            WHERE medicine_id = ?
        `;


        db.query(
            sql,
            [medicineId],
            (error, result) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message:
                            "Failed to delete medicine."
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
                        "Medicine deleted successfully."

                });

            }
        );

    }
);


module.exports = router;
