const { db } = require('../models/otpTableModel');
const {
  testimonial,
  testimonialEdit,
} = require('../validations/testimonialValidate');
const logger = require('../helper/logger');
const { GeneralResponse } = require('../helper/response');
const { StatusCodes } = require('http-status-codes');
const responseStatus = require('../utils/enum');
const message = require('../utils/message');
const { search, sort, paginate } = require('../services/commanFunction');

const addTestimonial = async (req, res) => {
  const { name, description, rating } = req.body;
  const { error } = testimonial.validate(req.body);

  if (error) {
    logger.error(error.details[0].message);

    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.BAD_REQUEST,
          error.details[0].message,
        ),
      );
  }

  const insertQuery = `
        INSERT INTO testimonial (name, description, rating, created_at, updated_at, isDeleted)
        VALUES (?, ?, ?, NOW(), NOW(), FALSE)
    `;

  try {
    db.query(insertQuery, [name, description, rating], (err, result) => {

      if (err) {
        logger.error(`${message.FAILED_TO} add testimonial`, err);

        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            new GeneralResponse(
              responseStatus.RESPONSE_ERROR,
              StatusCodes.BAD_REQUEST,
              `${message.FAILED_TO} add testimonial`,
            ),
          );
      }
      logger.info(`Testimonial ${message.ADD_SUCCESS}`);

      return res
        .status(StatusCodes.CREATED)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.CREATED,
            `Testimonial ${message.ADD_SUCCESS}`,
          ),
        );
    });
  } catch (err) {
    logger.error(message.INTERNAL_SERVER_ERROR, err);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
        ),
      );
  }
};

const testimonialView = async (req, res) => {
  const { id } = req.params;

  const query = `
        SELECT id, name, description, rating, created_at, updated_at
        FROM testimonial
        WHERE isDeleted = FALSE
        ${id ? 'AND id = ?' : ''}
    `;
  const data = id ? [id] : [];

  try {
    db.query(query, data, (err, results) => {
      if (err) {
        logger.error(`${message.FAILED_TO} fetch testimonial`, err);

        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            new GeneralResponse(
              responseStatus.RESPONSE_ERROR,
              StatusCodes.BAD_REQUEST,
              `${message.FAILED_TO} fetch testimonial`,
            ),
          );

      }
      if (results.length === 0) {

        return res
          .status(StatusCodes.NOT_FOUND)
          .json(
            new GeneralResponse(
              responseStatus.RESPONSE_ERROR,
              StatusCodes.NOT_FOUND,
              `Testimonial ${message.NOT_FOUND}`,
            ),
          );

      } else {
        logger.info(`Testimonials ${message.FETCH_SUCCESS}`);

        return res
          .status(StatusCodes.OK)
          .json(
            new GeneralResponse(
              responseStatus.RESPONSE_SUCCESS,
              StatusCodes.OK,
              `Testimonials ${message.FETCH_SUCCESS}`,
              results,
            ),
          );
      }

    });
  } catch (err) {
    logger.error(message.INTERNAL_SERVER_ERROR, err);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
        ),
      );
  }

};

const listTestimonial = async (req, res) => {
  const { searchKey, searchValue, sortBy, order, page, limit } = req.body;

  try {
    const selectQuery = `
            SELECT id, name, description, rating, created_at, updated_at
            FROM testimonial
            WHERE isDeleted = FALSE
        `;

    db.query(selectQuery, (err, results) => {
      if (err) {
        logger.error(`${message.FAILED_TO} retrieve testimonials:`, err);

        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            new GeneralResponse(
              responseStatus.RESPONSE_ERROR,
              StatusCodes.BAD_REQUEST,
              `${message.FAILED_TO} retrieve testimonials`,
            ),
          );
      }

      let filteredData = search(results, searchKey, searchValue);
      filteredData = sort(filteredData, sortBy, order);
      const paginatedData = paginate(
        filteredData,
        parseInt(page) || 1,
        parseInt(limit) || 10,
      );

      if (paginatedData.length === 0) {
        return res.status(StatusCodes.OK).json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.OK,
            message.NO_DATA_AVAILABLE,
            {
              total: 0,
              page: parseInt(page) || 1,
              limit: parseInt(limit) || 10,
              testimonials: [],
            },
          ),
        );
      }

      logger.info(`Testimonials ${message.FETCH_SUCCESS}`);
      return res.status(StatusCodes.OK).json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Testimonials ${message.FETCH_SUCCESS}`,
          {
            total: filteredData.length,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            testimonials: paginatedData,
          },
        ),
      );
    });

  } catch (error) {
    logger.error(message.INTERNAL_SERVER_ERROR, error);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
        ),
      );
  }
};

const editTestimonial = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, rating } = req.body;
  
      const { error } = testimonialEdit.validate(req.body);
      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json(

          new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            error.details[0].message
          )
        );
      }
  
      let updates = [];
      let data = [];
  
      if (name) {
        updates.push("name = ?");
        data.push(name);
      }
      if (description) {
        updates.push("description = ?");
        data.push(description);
      }
      if (rating) {
        updates.push("rating = ?");
        data.push(rating);
      }
  
      if (updates.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            `${message.NO_FIELDS_PROVIDED} for update`
          )
        );
      }
  

      updates.push("updated_at = NOW()");
      data.push(id);
  
      const updateQuery = `
        UPDATE testimonial
        SET ${updates.join(", ")}
        WHERE id = ? AND isDeleted = FALSE
      `;
  

      db.query(updateQuery, data, (err, result) => {
        if (err) {
          logger.error(`${message.FAILED_TO} update testimonial:`, err);
          return res.status(StatusCodes.BAD_REQUEST).json(
            new GeneralResponse(
                responseStatus.RESPONSE_ERROR,
              StatusCodes.BAD_REQUEST,
              `${message.FAILED_TO} update testimonial`
            )
          );
        }
  
        if (result.affectedRows === 0) {
          return res.status(StatusCodes.NOT_FOUND).json(
            new GeneralResponse(
              "error",
              StatusCodes.NOT_FOUND,
              `Testimonial ${message.NOT_FOUND}`
            )
          );
        }
  
        logger.info(`Testimonial ${message.UPDATE_SUCCESS}`);
        return res.status(StatusCodes.OK).json(
          new GeneralResponse(
            "success",
            StatusCodes.OK,
            `Testimonial ${message.UPDATE_SUCCESS}`
          )
        );
      });
    } catch (error) {
      logger.error("Unexpected error in editTestimonial:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        new GeneralResponse(
          "error",
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.SERVER_ERROR
        )
      );
    }
  };
  

const deleteTestimonial = (req, res) => {
  const { id } = req.params;

  const deleteQuery = `
        UPDATE testimonial
        SET isDeleted = TRUE, updated_at = NOW()
        WHERE id = ? AND isDeleted = FALSE
    `;

  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      logger.error(`${message.FAILED_TO} delete testimonial:`, err);

      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            `${message.FAILED_TO} delete testimonial`,
          ),
        );
    }
    if (result.affectedRows === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Testimonial ${message.NOT_FOUND}`,
          ),
        );
    }
    
    logger.info(`Testimonial ${message.DELETE_SUCCESS}`);
    return res
      .status(StatusCodes.OK)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Testimonial ${message.DELETE_SUCCESS}`,
        ),
      );
  });
};

module.exports = {
  addTestimonial,
  testimonialView,
  listTestimonial,
  editTestimonial,
  deleteTestimonial,
};
