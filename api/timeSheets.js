const express = require('express');
const timeSheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || 'database.sqlite');

timeSheetsRouter.get('/', (req, res, next) => {
    db.all(`select * from TimeSheet where employee_id = ${req.params.employeeId}`, (err, timeSheets) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({timeSheets: timeSheets});
        }
    });
});

timeSheetsRouter.post('/', (req, res, nest) => {
    const hours = req.body.timeSheet.hours;
    const rate = req.body.timeSheet.rate;
    const date = req.body.timeSheet.date;
    const employeeId = req.params.employeeId;
    if (!hours || !rate || !date) {
        return res.status(400).send();
    }

    db.run(`insert into TimeSheet (hours, rate, date, employee_id)
            values ($hours, $rate, $date, $employee_id);`, {
            $hours: hours,
            $rate: rate,
            $date: date,
            $employee_id: employeeId
        },
        function (err) {
            if (err) {
                nest(err);
            } else {
                db.get(`select * from TimeSheet where id = ${this.lastID}`, (err, timeSheet) => {
                    res.status(201).json({timeSheet: timeSheet})
                });
            }
        });
});

timeSheetsRouter.put('/:timeSheetId', (req, res, next) => {
    db.get(`select *
            from TimeSheet
            where id = $timeSheetId and employee_id = $employeeId`,
        {
            $timeSheetId: req.params.timeSheetId,
            $employeeId: req.params.employeeId
        }, (err, timeSheet) => {
        if (err) {
            next(err);
        } else if (!timeSheet){
            return res.sendStatus(404);
        } else {
            const hours = req.body.timeSheet.hours;
            const rate = req.body.timeSheet.rate;
            const date = req.body.timeSheet.date;
            if (!hours || !rate || !date) {
                return res.status(400).send();
            }
            db.run(`update TimeSheet
                    set hours = $hours,
                        rate  = $rate,
                        date  = $date
                    where id = $timeSheetId;
            `, {
                $hours: hours,
                $rate: rate,
                $date: date,
                $timeSheetId: req.params.timeSheetId
            }, (err) => {
                if (err) {
                    next(err);
                } else {
                    db.get(`select * from TimeSheet where id = ${req.params.timeSheetId}`, (err, timeSheet) => {
                        res.status(200).json({timeSheet: timeSheet});
                    });
                }
            });
        }
    });
});

module.exports = timeSheetsRouter;
