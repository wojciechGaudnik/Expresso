const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || 'database.sqlite');

menusRouter.param('menuId', (req, res, next, menuId) => {
    db.get(`select *
            from Menu
            where id = $menuId`, {$menuId: menuId}, (err, menu) => {
        if (err) {
            next(err);
        } else if (menu) {
            req.menu = menu;
            next();
        } else {
            return res.sendStatus(404);
        }
    });
})


menusRouter.get('/', (req, res, next) => {
    db.all(`select *
            from Menu`, (err, menus) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({menus: menus});
        }
    });
});

menusRouter.get('/:menuId', (req, res) => {
    res.status(200).json({menu: req.menu});
})


module.exports = menusRouter;