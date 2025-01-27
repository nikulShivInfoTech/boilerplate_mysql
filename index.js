const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { database } = require('./app/helper/db');
const router = require('./app/router/route');
const logger = require('./app/helper/logger');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', router);

database();

const port = process.env.PORT;
app.listen(port, () => {
  logger.info(`Your app is running on server: ${port}`);
});
