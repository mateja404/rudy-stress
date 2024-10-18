const mysql = require('mysql');

let db = mysql.createConnection({
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'rudy_db'
});

db.connect(function(err) {
    if (err) throw err;
    console.log("Succesfully connected ! id: "  +db.threadId);
});

module.exports = db;