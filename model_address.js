const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

exports.changeAddress = function(id, name, address, city, code, country){
    var found = db.prepare('SELECT * FROM address WHERE id = ?').get(id);
    if(found == undefined){
        db.prepare("INSERT INTO address VALUES (?, null, null, null, null, null)").run(id);
    }
    db.prepare("UPDATE address SET nom = ?, address = ?, ville = ?, pays = ?, code = ? WHERE id = ?").run(name,address,city,country,code,id);
}

exports.getAddress = function(id){
    let select = db.prepare('SELECT * FROM address WHERE id = ?').get(id)
    return select;
}

exports.addressExists = function(id){
    var found = db.prepare('SELECT * FROM address WHERE id = ?').get(id);
    if(found == undefined){
        return false;
    }
    return true;
}

