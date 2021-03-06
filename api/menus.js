const express = require('express');
const menusRouter = express.Router();
const menuItemsRouter = require('./menusItems');
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
            res.sendStatus(404);
        }
    });
})

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

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

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        return res.sendStatus(400);
    }

    db.run(`insert into Menu (title)
            values ($title)`, {$title: title}, function (err) {
        if (err) {
            next(err);
        } else {
            db.get(`select * from Menu where id = ${this.lastID}`, (errorGet, menu) => {
                res.status(201).json({menu: menu});
            });
        }
    });
});

menusRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        return res.sendStatus(400);
    }

    db.run('update Menu set title = $title where id = $menuId', {
        $title: title,
        $menuId: req.params.menuId
    }, (errorRun) => {
        if (errorRun) {
            next(errorRun);
        } else {
            db.get(`select * from Menu where Menu.id = ${req.params.menuId}`,
                (error, menu) => {
                    res.status(200).json({menu: menu});
                });
        }
    });
})

menusRouter.delete('/:menuId', (req, res, next) => {
    db.get('select * from MenuItem where menu_id = $menuId', {$menuId: req.params.menuId}, (errorGet, menuItem) => {
        if (errorGet) {
            next(errorGet);
        } else if (menuItem) {
            return res.sendStatus(400);
        } else {
            const deleteSql = 'delete from Menu where Menu.id = $menuId';
            const deleteValues = {$menuId: req.params.menuId};

            db.run(deleteSql, deleteValues, (errorRun) => {
                if (errorRun) {
                    next(errorRun);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = menusRouter;