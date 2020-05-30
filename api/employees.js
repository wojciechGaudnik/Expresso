const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || 'database.sqlite');
console.log(process.env.TEST_DATABASE);

employeesRouter.param('employeeId', ((req, res, next, employeeID) => {
    db.get(`select * from Employee where id = $employeeId`, {$employeeId: employeeID}, (err, employee) => {
        if (err) {
            next(err);
        } else if (employee) {
            req.employee = employee;
            next();
        } else {
            res.sendStatus(404);
        }
    })
}))

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

employeesRouter.get('/:employeeId', ((req, res, next) => {
    res.status(200).json({employee: req.employee});
}))

module.exports = employeesRouter;