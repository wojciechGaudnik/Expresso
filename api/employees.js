const express = require('express');
const employeesRouter = express.Router();
const timeSheetsRouter = require('./timeSheets');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || 'database.sqlite');

employeesRouter.use('/:employeeId/timeSheets', timeSheetsRouter);

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
    }, function (errRun) {
        if (errRun) {
            next(errRun);
        } else {
            db.get(`select * from Employee where id = ${this.lastID}`, (errGet, employee) => {
                if (errGet) {
                    next(errGet);
                } else {
                    res.status(201).json({employee: employee});
                }
            });
        }
    });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    const employeeId = req.params.employeeId;
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentlyEmployed = req.body.employee.is_current_employee === 0 ? 0 : 1;
    if (!name || !position || !wage) {
        return res.sendStatus(400);
    }

    db.run(`update Employee
            set name                = $name,
                position            = $position,
                wage                = $wage,
                is_current_employee = $isCurrentlyEmployed
            where Employee.id = $employeeId;
    `, {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentlyEmployed: isCurrentlyEmployed,
        $employeeId: employeeId
    }, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`select * from Employee where id = ${req.params.employeeId}`, (errGet, employee) => {
                if (errGet) {
                    next(errGet);
                } else {
                    res.status(200).json({employee: employee});
                }
            });
        }
    });
})

employeesRouter.delete("/:employeeId", (req, res, next) => {
    const sqlUpdate = `update Employee
                       set is_current_employee = 0
                       where id = $employeeId;
    `;
    const values = {$employeeId: req.employee.id}
    db.run(sqlUpdate, values, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`select * from Employee where id = ${req.params.employeeId}`, (errRun, employee) => {
                res.status(200).json({employee: employee});
            })
        }
    });
})

module.exports = employeesRouter;