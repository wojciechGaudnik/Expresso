const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || 'database.sqlite');

menusRouter.get('/', ((req, res, next) => {
    db.all(`select *
            from Menu`, (err, menus) => {
        if (err) {
            nest(err);
        } else {
            res.status(200).json({menus: menus});
        }
    });
}));

module.exports = menusRouter;