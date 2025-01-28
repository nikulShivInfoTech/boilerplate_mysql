const { db } = require('../models/otpTableModel');
const { category } = require('../validations/categoryValidation');
const logger = require('../helper/logger');
const { GeneralResponse } = require('../helper/response');
const { StatusCodes } = require('http-status-codes');
const responseStatus = require('../utils/enum');
const message = require('../utils/message');
const { search, sort, paginate } = require('../services/commanFunction');

const addCategory = async (req, res) => {
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
    } else {
      const categoryData = {
        id: result.insertId,
      };

      return res
        .status(StatusCodes.CREATED)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.CREATED,
            `Category ${message.ADD_SUCCESS}`,
            categoryData,
          ),
        );
    }
  });
};

const listCategory = async (req, res) => {
  const { searchKey, searchValue, sortBy, order, page, limit } = req.body;
  const selectQuery =
    'SELECT id , category_name FROM category WHERE isDeleted = ?';

  db.query(selectQuery, [0], (err, results) => {
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
    } else {
      let filteredData = search(results, searchKey, searchValue);
      filteredData = sort(filteredData, sortBy, order);

      const paginatedData = paginate(
        filteredData,
        parseInt(page, 10) || 1,
        parseInt(limit, 10) || 10,
      );

      logger.info(`Categories ${message.FETCH_SUCCESS}`);

      return res.status(StatusCodes.OK).json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Categories ${message.FETCH_SUCCESS}`,
          {
            total: filteredData.length,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
            categories: paginatedData,
          },
        ),
      );
    }
  });
};

const viewCategory = async (req, res) => {
  const { id } = req.params;

  const selectQuery =
    'SELECT id, category_name FROM category WHERE id = ? AND isDeleted = ?';

  db.query(selectQuery, [id, 0], (err, results) => {
    if (err) {
      logger.error('Error retrieving category:', err);
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

    if (results.length === 0) {
      logger.info(`Category ${message.NOT_FOUND}`);

      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Category ${message.NOT_FOUND}`,
          ),
        );
    } else {
      logger.info(`Category ${message.FETCH_SUCCESS}`);

      return res
        .status(StatusCodes.OK)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.OK,
            `Category ${message.FETCH_SUCCESS}`,
            results[0],
          ),
        );
    }
  });
};

const editCategory = async (req, res) => {
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
      logger.error(`Category ${message.NOT_FOUND}`);

      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            `Category ${message.NOT_FOUND}`,
          ),
        );
    } else {
      logger.info(`Category ${message.UPDATE_SUCCESS}`);

      return res.status(StatusCodes.OK).json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Category ${message.UPDATE_SUCCESS}`,
          {
            id,
            category_name,
          },
        ),
      );
    }
  });
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const deleteQuery = 'UPDATE category SET isDeleted = ? WHERE id = ?';

  try {
    db.query(deleteQuery, [1, id], (err, result) => {
      if (err) {
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

      if (result.affectedRows === 0) {
        logger.error(`Category ${message.NOT_FOUND}`);

        return res
          .status(StatusCodes.NOT_FOUND)
          .json(
            new GeneralResponse(
              responseStatus.RESPONSE_ERROR,
              StatusCodes.NOT_FOUND,
              `Category ${message.NOT_FOUND}`,
            ),
          );
      } else {
        logger.info(result);
        return res.status(StatusCodes.OK).json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.OK,
            `Category ${message.DELETE_SUCCESS}`,
            {
              id,
            },
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

module.exports = {
  addCategory,
  listCategory,
  editCategory,
  deleteCategory,
  viewCategory,
};
