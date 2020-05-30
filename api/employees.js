const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || 'database.sqlite');
console.log(process.env.TEST_DATABASE);

employeesRouter.param('employeeId', ((req, res, next, employeeID) => {
    db.get(`select *
            from Employee
            where id = $employeeId`, {$employeeId: employeeID}, (err, employee) => {
        if (err) {
            next(err);
        } else if (employee) {
            req.employee = employee;
            next();
        } else {
            res.sendStatus(404);
        }
    })
}));

employeesRouter.get('/', (req, res, next) => {
    db.all(`select *
            from Employee
            where is_current_employee = 1`, (err, employees) => {
        if (err) {
            next(err);
        } else {
            console.log("200");
            res.status(200).json({employees: employees})
        }
    });
});

employeesRouter.get('/:employeeId', ((req, res) => {
    res.status(200).json({employee: req.employee});
}));

employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    if (!name || !position || !wage) {
        return res.sendStatus(400);
    }

    db.run(`insert into Employee (name, position, wage)
            values ($name, $position, $wage);
    `, {
        $name: name,
        $position: position,
        $wage: wage
    }, function (err) {
        if (err) {
            next(err);
        } else {
            db.get(`select * from Employee where id = ${this.lastID}`, (err, employee) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({employee: employee});
                }
            });
        }
    });
});


module.exports = employeesRouter;