const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || 'database.sqlite');
console.log(process.env.TEST_DATABASE);

employeesRouter.get('/', (req, res, next) => {
    db.all(`select * from Employee where is_current_employee = 1`, (err, employees) => {
        if (err) {
            next(err);
        } else {
            console.log("200");
            res.status(200).json({employees: employees})
        }
    });
})

module.exports = employeesRouter;