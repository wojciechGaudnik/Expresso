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

menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.params.menuId;

    db.get(`select *
            from Menu
            where id = $menuId`, {$menuId: menuId}, (errorGet, menu) => {
        if (errorGet) {
            nest(errorGet);
        } else {
            if (!name || !inventory || !price || !menu) {
                res.sendStatus(400);
            }
            db.run(`insert into MenuItem (name, description, inventory, price, menu_id)
                    values ($name, $description, $inventory, $price, $menu_id);
            `, {
                $name: name,
                $description: description,
                $inventory: inventory,
                $price: price,
                $menu_id: menuId
            }, function (errorRun) {
                if (errorRun) {
                    next(errorRun);
                } else {
                    db.get(`select * from MenuItem where id = ${this.lastID}`, (err, menuItem) => {
                        res.status(201).json({menuItem: menuItem});
                    })
                }
            });
        }
    });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.params.menuId;

    db.get('select * from Menu where id = $menuId', {$menuId: menuId}, (errorGet, menu) => {
        if (errorGet) {
            next(errorGet);
        } else {
            if (!name || !inventory || !price || !menu) {
                return res.sendStatus(400);
            }
            db.run(`update MenuItem
                    set name        = $name,
                        description = $description,
                        inventory   = $inventory,
                        price       = $price,
                        menu_id     = $menuId
                    where id = $menuItemId;
                    `, {
                $name: name,
                $description: description,
                $inventory: inventory,
                $price: price,
                $menuId: menuId,
                $menuItemId: req.params.menuItemId
            }, function (errorRun) {
                if (errorRun) {
                    next(errorRun);
                } else {
                    db.get(`select * from MenuItem where id = ${req.params.menuItemId}`,
                        (error, menuItem) => {
                            res.status(200).json({menuItem: menuItem});
                        });
                }
            });
        }
    });
});

module.exports = menuItemsRouter;
