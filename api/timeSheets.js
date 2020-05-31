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
        }, (errGet, timeSheet) => {
        if (errGet) {
            next(errGet);
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
            }, (errRun) => {
                if (errRun) {
                    next(errRun);
                } else {
                    db.get(`select * from TimeSheet where id = ${req.params.timeSheetId}`, (err, timeSheetGet) => {
                        res.status(200).json({timeSheet: timeSheetGet});
                    });
                }
            });
        }
    });
});

timeSheetsRouter.delete('/:timeSheetId', (req, res, next) => {
    const sqlTest = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timeSheetId';
    const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timeSheetId';
    const values = {$timeSheetId: req.params.timeSheetId};
    db.get(sqlTest, values, (err, timeSheet) => {
        console.log("start ");
        if (err) {
            console.log("1 error");
            next(err);
        } else if (!timeSheet) {
            console.log("1 else");
            res.sendStatus(404);
        } else {
            console.log("2 else");
            db.run(sql, values, (error) => {
                if (error) {
                    console.log("2 error");
                    next(error);
                } else {
                    console.log("3 else");
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = timeSheetsRouter;
