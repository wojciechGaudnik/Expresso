const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');

db.serialize(function () {
    db.run(`drop table if exists Employee`);
    db.run(`create table Employee
            (
                id                  integer not null primary key autoincrement ,
                name                text    not null default '',
                position            text    not null default '',
                wage                integer not null default 0,
                is_current_employee integer
            );`);
    db.run(`drop table if exists TimeSheet`);
    db.run(`create table TimeSheet
            (
                id          integer not null primary key autoincrement ,
                hours       integer not null default 0,
                rate        integer not null default 0,
                date        integer not null default 0,
                employee_id integer not null references Employee (id)
            );`);
    db.run(`drop table if exists Menu`);
    db.run(`create table Menu
            (
                id    integer not null primary key autoincrement ,
                title text    not null
            );`);
    db.run(`drop table if exists MenuItem`);
    db.run(`create table MenuItem
            (
                id          integer not null primary key autoincrement ,
                name        text    not null default '',
                description text,
                inventory   integer not null default 0,
                price       integer not null default 0,
                menu_id     integer not null references Menu (id) default 0
            );`);
});