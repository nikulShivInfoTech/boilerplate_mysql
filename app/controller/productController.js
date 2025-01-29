const { db } = require('../models/userTableModel');
const { product, productEdit } = require('../validations/ptoductValidate');
const logger = require('../helper/logger');
const { GeneralResponse } = require('../helper/response');
const { StatusCodes } = require('http-status-codes');
const responseStatus = require('../utils/enum');
const message = require('../utils/message');
const { search, sort, paginate } = require('../services/commanFunction');
const { Logger } = require('winston');

const productAdd = async (req, res) => {
  const { category_id, product_name, description } = req.body;
  const { error } = product.validate(req.body);

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
      INSERT INTO product (category_id, product_name, description, image, created_at, updated_at, isDeleted)
      VALUES (?, ?, ?, '[]', NOW(), NOW(), FALSE)
    `;

  try {
    db.query(
      insertQuery,
      [category_id, product_name, description],
      (err, result) => {
        if (err) {
          logger.error(`${message.FAILED_TO} add product`, err);

          return res
            .status(StatusCodes.BAD_REQUEST)
            .json(
              new GeneralResponse(
                responseStatus.RESPONSE_ERROR,
                StatusCodes.BAD_REQUEST,
               `${message.FAILED_TO} add product`,
              ),
            );
        } else {
          logger.info(`Product ${message.ADD_SUCCESS}`);

          return res
            .status(StatusCodes.CREATED)
            .json(
              new GeneralResponse(
                responseStatus.RESPONSE_SUCCESS,
                StatusCodes.CREATED,
                `Product ${message.ADD_SUCCESS}`,
              ),
            );
        }
      },
    );
  } catch (err) {
    logger.error(`${message.INTERNAL_SERVER_ERROR}`);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          `${message.INTERNAL_SERVER_ERROR}`,
        ),
      );
  }
};

const productImageUpload = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.BAD_REQUEST,
          `Product ${message.ID_REQUIRED}`,
        ),
      );
  }

  if (!req.files || req.files.length === 0) {

    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.BAD_REQUEST,
          `${message.MIN_IMAGE_ERROR}`,
        ),
      );
  }

  const imagePaths = req.files.map((file) => {
    if (!file.filename) {
      throw new Error('Image file is missing a filename.');
    }
    return `/uploads/${file.filename}`;
  });

  try {
    const selectQuery = 'SELECT image FROM product WHERE id = ?';
    db.query(selectQuery, [id], (err, results) => {
      if (err) {
        logger.error(`${message.FAILED_TO} add product image`, err);
        return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
          `${message.FAILED_TO} add product image`,
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
              `Product ${message.NOT_FOUND}`,
            ),
          );
      }
      const existingImages = JSON.parse(results[0].image || '[]');
      const updatedImages = [...existingImages, ...imagePaths];

      const updateQuery = 'UPDATE product SET image = ? WHERE id = ?';
      db.query(
        updateQuery,
        [JSON.stringify(updatedImages), id],
        (updateErr) => {
          if (updateErr) {
            logger.error(`${message.FAILED_TO} updating product`, updateErr);

            return res
              .status(StatusCodes.BAD_REQUEST)
              .json(
                new GeneralResponse(
                  responseStatus.RESPONSE_ERROR,
                  StatusCodes.BAD_REQUEST,
                  `${message.IMAGE_UPLOAD_ERROR}`,
                ),
              );

          } else {
            logger.info(`Images ${message.ADD_SUCCESS}`);

            return res
              .status(StatusCodes.ACCEPTED)
              .json(
                new GeneralResponse(
                  responseStatus.RESPONSE_SUCCESS,
                  StatusCodes.ACCEPTED,
                  `Images ${message.ADD_SUCCESS}`,
                ),
              );
          }
        },
      );
    });
  } catch (err) {
    logger.error(INTERNAL_SERVER_ERROR, err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          `${message.UNEXPECTED_ERROR}`,
        ),
      );
  }
};

const productView = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
        SELECT 
          product.id AS product_id,
          product.product_name,
          product.description,
          product.image,
          product.created_at,
          product.updated_at,
          category.id AS category_id,
          category.category_name AS category_name
        FROM 
          product
        LEFT JOIN 
          category 
        ON 
          product.category_id = category.id
        WHERE 
          product.isDeleted = FALSE
        ${id ? 'AND product.id = ?' : ''}
      `;

    const queryParams = id ? [id] : [];
    db.query(query, queryParams, (err, results) => {
      if (err) {
        logger.error(`${message.FAILED_TO} fetch product`, err);

        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            new GeneralResponse(
              responseStatus.RESPONSE_ERROR,
              StatusCodes.BAD_REQUEST,
              `${message.FAILED_TO} fetch product`,
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
              `Product ${message.NOT_FOUND}`,
            ),
          );
      }

      logger.info(`Products ${message.FETCH_SUCCESS}`);
      return res
        .status(StatusCodes.OK)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.OK,
            `Products ${message.FETCH_SUCCESS}`,
            results,
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
          `${message.INTERNAL_SERVER_ERROR}`,
        ),
      );
  }
};

const listProduct = async (req, res) => {
  const { searchKey, searchValue, sortBy, order, page, limit } = req.body;

  try {
    const selectQuery = `
        SELECT 
          product.id AS product_id,
          product.product_name,
          product.description,
          product.image,
          product.created_at,
          product.updated_at,
          category.id AS category_id,
          category.category_name AS category_name
        FROM 
          product
        LEFT JOIN 
          category 
        ON 
          product.category_id = category.id
        WHERE 
          product.isDeleted = FALSE
      `;

    db.query(selectQuery, (err, results) => {
      if (err) {
        logger.error(`${message.FAILED_TO} retrieving products:`, err);
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            new GeneralResponse(
              responseStatus.RESPONSE_ERROR,
              StatusCodes.BAD_REQUEST,
              `${message.FAILED_TO} retrieving products`,
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

      if (paginatedData.length === 0) {
        return res.status(StatusCodes.OK).json(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.OK,
            message.NO_DATA_AVAILABLE,
            {
              total: 0,
              page: parseInt(page, 10) || 1,
              limit: parseInt(limit, 10) || 10,
              products: [],
            },
          ),
        );
      }

      logger.info(`Products ${message.FETCH_SUCCESS}`);
      return res.status(StatusCodes.OK).json(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.OK,
          `Products ${message.FETCH_SUCCESS}`,
          {
            total: filteredData.length,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
            products: paginatedData,
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

const editProduct = (req, res) => {
  const { id } = req.params;
  const { product_name, description, category_id } = req.body;

  const { error } = productEdit.validate(req.body);

  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.BAD_REQUEST,
          `${error.details[0].message}`,
        ),
      );
  }

  let image = [];
  if (req.files && req.files.length > 0) {
    image = req.files.map((file) => file.filename);
    image = `/uploads/${image}`;
  } else {
    image = [];
  }
  const imageArray = JSON.stringify(image);

  const updated_at = new Date().toISOString();

  const updateQuery = `
        UPDATE product
        SET 
          product_name = ?,
          description = ?,
          image = ?,
          updated_at = ?,
          category_id = ?
        WHERE id = ? AND isDeleted = FALSE
    `;

  const queryParams = [
    product_name,
    description,
    imageArray,
    updated_at,
    category_id,
    id,
  ];

  db.query(updateQuery, queryParams, (err, result) => {
    if (err) {
      logger.error(`${message.FAILED_TO} updating product:`, err);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          new GeneralResponse(
            responseStatus.RESPONSE_ERROR,
            StatusCodes.BAD_REQUEST,
            `${message.FAILED_TO} updating product:`,
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
            `Product ${message.NOT_FOUND}`,
          ),
        );
    }

    logger.info(`product ${message.UPDATE_SUCCESS}` );
    return res.status(StatusCodes.OK).json(
      new GeneralResponse(
        responseStatus.RESPONSE_SUCCESS,
        StatusCodes.OK,
        `Product ${message.UPDATE_SUCCESS}`,
        {
          product_id: id,
          product_name,
          description,
          image: imageArray,
          category_id,
          updated_at,
        },
      ),
    );
  });
};

const deleteProduct = (req, res) => {
  const { id } = req.params;

  if (!id) {

    return res
      .status(StatusCodes.NOT_FOUND)
      .json(
        new GeneralResponse(
          responseStatus.RESPONSE_ERROR,
          StatusCodes.NOT_FOUND,
          message.ID_REQUIRED,
        ),
      );

  } else {
    const deleteQuery = `UPDATE product SET isDeleted = ?, image = ? WHERE id = ?`;

    db.query(deleteQuery, [true, '[]', id], (err, result) => {
      if (err) {
        logger.error(`${message.FAILED_TO} delete product`, err);

        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            new GeneralResponse(
              responseStatus.RESPONSE_ERROR,
              StatusCodes.BAD_REQUEST,
              `${message.FAILED_TO} delete product`,
            ),
          );

      } else {
        if (result.affectedRows === 0) {

          return res
            .status(StatusCodes.NOT_FOUND)
            .json(
              new GeneralResponse(
                responseStatus.RESPONSE_ERROR,
                StatusCodes.NOT_FOUND,
                ` Product ${message.NOT_FOUND}`,
              ),
            );

        } else {

          return res
            .status(StatusCodes.OK)
            .json(
              new GeneralResponse(
                responseStatus.RESPONSE_SUCCESS,
                StatusCodes.OK,
              ` Product ${message.DELETE_SUCCESS}`,
              ),
            );
        }

      }
    });
  }
};

module.exports = {
  productAdd,
  productImageUpload,
  productView,
  listProduct,
  editProduct,
  deleteProduct,
};
