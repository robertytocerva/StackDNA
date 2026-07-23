require('dotenv').config();
const express = require('express');
const cors = require('cors');
const catalogRoutes = require('./modules/catalog/catalog.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', catalogRoutes);
app.use('/api/admin', adminRoutes);
app.use(errorHandler);

module.exports = app;
