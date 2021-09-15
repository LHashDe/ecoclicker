const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

exports.add_message = function(author, text) {
    let insert = db.prepare(`INSERT INTO messages VALUES ('${author}', '${text}')`);
    insert.run();
  }
  
exports.messages_list = function(){
    let select = db.prepare('SELECT m.message, u.name FROM messages m INNER JOIN users u ON u.rowid = m.idUser ORDER BY m.rowid DESC LIMIT 20')
    let result = select.all();
    return result.reverse();
}