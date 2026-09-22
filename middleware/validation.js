
function validateRequiredFields(fields) {

    return (req, res, next) => {

        const missingFields = [];

        fields.forEach(field => {

            const value = req.body[field];

            if (
                value === undefined ||
                value === null ||
                String(value).trim() === ""
            ) {
                missingFields.push(field);
            }

        });


        if (missingFields.length > 0) {

            return res.status(400).json({

                message:
                    "Please provide all required fields.",

                missingFields

            });

        }


        next();

    };

}


function validatePositiveNumber(fieldName) {

    return (req, res, next) => {

        const value =
            Number(req.body[fieldName]);


        if (
            req.body[fieldName] === undefined ||
            req.body[fieldName] === ""
        ) {
            return res.status(400).json({

                message:
                    `${fieldName} is required.`

            });
        }


        if (
            Number.isNaN(value) ||
            value < 0
        ) {

            return res.status(400).json({

                message:
                    `${fieldName} must be a valid positive number.`

            });

        }


        next();

    };

}


function validatePositiveInteger(fieldName) {

    return (req, res, next) => {

        const value =
            Number(req.body[fieldName]);


        if (
            req.body[fieldName] === undefined ||
            req.body[fieldName] === ""
        ) {

            return res.status(400).json({

                message:
                    `${fieldName} is required.`

            });

        }


        if (
            !Number.isInteger(value) ||
            value < 0
        ) {

            return res.status(400).json({

                message:
                    `${fieldName} must be a valid whole number.`

            });

        }


        next();

    };

}


module.exports = {
    validateRequiredFields,
    validatePositiveNumber,
    validatePositiveInteger
};
