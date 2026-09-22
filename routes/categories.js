const express = require("express");

const db = require("../config/db");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET ALL CATEGORIES
// =====================================================

router.get(
    "/",
    authenticateToken,
    (req, res) => {

        const sql = `
            SELECT
                category_id,
                category_name,
                description,
                created_at
            FROM categories
            ORDER BY category_id ASC
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
// SEARCH CATEGORIES
// =====================================================

router.get(
    "/search",
    authenticateToken,
    (req, res) => {

        const search = req.query.q || "";

        const keyword = `%${search}%`;

        const sql = `
            SELECT
                category_id,
                category_name,
                description,
                created_at
            FROM categories
            WHERE
                category_name LIKE ?
                OR description LIKE ?
            ORDER BY category_id ASC
        `;

        db.query(
            sql,
            [keyword, keyword],
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
// GET SINGLE CATEGORY
// =====================================================

router.get(
    "/:id",
    authenticateToken,
    (req, res) => {

        const categoryId = req.params.id;

        const sql = `
            SELECT
                category_id,
                category_name,
                description
            FROM categories
            WHERE category_id = ?
        `;

        db.query(
            sql,
            [categoryId],
            (error, results) => {

                if (error) {
                    console.error(error);

                    return res.status(500).json({
                        message: "Database error."
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        message: "Category not found."
                    });
                }

                res.json(results[0]);
            }
        );
    }
);


// =====================================================
// ADD CATEGORY
// =====================================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "pharmacist"),
    (req, res) => {

        const {
            category_name,
            description
        } = req.body;

        if (!category_name || !category_name.trim()) {

            return res.status(400).json({
                message: "Category name is required."
            });
        }

        const sql = `
            INSERT INTO categories
            (
                category_name,
                description
            )
            VALUES (?, ?)
        `;

        db.query(
            sql,
            [
                category_name.trim(),
                description || null
            ],
            (error, result) => {

                if (error) {

                    console.error(error);

                    if (error.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            message: "Category already exists."
                        });
                    }

                    return res.status(500).json({
                        message: "Failed to add category."
                    });
                }

                res.status(201).json({
                    message: "Category added successfully.",
                    category_id: result.insertId
                });
            }
        );
    }
);


// =====================================================
// UPDATE CATEGORY
// =====================================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "pharmacist"),
    (req, res) => {

        const categoryId = req.params.id;

        const {
            category_name,
            description
        } = req.body;

        if (!category_name || !category_name.trim()) {

            return res.status(400).json({
                message: "Category name is required."
            });
        }

        const sql = `
            UPDATE categories
            SET
                category_name = ?,
                description = ?
            WHERE category_id = ?
        `;

        db.query(
            sql,
            [
                category_name.trim(),
                description || null,
                categoryId
            ],
            (error, result) => {

                if (error) {

                    console.error(error);

                    if (error.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            message: "Category already exists."
                        });
                    }

                    return res.status(500).json({
                        message: "Failed to update category."
                    });
                }

                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        message: "Category not found."
                    });
                }

                res.json({
                    message: "Category updated successfully."
                });
            }
        );
    }
);


// =====================================================
// DELETE CATEGORY
// =====================================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    (req, res) => {

        const categoryId = req.params.id;

        const sql = `
            DELETE FROM categories
            WHERE category_id = ?
        `;

        db.query(
            sql,
            [categoryId],
            (error, result) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message:
                            "Cannot delete category. It may be used by medicines."
                    });
                }

                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        message: "Category not found."
                    });
                }

                res.json({
                    message: "Category deleted successfully."
                });
            }
        );
    }
);


module.exports = router;