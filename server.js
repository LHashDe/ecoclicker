var express = require('express');
var mustache = require('mustache-express');
var bodyParser = require('body-parser');
let urlencodedParser = bodyParser.json({ extended: false });
var bcrypt = require('bcrypt');
var multer = require('multer');


var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));
app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');


var plantes = require('./plantes_sql');
var model_user = require('./model_user');
var model_messages = require('./model_messages');
var model_address = require('./model_address');
var model_orders = require('./model_orders');


const cookieSession = require('cookie-session');
const upload = multer({dest: __dirname + '/public/ressources/profile'});


app.use(cookieSession({
    name: 'session',
    secret: 'mot-de-passe-du-cookie',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//============================RENDER=============================//
app.get('/', middleware, (req,res) =>{
    res.locals.inShop = false;
    res.render('index');
})

app.get('/signup',(req,res) =>{
    res.locals.inShop = false;
    res.render('signup');
});

app.get("/shop", is_authenticated, (req,res) =>{
    res.locals.inShop = true;
    res.render("shop",{plantes_list : plantes.list()});
});

app.post('/add_message', is_authenticated,(req,res)=>{
    if(req.body.text != ""){
      model_messages.add_message(req.session.user.id, req.body.text);
    }
    res.redirect("/");
});

app.get('/messages_content', is_authenticated, (req, res) => {
  res.render('messages_content', {messages : model_messages.messages_list()});
});

app.get('/profile',is_authenticated,(req,res) =>{
  res.render("profile",model_user.get_user(res.locals.name));
});

app.get('/update-profile-form',(req,res) =>{
  res.render("update-profile-form");
});

app.get('/ranking',middleware,(req,res)=>{
  res.render("leaderBoard",{users_list : model_user.listBestPlayer()});
});

app.get('/accountdelete',is_authenticated,(req,res)=>{
  res.render("accountdelete");
});

app.get('/changeaddress',is_authenticated,(req,res)=>{
  res.render("changeaddress", {info : model_address.getAddress(req.session.user.id)});
});

app.get('/changepassword',is_authenticated,(req,res)=>{
  res.render("changepassword");
});

app.get('/profilepicture',is_authenticated,(req,res)=>{
  res.render("profilepicture");
});


app.get('/aboutus',middleware,(req,res)=>{

  res.render('aboutus');
});

app.get('/search', is_authenticated,(req, res) => {
  res.locals.inShop = true;
  res.locals.notFound = false;
  var found =  plantes.search(req.query.query);
  if (found.length == 0){
    res.locals.notFound = true
  }
  res.render('found', {plantes_list : found, query : req.query.query});
});

//=========================SESSION===========================//

function is_authenticated(req, res, next) {
  if (req.session.user !== undefined) {
    res.locals.name = req.session.user.name;
    res.locals.authenticated = true;
    return next();
  }
  res.locals.authenticated = false;
  res.status(401).send('Authentication required');
}


function middleware(req, res, next) {
  if (req.session.user !== undefined) {
    res.locals.name = req.session.user.name;
    res.locals.authenticated = true;
    return next();
  } else {
    res.locals.authenticated = false;
    return next();
  }
}


app.post('/signup',(req,res) =>{
    if(req.body.password != req.body.password2){
      res.locals.wrong = true;
      res.render('signup');
	  return;
    }
    var hashedPassword = crypt_password(req.body.password);
    //console.log(hashedPassword);
    const user = model_user.new_user(req.body.name, hashedPassword);
	if(user == -1){
		res.locals.already = true;
		res.render('signup');
		return;
	}
	else{
    //console.log(user);
    req.session.user = user;
    res.locals.name = req.body.name;
    res.redirect('/')
	}
});

function crypt_password(password) {
    var saved_hash = bcrypt.hashSync(password, 10);
    return saved_hash;
}

app.post('/login', (req, res) => {
    const user = model_user.login(req.body.name, req.body.password);
    //console.log(user);
    if (user != -1 && user != -2) {
      req.session.user = user;
      res.locals.id = user.id;
      res.locals.name = req.body.name;
      res.locals.score = req.body.score;
      res.redirect('/');
    } else if (user == -1) {
      res.locals.failed_name = true;
      res.render('index');
    } else if (user == -2) {
      res.locals.failed_pass = true;
      res.render('index');
    } else {
      res.redirect('/');
    }
  });

  app.post('/changepassword', (req,res) => {
    if(! bcrypt.compareSync(req.body.oldpassword, req.session.user.password)){
      res.locals.nope = true;
      res.render('changepassword');
	  return;
    }
    if(req.body.password != req.body.password2){
      res.locals.wrong = true;
      res.render('changepassword');
	  return;
    }
    else{
    var hashedPassword = crypt_password(req.body.password);
    model_user.changePassword(req.session.user.id, hashedPassword)
    res.redirect('/');
  }
  });

  app.post('/upload', upload.single('image'), (req,res) => {
    if(req.file) {
      //console.log(req.file.path)
      model_user.changePicture("/ressources/profile/" + req.file.filename, req.session.user.id)
      res.redirect('/profile')
    }
    else throw 'error';
  });

  app.post('/changeaddress', is_authenticated, (req,res) => {
    model_address.changeAddress(req.session.user.id, req.body.nom, req.body.adresse, req.body.ville, req.body.postal, req.body.pays)
    res.redirect('/profile');
  });

  app.get('/supprimer', (req,res) => {
    if(req.session.user == undefined){
      res.send("Not Connected");
      return;
    }
    const id = req.session.user.id;
    model_user.deleteUser(id)
    req.session = null;
    res.locals.name = null;
    res.redirect('/');
  });


app.get('/api/incrementScore', (req,res) => {
    if(req.session.user == undefined){
    res.send("Not Connected");
    return;
    }
    const username = req.session.user.name;
    oldScore = model_user.getScore(username);
    newScore = oldScore.score + 1;
    model_user.setScore(username, newScore)
    res.send("ok");
});

app.get('/api/getScore', (req,res) => {
    if(req.session.user == undefined){
      res.send("Not Connected");
      return;
    }
    const username = req.session.user.name;
    score = model_user.getScore(username);
    res.send(score);
});

app.post('/api/add_message', urlencodedParser, is_authenticated,(req,res)=>{
  if(req.body.content != ""){
    model_messages.add_message(req.session.user.id, req.body.content);
  }
  res.send({status: "OK"})
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.locals.name = null;
    res.redirect('/');
});

app.get('/shop-form/:id',is_authenticated,(req,res)=>{
  res.locals.inShop = true;
  res.locals.available = true;
  res.locals.money = true;  


  let getStock = plantes.getStock(req.params.id);
  let getScoreUser = model_user.getScore(res.locals.name);
  let getPrix = plantes.getPrix(req.params.id);

  if(getStock != undefined){
      if(getStock.stock == 0){
        res.locals.available = false;
      }
      if(getScoreUser.score < getPrix.prix){
        res.locals.money = false;
        
    }
  }
  
  res.render("shop-form",{plante : plantes.read(req.params.id)});
  
});

app.post('/sell/:id',(req,res)=>{
  plantes.addStock(req.params.id,1);
  res.redirect("/shop-form/"+req.params.id);
});

app.post('/buy/:id',(req,res)=>{
  plantes.removeStock(req.params.id,1);
  model_user.removeScore(req.session.user.name, plantes.getPrix(req.params.id).prix);
  model_orders.orderThis(req.session.user.id, req.params.id)
  res.redirect("/shop-form/"+req.params.id);
});



//========================================================//

app.listen(3000, () => console.log('listening on http://localhost:3000'));
