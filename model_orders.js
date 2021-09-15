const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

exports.orderThis = function(id, productid){
    db.prepare("INSERT INTO orders(userId, product, status) VALUES (?, ?, 'pending')").run(id, productid);
}
