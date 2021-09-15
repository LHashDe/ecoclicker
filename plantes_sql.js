var fs = require('fs');
var Sqlite = require('better-sqlite3');

var db = new Sqlite('db.sqlite');




exports.list = function(){
    var plantes_list = db.prepare('SELECT * FROM plantes ORDER BY id').all();
    return plantes_list;
}

exports.read = function(id){
    var read = db.prepare('SELECT * from plantes where id = ?');
    var idPlantes = read.get(id);

    if(idPlantes == undefined) return null;
    return idPlantes;
}

exports.getStock = function(id){
    var getStock = db.prepare("SELECT stock from plantes where id = ?");
    var stock = getStock.get(id);

    return stock;
}

exports.getPrix = function(id){
    return db.prepare("SELECT prix from plantes where id = ?").get(id)
}

exports.addStock = function(id,stockToAdd){
    var getStock = db.prepare("SELECT stock from plantes where id = ?");
    var stock = getStock.get(id);
    db.prepare("UPDATE plantes SET stock = (?+?) where id = ?").run(stock.stock,stockToAdd,id);

    var getNewStock = db.prepare("SELECT stock from plantes where id = ?");
    var newStock = getNewStock.get(id);
    return newStock;
}

exports.removeStock = function(id,stockToRemove){
    var getStock = db.prepare("SELECT stock from plantes where id = ?");
    var stock = getStock.get(id);
    db.prepare("UPDATE plantes SET stock = (?-?) where id = ?").run(stock.stock,stockToRemove,id);

    var getNewStock = db.prepare("SELECT stock from plantes where id = ?");
    var newStock = getNewStock.get(id);

    return newStock;
}

exports.search = function(query){
    query = query || "";
    var found = db.prepare("SELECT * FROM plantes WHERE name LIKE ?").all("%"+query+"%");
    return found;
}
