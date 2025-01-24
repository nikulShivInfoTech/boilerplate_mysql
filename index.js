const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { database } = require('./app/helper/db');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

database();

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Your app is running on server: ${port}`);
});
