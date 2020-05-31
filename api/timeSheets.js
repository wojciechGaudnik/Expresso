const express = require('express');
const timeSheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || 'database.sqlite');

timeSheetsRouter.get('/', ((req, res, next) => {
    db.all(`select * from TimeSheet where employee_id = ${req.params.employeeId}`, (err, timeSheets) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({timeSheets: timeSheets});
        }
    });
}));

module.exports = timeSheetsRouter;
