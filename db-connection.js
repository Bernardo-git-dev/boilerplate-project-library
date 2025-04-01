const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.DB;

const db = mongoose.connect(uri);

module.exports = db;