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
    // jwt              = require('express-jwt')
    // helmet           = require('helmet')
    ejs              = require('ejs')
    path             = require('path')
    fs               = require('fs')
    app              = express()
    config           = require('./config/config.json')
    verson           = config.verson
    port             = config.adminport
    dbName           = config.mongodb.dbname
    upload           = multer()
    // otpJson          = []
    mypagenumber     = []
    otp              = 1
    saltRounds       = 10
    adminModel      = module.exports = require('./model/adminmodel.js')
    // url              = 'mongodb://'+config.mongodb.username+':'+config.mongodb.password+'@'+config.mongodb.host+':'+config.mongodb.port+'/'+config.mongodb.dbname
    url              = 'mongodb://localhost:27017/ecommerce'
    pImgUrl          = 'http://'+config.mongodb.host +':'+ config.sellerport+'/sellerPanel/img/productImg'
    cImgUrl          = 'http://'+config.mongodb.host +':'+ config.sellerport+'/sellerPanel/img/categoryImg'
    dImgUrl          = 'http://'+config.mongodb.host +':'+ config.sellerport+'/sellerPanel/img/document'
    bImgUrl          = 'http://'+config.mongodb.host +':'+ config.adminport+'/adminPanel/img/banner'
    BaseUrl          = 'http://'+config.mongodb.host +':'+ port
    pBaseUrl         = 'http://'+config.mongodb.host +':'+ config.webport


//     var data = require('./data');
// var utilities = require('./utilities');
    app.engine('html', ejs.renderFile)
    app.set('view engine', 'ejs')

    app.use(express.static('views'))
    app.use(express.static(path.join(__dirname, 'views')))

    app.use(fileUpload())

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
      name: 'admin'
    }))


MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
  assets.equal(null, err)
  if (err) throw err
  db = module.exports = client.db(dbName)
  console.log("mongodb is connected with database =", dbName)

  adminModel.adminApi()


})

server = app.listen(port, () => {
  console.log("We Are Live On " + port)
})