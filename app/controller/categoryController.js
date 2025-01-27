const { db } = require('../models/otpTableModel');
const { category } = require('../validations/categoryValidation');
const logger = require('../helper/logger');
const { GeneralResponse } = require('../helper/response');
const { StatusCodes } = require('http-status-codes');
const responseStatus = require('../utils/enum');
const message = require('../utils/message');
const { search, sort, paginate } = require('../services/commanFunction');

const add_Category = async (req, res) => {
  const { category_name } = req.body;
  const { error } = category.validate(req.body);

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

  const insertQuery = 'INSERT INTO category (category_name) VALUES (?)';

  db.query(insertQuery, [category_name], (err, result) => {
    if (err) {
      logger.error('Error inserting category:', err);

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

    const categoryData = {
      id: result.insertId,
      category_name,
    };

    return res
      .status(StatusCodes.CREATED)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.CREATED,
          message.CATEGORY_ADD_SUCCESS,
          categoryData,
        ),
      );
  });
};

const view_Category = async (req, res) => {
  const { searchKey, searchValue, sortBy, order, page, limit } = req.body;
  const selectQuery = 'SELECT * FROM category';

  db.query(selectQuery, (err, results) => {
    if (err) {
      logger.error('Error retrieving categories:', err);

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

    let filteredData = search(results, searchKey, searchValue);

    filteredData = sort(filteredData, sortBy, order);

    const paginatedData = paginate(
      filteredData,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 10,
    );

    logger.info(message.CATEGORY_FETCH_SUCCESS);

    return res.status(StatusCodes.OK).json(
      new GeneralResponse(
        responseStatus.RESPONSE_SUCCESS,
        StatusCodes.OK,
        message.CATEGORY_FETCH_SUCCESS,
        {
          total: filteredData.length,
          page: parseInt(page, 10) || 1,
          limit: parseInt(limit, 10) || 10,
          categories: paginatedData,
        },
      ),
    );
  });
};

const edit_category = async (req, res) => {
  const { category_name } = req.body;
  const { id } = req.params;
  const updateQuery = 'UPDATE category SET category_name = ? WHERE id = ?';

  db.query(updateQuery, [category_name, id], (err, result) => {
    if (err) {
      logger.error(message.INTERNAL_SERVER_ERROR);

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

    if (result.affectedRows === 0) {
      logger.error(message.CATEGORY_NOT_FOUND);

      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            message.CATEGORY_NOT_FOUND,
          ),
        );
    }

    logger.info(message.CATEGORY_UPDATE_SUCCESS);

    return res.status(StatusCodes.OK).json(
      new GeneralResponse(
        responseStatus.RESPONSE_SUCCESS,
        StatusCodes.OK,
        message.CATEGORY_UPDATE_SUCCESS,
        {
          id,
          category_name,
        },
      ),
    );
  });
};

const delete_category = async (req, res) => {
  const { id } = req.params;
  const deleteQuery = 'DELETE FROM category WHERE id = ?';

  try {
    db.query(deleteQuery, [id], (err, result) => {
      if (result.affectedRows === 0) {
        logger.error(message.CATEGORY_NOT_FOUND);

        return res
          .status(StatusCodes.NOT_FOUND)
          .json(
            new GeneralResponse(
              responseStatus.RESPONSE_ERROR,
              StatusCodes.NOT_FOUND,
              message.CATEGORY_NOT_FOUND,
            ),
          );
      }

      logger.info(result);

      return res.status(StatusCodes.OK).json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.OK,
          message.CATEGORY_DELETE_SUCCESS,
          {
            id,
            category: result.category_name,
          },
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

module.exports = {
  add_Category,
  view_Category,
  edit_category,
  delete_category,
};
