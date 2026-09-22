const express = require("express");
const db = require("../config/db");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET ALL SUPPLIERS
// =====================================================

router.get(
    "/",
    authenticateToken,
    (req, res) => {

        const sql = `
            SELECT
                supplier_id,
                supplier_name,
                company_name,
                phone,
                email,
                address,
                created_at
            FROM suppliers
            ORDER BY supplier_id ASC
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
// SEARCH SUPPLIERS
// =====================================================

router.get(
    "/search",
    authenticateToken,
    (req, res) => {

        const search = req.query.q || "";

        const keyword = `%${search}%`;

        const sql = `
            SELECT
                supplier_id,
                supplier_name,
                company_name,
                phone,
                email,
                address,
                created_at
            FROM suppliers
            WHERE
                supplier_name LIKE ?
                OR company_name LIKE ?
                OR phone LIKE ?
                OR email LIKE ?
            ORDER BY supplier_id ASC
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
// GET SINGLE SUPPLIER
// =====================================================

router.get(
    "/:id",
    authenticateToken,
    (req, res) => {

        const supplierId = req.params.id;

        const sql = `
            SELECT
                supplier_id,
                supplier_name,
                company_name,
                phone,
                email,
                address
            FROM suppliers
            WHERE supplier_id = ?
        `;

        db.query(
            sql,
            [supplierId],
            (error, results) => {

                if (error) {
                    console.error(error);

                    return res.status(500).json({
                        message: "Database error."
                    });
                }

                if (results.length === 0) {

                    return res.status(404).json({
                        message: "Supplier not found."
                    });
                }

                res.json(results[0]);
            }
        );
    }
);


// =====================================================
// ADD SUPPLIER
// =====================================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "pharmacist"),
    (req, res) => {

        const {
            supplier_name,
            company_name,
            phone,
            email,
            address
        } = req.body;


        if (
            !supplier_name ||
            !supplier_name.trim()
        ) {

            return res.status(400).json({
                message: "Supplier name is required."
            });
        }


        const sql = `
            INSERT INTO suppliers
            (
                supplier_name,
                company_name,
                phone,
                email,
                address
            )
            VALUES (?, ?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                supplier_name.trim(),
                company_name || null,
                phone || null,
                email || null,
                address || null
            ],
            (error, result) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message: "Failed to add supplier."
                    });
                }


                res.status(201).json({

                    message:
                        "Supplier added successfully.",

                    supplier_id:
                        result.insertId

                });
            }
        );
    }
);


// =====================================================
// UPDATE SUPPLIER
// =====================================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "pharmacist"),
    (req, res) => {

        const supplierId = req.params.id;

        const {
            supplier_name,
            company_name,
            phone,
            email,
            address
        } = req.body;


        if (
            !supplier_name ||
            !supplier_name.trim()
        ) {

            return res.status(400).json({
                message: "Supplier name is required."
            });
        }


        const sql = `
            UPDATE suppliers
            SET
                supplier_name = ?,
                company_name = ?,
                phone = ?,
                email = ?,
                address = ?
            WHERE supplier_id = ?
        `;


        db.query(
            sql,
            [
                supplier_name.trim(),
                company_name || null,
                phone || null,
                email || null,
                address || null,
                supplierId
            ],
            (error, result) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message:
                            "Failed to update supplier."
                    });
                }


                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        message: "Supplier not found."
                    });
                }


                res.json({
                    message:
                        "Supplier updated successfully."
                });
            }
        );
    }
);


// =====================================================
// DELETE SUPPLIER
// =====================================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const supplierId = req.params.id;

        const sql = `
            DELETE FROM suppliers
            WHERE supplier_id = ?
        `;


        db.query(
            sql,
            [supplierId],
            (error, result) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message:
                            "Cannot delete supplier. It may be used by medicines."
                    });
                }


                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        message: "Supplier not found."
                    });
                }


                res.json({
                    message:
                        "Supplier deleted successfully."
                });
            }
        );
    }
);


module.exports = router;