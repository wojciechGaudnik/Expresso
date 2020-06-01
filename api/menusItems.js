const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    db.get('select * from MenuItem where id = $menuItemId', {$menuItemId: menuItemId}, (error, menuItem) => {
        if (error) {
            next(error);
        } else if (menuItem) {
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

menuItemsRouter.get('/', (req, res, next) => {
    db.all('select * from MenuItem where MenuItem.menu_id = $menuId', { $menuId: req.params.menuId}, (error, menuItems) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({menuItems: menuItems});
        }
    });
});

module.exports = menuItemsRouter;
