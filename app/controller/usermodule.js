const {
    userRegistrationValidation,
    loginValidation,
    editUserValidation, passwordResetValidation, emailValidation
} = require('../validations/userValidation');
const { ensureTableExists, db } = require('../models/userTableModel');
const  otpTable= require('../models/otpTableModel');
const { GeneralResponse } = require('../helper/response');
const { StatusCodes } = require('http-status-codes');
const message = require('../utils/message');
const responseStatus = require('../utils/enum');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const logger = require('../helper/logger');
require('dotenv').config();

const interServerError = (res, message) => {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.INTERNAL_SERVER_ERROR,
            message
        )
    );
}
const BadRequest=(res,message)=>{
    return res.status(StatusCodes.BAD_REQUEST).json(
        new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            message,
        ),
    );
}
const registration = async (req, res) => {
    ensureTableExists();
    const { error } = userRegistrationValidation.validate(req.body);
    if (error) {
        return BadRequest(res,error.details[0].message)
    }
    const { name, email, password } = req.body;
    const insertQuery =
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);

    db.query(insertQuery, [name, email, hashedPassword], (err, result) => {
        if (err) {

            return interServerError(res, message.INTERNAL_SERVER_ERROR)
        }
        return res
            .status(StatusCodes.CREATED)
            .json(
                new GeneralResponse(
                    responseStatus.RESPONSE_SUCCESS,
                    StatusCodes.CREATED,
                    message.USER_REGISTERED,
                ),
            );
    });
};

const login = async (req, res) => {
    const { error } = loginValidation.validate(req.body);
    if (error) {
        return BadRequest(res,error.details[0].message)
    }

    const { email, password } = req.body;
    const selectQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(selectQuery, [email], async (err, results) => {
        if (err) {
            return interServerError(res, message.INTERNAL_SERVER_ERROR)
        }

        if (results.length === 0) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json(
                    new GeneralResponse(
                        responseStatus.RESPONSE_ERROR,
                        StatusCodes.NOT_FOUND,
                        message.USER_NOT_FOUND,
                    ),
                );
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(
                    new GeneralResponse(
                        responseStatus.RESPONSE_ERROR,
                        StatusCodes.UNAUTHORIZED,
                        message.INVALID_CREDENTIALS,
                    ),
                );
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '12h' },
        );

        return res
            .status(StatusCodes.OK)
            .json(
                new GeneralResponse(
                    responseStatus.RESPONSE_SUCCESS,
                    StatusCodes.OK,
                    message.LOGIN_SUCCESS,
                    { token },
                ),
            );
    });
};

const viewProfile = async (req, res) => {
    const id = req.user.id;
    const findQuery = 'SELECT * FROM users WHERE id = ?';
    db.query(findQuery, [id], (err, results) => {
        if (err) {
            return interServerError(res, message.INTERNAL_SERVER_ERROR)
        }

        if (results.length === 0) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json(
                    new GeneralResponse(
                        responseStatus.RESPONSE_ERROR,
                        StatusCodes.NOT_FOUND,
                        message.USER_NOT_FOUND,
                    ),
                );
        }

        const user = {
            id: results[0].id,
            name: results[0].name,
            email: results[0].email,
        };

        return res
            .status(StatusCodes.OK)
            .json(
                new GeneralResponse(
                    responseStatus.RESPONSE_SUCCESS,
                    StatusCodes.OK,
                    message.RETRIEVED_USER,
                    user,
                ),
            );
    });
};

const userEdit = async (req, res) => {
    const id = req.user.id;
    const { error, value } = editUserValidation.validate(req.body);
    if (error) {
        return BadRequest(res,error.details[0].message)
    }
    const { name, email } = value;

    const updateQuery = 'UPDATE users SET name = ?, email = ? WHERE id = ?';

    db.query(updateQuery, [name, email, id], (err, result) => {
        if (err) {
            return interServerError(res, message.INTERNAL_SERVER_ERROR)
        }

        if (result.affectedRows === 0) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json(
                    new GeneralResponse(
                        responseStatus.RESPONSE_ERROR,
                        StatusCodes.NOT_FOUND,
                        message.USER_NOT_FOUND,
                    ),
                );
        }

        return res
            .status(StatusCodes.ACCEPTED)
            .json(
                new GeneralResponse(
                    responseStatus.RESPONSE_SUCCESS,
                    StatusCodes.ACCEPTED,
                    message.USER_UPDATED,
                ),
            );
    });
};

const resetPassword = async (req, res) => {
    const id = req.user.id;
    const { error, value } = passwordResetValidation.validate(req.body);

    if (error) {
        return BadRequest(res,error.details[0].message)
    }

    const { currentPassword, newPassword } = value;


    const query = 'SELECT * FROM users WHERE id = ?';

    db.query(query, [id], async (err, result) => {
        if (err) {
            return interServerError(res, message.INTERNAL_SERVER_ERROR)
        }

        if (result.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json(
                new GeneralResponse(
                    responseStatus.RESPONSE_ERROR,
                    StatusCodes.NOT_FOUND,
                    message.USER_NOT_FOUND
                )
            );
        }

        const user = result[0];

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json(
                new GeneralResponse(
                    responseStatus.RESPONSE_ERROR,
                    StatusCodes.UNAUTHORIZED,
                    message.INCORRECT_CRNT_PASS
                )
            );
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Query to update the password in the database
        const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';

        db.query(updateQuery, [hashedNewPassword, id], (err, result) => {
            if (err) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
                    new GeneralResponse(
                        responseStatus.RESPONSE_ERROR,
                        StatusCodes.INTERNAL_SERVER_ERROR,
                        message.INTERNAL_SERVER_ERROR
                    )
                );
            }

            if (result.affectedRows === 0) {
                return res.status(StatusCodes.NOT_FOUND).json(
                    new GeneralResponse(
                        responseStatus.RESPONSE_ERROR,
                        StatusCodes.NOT_FOUND,
                        message.USER_NOT_FOUND
                    )
                );
            }

            return res.status(StatusCodes.OK).json(
                new GeneralResponse(
                    responseStatus.RESPONSE_SUCCESS,
                    StatusCodes.OK,
                    message.PASS_UPDATED
                )
            );
        });
    });
};












const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 900000);
};


const deleteExpiredOtp = (userId) => {
    const deleteQuery = `
        DELETE FROM password_reset_otp 
        WHERE user_id = ? AND created_at < NOW() - INTERVAL 2 MINUTE
    `;
    otpTable.db.query(deleteQuery, [userId], (err) => {
        if (err) {
            logger.info(err)
        } 
    });
};
const send_Mail_Of_OTP = async (req, res) => {
    try {
        const { email } = req.body;
        const { error } = emailValidation.validate(req.body);
        if (error) {
            return BadRequest(res, error.details[0].message);
        }

        await otpTable.ensureOtpTableExists();

        const query = 'SELECT * FROM users WHERE email = ?';
        otpTable.db.query(query, [email], async (err, result) => {
            if (err) {
                return interServerError(res, message.INTERNAL_SERVER_ERROR);
            }

            if (result.length === 0) {
                return res.status(StatusCodes.NOT_FOUND).json(
                    new GeneralResponse(
                        responseStatus.RESPONSE_ERROR,
                        StatusCodes.NOT_FOUND,
                        message.OTP_ERROR_EMAIL
                    )
                );
            }

            const otp = generateOTP();
            const userId = result[0].id;

            const otpQuery = `
                INSERT INTO password_reset_otp (user_id, otp, created_at) 
                VALUES (?, ?, NOW())
            `;
            db.query(otpQuery, [userId, otp], async (otpErr) => {
                if (otpErr) {
                    return interServerError(res, message.INTERNAL_SERVER_ERROR);
                }

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Password Reset OTP',
                    text: `Your OTP for resetting the password is: ${otp}. It is valid for 2 minutes.`,
                };
                try {
                    const dataemail = await transporter.sendMail(mailOptions);

                    setTimeout(() => {
                        deleteExpiredOtp(userId);
                    }, 2 * 60 * 1000); 

                    return res.status(StatusCodes.OK).json(
                        new GeneralResponse(
                            responseStatus.RESPONSE_SUCCESS,
                            StatusCodes.OK,
                            message.OTP_SEND_SUCCESS
                        )
                    );
                } catch (emailError) {
                    return interServerError(res, message.FAIL_SENT_OTP);
                }
            });
        });
    } catch (error) {
        return interServerError(res, message.INTERNAL_SERVER_ERROR);
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const query = `
            SELECT otp, created_at 
            FROM password_reset_otp 
            WHERE user_id = (SELECT id FROM users WHERE email = ?) 
            ORDER BY created_at DESC LIMIT 1
        `;

        otpTable.db.query(query, [email], async (err, result) => {
            if (err) {
                return interServerError(res, message.INTERNAL_SERVER_ERROR);
            }

            if (result.length === 0) {
                return BadRequest(res, message.OTP_NOT_FOUND);
            }

            const { otp: storedOtp, created_at } = result[0];
            const currentTime = new Date();
            const otpCreatedTime = new Date(created_at);
            const timeDifference = (currentTime - otpCreatedTime) / 1000; 

            if (timeDifference > 120) { 
                return BadRequest(res, message.OTP_EXPIRED);
            }

            if (otp !== storedOtp) {
                return BadRequest(res, message.INVALID_OTP);
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updatePasswordQuery = `
                UPDATE users 
                SET password = ? 
                WHERE email = ?
            `;
            db.query(updatePasswordQuery, [hashedPassword, email], (updateErr) => {
                if (updateErr) {
                    return interServerError(res, message.INTERNAL_SERVER_ERROR);
                }

                const deleteOtpQuery = `
                    DELETE FROM password_reset_otp 
                    WHERE user_id = (SELECT id FROM users WHERE email = ?)
                `;
                otpTable.db.query(deleteOtpQuery, [email], (deleteErr) => {
                    if (deleteErr) {
                        logger.info(deleteErr)
                    }
                });

                return res.status(StatusCodes.OK).json(
                    new GeneralResponse(
                        responseStatus.RESPONSE_SUCCESS,
                        StatusCodes.OK,
                        message.PASSWORD_RESET_SUCCESS
                    )
                );
            });
        });
    } catch (error) {
        return interServerError(res, message.INTERNAL_SERVER_ERROR);
    }
};

module.exports = { registration, login, viewProfile, userEdit, resetPassword, forgotPassword, send_Mail_Of_OTP };
