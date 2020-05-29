const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');

db.serialize(function () {
    db.run(`drop table if exists Employee`);
    db.run(`create table Employee
            (
                id                  integer not null primary key autoincrement ,
                name                text    not null ,
                position            text    not null ,
                wage                integer not null ,
                is_current_employee integer default 1
            );`);
    db.run(`drop table if exists TimeSheet`);
    db.run(`create table TimeSheet
            (
                id          integer not null primary key autoincrement ,
                hours       integer not null ,
                rate        integer not null ,
                date        integer not null ,
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
                name        text    not null ,
                description text,
                inventory   integer not null ,
                price       integer not null ,
                menu_id     integer not null references Menu (id) 
            );`);
});