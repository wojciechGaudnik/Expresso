const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');

const apiRouter = require("./api/api");
const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('short'));
app.use('/api', apiRouter);

app.use(errorHandler());

app.listen(PORT, function () {
    console.log(`Listen on port ${PORT}`);
});

module.exports = app;