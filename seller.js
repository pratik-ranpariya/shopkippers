var express          = require('express')
    bodyParser       = require('body-parser')
    MongoClient      = require('mongodb').MongoClient
    objectId         = require('mongodb').ObjectID
    assets           = require('assert')
    multer           = require('multer')
    bcrypt           = require('bcryptjs')
    session          = require('express-session')
    fileUpload       = require('express-fileupload')
    uniqid           = require('randomatic')
    _req             = require('request')
    _date            = require('moment')
    jwt              = require('express-jwt')
    // helmet           = require('helmet')
    ejs              = require('ejs')
    path             = require('path')
    fs               = require('fs')
    app              = express()
    config           = require('./config/config.json')
    verson           = config.verson
    port             = config.sellerport
    dbName           = config.mongodb.dbname
    upload           = multer()
    // otpJson          = []
    mypagenumber     = []
    otp              = 1
    saltRounds       = 10
    sellerModel      = module.exports = require('./model/sellermodel.js')
    // url              = 'mongodb://'+config.mongodb.username+':'+config.mongodb.password+'@'+config.mongodb.host+':'+config.mongodb.port+'/'+config.mongodb.dbname
    url              = 'mongodb://localhost:27017/ecommerce'
    pImgUrl          = 'http://'+config.mongodb.host +':'+ config.sellerport+'/sellerPanel/img/productImg'
    cImgUrl          = 'http://'+config.mongodb.host +':'+ config.sellerport+'/sellerPanel/img/categoryImg'
    BaseUrl          = 'http://'+config.mongodb.host +':'+ port
    pBaseUrl         = 'http://'+config.mongodb.host +':'+ config.webport


//     var data = require('./data');
// var utilities = require('./utilities');
    app.engine('html', ejs.renderFile)
    app.set('view engine', 'ejs')

    app.use(express.static('views'))
    app.use(express.static(path.join(__dirname, 'views')))

    app.use(fileUpload());

    // app.use(helmet())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', "*")
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
      res.setHeader('Access-Control-Allow-Credentials', true)
      next()
    })

    app.use(session({
      secret: 'fsd84h50fbjkdfs74uhsfjkdjnjzcz',
      resave: true,
      saveUninitialized: true,
      name: 'seller'
    }))


MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
  assets.equal(null, err)
  if (err) throw err
  db = module.exports = client.db(dbName)
  console.log("mongodb is connected with database =", dbName)

  sellerModel.sellerApi()

  // var secretCallback = function(req, payload, done){
  //   var issuer = payload.iss;
   
  //   data.getTenantByIdentifier(issuer, function(err, tenant){
  //     if (err) { return done(err); }
  //     if (!tenant) { return done(new Error('missing_secret')); }
   
  //     var secret = utilities.decrypt(tenant.secret);
  //     done(null, secret);
  //   });
  // };

  // app.get('/protected',
  // jwt({ secret: secretCallback }),
  // function(req, res) {
  //   if (!req.user.admin) return res.sendStatus(401);
  //   res.sendStatus(200);
  // });

 

})

server = app.listen(port, () => {
  console.log("We Are Live On " + port)
})

server.timeout = 2000;