const Sqlite = require('better-sqlite3');
var bcrypt = require('bcrypt');

let db = new Sqlite('db.sqlite');


exports.login = function(name, password){
    var found = db.prepare('SELECT * FROM users WHERE name = ?').get(name);
    if(found !== undefined) {
        //console.log(password, found.password);
      if(bcrypt.compareSync(password, found.password)){
        return found;
      }
      else{
        return -2;
      }
    }
    else{
      return -1;
    }
  };

exports.new_user = function(name, password){
	var found = db.prepare('SELECT * FROM users WHERE name = ?').get(name);
	if(found !== undefined){
		return -1;
	}
    db.prepare("INSERT INTO users (name, password, score, profilepic) VALUES (?, ?,0,'https://image.freepik.com/vecteurs-libre/vie-arbre-dessine-main_23-2148699465.jpg')")
    .run(name, password);
    return db.prepare('SELECT * FROM users WHERE name = ?').get(name);
}

exports.get_user = function(name){
  return db.prepare('SELECT * FROM users WHERE name = ?').get(name);
}

exports.getScore = function(name){
  var getScore = db.prepare("SELECT score from users where name = ?");
  var score = getScore.get(name);
  return score;
}

exports.setScore = function(name, score){
  db.prepare("UPDATE users SET score = ? WHERE name = ?").run(score, name);
}

exports.removeScore = function(name,scoreToRemove){
  var getScore = db.prepare("SELECT score from users where name = ?");
  var score = getScore.get(name);
  db.prepare("UPDATE users SET score = (?-?) where name = ?").run(score.score,scoreToRemove,name);


  var getNewscore = db.prepare("SELECT score from users where name = ?");
  var newScore = getNewscore.get(name);
  return newScore;
}

exports.listBestPlayer = function(){
  let select = db.prepare('SELECT * FROM users ORDER BY score DESC LIMIT 10')
  let result = select.all();
  return result;
}

exports.deleteUser = function(id){
  var found = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  //console.log(found)
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
}

exports.changePicture = function(imagePath, id){
  db.prepare("UPDATE users SET profilepic = ? WHERE id = ?").run(imagePath, id)
}

exports.changePassword = function(id, password){
  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(password, id)
}
