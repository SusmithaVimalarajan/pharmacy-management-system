
const express = require("express");

const db = require("../config/db");

const {
    authenticateToken
} = require("../middleware/authMiddleware");


const router = express.Router();


router.get(
    "/summary",
    authenticateToken,
    (req, res) => {

        const queries = {

            medicines: `
                SELECT COUNT(*) AS total
                FROM medicines
            `,

            stock: `
                SELECT COALESCE(SUM(quantity), 0) AS total
                FROM medicines
            `,

            lowStock: `
                SELECT
                    medicine_name,
                    quantity,
                    reorder_level
                FROM medicines
                WHERE quantity <= reorder_level
                ORDER BY quantity ASC
            `,

            sales: `
                SELECT COALESCE(SUM(total_amount), 0) AS total
                FROM sales
            `

        };


        db.query(
            queries.medicines,
            (error, medicineResult) => {

                if (error) {
                    console.error(error);

                    return res.status(500).json({
                        message: "Database error"
                    });
                }


                db.query(
                    queries.stock,
                    (error, stockResult) => {

                        if (error) {
                            console.error(error);

                            return res.status(500).json({
                                message: "Database error"
                            });
                        }


                        db.query(
                            queries.lowStock,
                            (error, lowStockResult) => {

                                if (error) {
                                    console.error(error);

                                    return res.status(500).json({
                                        message: "Database error"
                                    });
                                }


                                db.query(
                                    queries.sales,
                                    (error, salesResult) => {

                                        if (error) {
                                            console.error(error);

                                            return res.status(500).json({
                                                message: "Database error"
                                            });
                                        }


                                        res.json({

                                            totalMedicines:
                                                medicineResult[0].total,

                                            totalStock:
                                                stockResult[0].total,

                                            lowStock:
                                                lowStockResult.length,

                                            totalSales:
                                                salesResult[0].total,

                                            lowStockMedicines:
                                                lowStockResult

                                        });

                                    }
                                );

                            }
                        );

                    }
                );

            }
        );

    }
);


module.exports = router;

