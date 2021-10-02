const { compareSync } = require('bcryptjs')
var express          = require('express')
    bodyParser       = require('body-parser')
    MongoClient      = require('mongodb').MongoClient
    objectId         = require('mongodb').ObjectID
    assets           = require('assert')
    multer           = require('multer')
    bcrypt           = require('bcryptjs')
    session          = require('express-session')
    uniqid           = require('randomatic')
    _req             = require('request')
    // helmet           = require('helmet')
    // useragent        = require('express-useragent')
    app              = express()
    config           = require('./config/config.json')
    verson           = config.verson
    port             = config.serverport
    dbName           = config.mongodb.dbname
    upload           = multer()
    // otpJson          = []
    saltRounds       = 10
    RestApi          = module.exports = require('./model/servermodel.js')
    // url              = 'mongodb://'+config.mongodb.username+':'+config.mongodb.password+'@'+config.mongodb.host+':'+config.mongodb.port+'/'+config.mongodb.dbname
    url              = 'mongodb://localhost:27017/ecommerce'
    BaseUrl          = 'http://'+config.mongodb.host +':'+ port +'/'+ verson
    imgUrl           = 'http://'+config.mongodb.host +':'+ config.sellerport+'/sellerPanel/img/productImg'
    cImgUrl          = 'http://'+config.mongodb.host +':'+ config.sellerport+'/sellerPanel/img'
    // app.use(helmet())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())

    // app.use(useragent.express())
    
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', "*")
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
      res.setHeader('Access-Control-Allow-Credentials', true)
      next()
    })

    app.use(session({
      secret: 'fsd84h507JKNJ9hg8&jndas*(jnjzcz',
      resave: true,
      saveUninitialized: true
    }))

MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
  assets.equal(null, err)
  if (err) throw err
  db = module.exports = client.db(dbName)
  console.log("mongodb is connected with database =", dbName)

  RestApi.myapi()

  // app.post('/autoSMS', (req, res) => {
  //   sess = req.session
  //   console.log('api call')
  //   db.collection('marketing').find().project({ _id: 0 }).toArray((error, mydata) => {
  //   console.log('1')

  //     var array = []
  //     for (var i = 0; i < mydata.length; i++) {
  //       array.push(mydata[i].mobileNo)
  //     }

  //     perPagesms = (typeof sess.smsPerPage != 'undefined') ? parseInt(sess.smsPerPage) : 10;
  //     pageNo = req.body.startpage != undefined && parseInt(req.body.startpage) != 0 ? parseInt(req.body.startpage) : 1;
  //     req.body.time = req.body.time != undefined ? req.body.time : 10;

  //     function temp(mNo, perPagesms, pageNo, done) {
  //    console.log('2')
  //       start = pageNo * perPagesms - perPagesms
  //       end = pageNo * perPagesms
  //       console.log(start, end)
  //       var selectedNumber = mNo.slice(start, end)
  //       if (selectedNumber[0]) {

  //         link = `http://198.15.103.106/API/pushsms.aspx?loginID=ssvltech1&password=123456&mobile=${selectedNumber}&text=${req.body.text}&senderid=SSVLTE&route_id=1&Unicode=0`
  //         console.log(link)
  //         _req({
  //           "url": link,
  //           "json": true,
  //           "method": "get"
  //         }, (err, httpResponse, body) => {
  //              console.log(httpResponse)
  //           if (((typeof req.body.lastpage != 'undefined') ? parseInt(req.body.lastpage) : (array.length / perPagesms)) == pageNo) {
  //             return done()
  //           }

  //           setTimeout(function () {
  //             temp(mNo, perPagesms, pageNo + 1, done)
  //           }, req.body.time * 1000)

  //         })
  //       } else {
  //         return done()
  //       }
  //     }

  //     temp(array, perPagesms, pageNo, (done) => {
  //       console.log('3')
  //       return
  //     })

  //     return res.redirect('/marketing')
  //   })
  // })

  // app.post('/autoSMS', (req, res) => {
  //   sess = req.session
  //   db.collection('marketing').find().sort({ _id: -1 }).project({ _id: 0 }).toArray((error, mydata) => {

  //     var array = []
  //     for (var i = 0; i < mydata.length; i++) {
  //       array.push(mydata[i].mobileNo)
  //     }

  //     perPagesms = (typeof sess.smsPerPage != 'undefined') ? parseInt(sess.smsPerPage) : 10;
  //     pageNo = req.body.startpage != undefined && parseInt(req.body.startpage) != 0 ? parseInt(req.body.startpage) : 1;
  //     req.body.time = req.body.time != undefined ? req.body.time : 10;

  //     function temp(mNo, perPagesms, pageNo, done) {
  //       start = pageNo * perPagesms - perPagesms
  //       end = pageNo * perPagesms
  //       var selectedNumber = mNo.slice(start, end)
  //       if (selectedNumber[0]) {

  //         link = `http://198.15.103.106/API/pushsms.aspx?loginID=ssvltech1&password=123456&mobile=${selectedNumber}&text=${req.body.text}&senderid=SSVLTE&route_id=1&Unicode=0`
  //         _req({
  //           "url": link,
  //           "json": true,
  //           "method": "get"
  //         }, (err, httpResponse, body) => {

  //           if (((typeof req.body.lastpage != 'undefined') ? parseInt(req.body.lastpage) : (array.length / perPagesms)) == pageNo) {
  //             return done()
  //           }

  //           setTimeout(function () {
  //             temp(mNo, perPagesms, pageNo + 1, done)
  //           }, req.body.time * 1000)

  //         })
  //       } else {
  //         return done()
  //       }
  //     }

  //     temp(array, perPagesms, pageNo, (done) => {
  //       return
  //     })

  //     return res.redirect('/marketing')
  //   })
  // })


  // var perPagesms;
  // var pagesms;
  // var skipsms;

  
  // function callbeforeTime(req, res) {
  //     sess = req.session;
  //     sess.active = 'marketing';

  //     // console.log(new Date())
  //     starttime = new Date()

  //     // perPagesms = (typeof sess.smsPerPage != 'undefined') ? parseInt(sess.smsPerPage) : 10;
  //     perPagesms = 2
  //     pagesms = (typeof req.body.startpage != 'undefined') ? (req.body.startpage == 0) ? 1 : parseInt(req.body.startpage) || 1 : 1;
  //     skipsms = (perPagesms * pagesms) - perPagesms;
  //     //50000 , 10 , 5000;
      


  //     removetimes = setInterval(() => {
  //       console.log('infinity')
  //         // if (typeof sess.user != 'undefined') {

  //             db.collection('marketing').find({}).skip(skipsms).limit(perPagesms).toArray((err, smsNo) => {
  //                 db.collection('marketing').countDocuments((err, numCount) => {
  //                     var smsNumber = []
  //                     for (var i = 0; i < smsNo.length; i++) {
  //                         smsNumber.push(smsNo[i].mobileNo)
  //                     }
  //                     if (smsNo.length == 0) {
  //                         perPagesms = (typeof sess.smsPerPage != 'undefined') ? parseInt(sess.smsPerPage) : 10;
  //                         pagesms = (typeof req.body.startpage != 'undefined') ? (req.body.startpage == 0) ? 1 : parseInt(req.body.startpage) || 1 : 1;
  //                         console.log('here', smsNo.length, smsNo, new Date() - starttime)
  //                         return clearTimeout(removetimes)
  //                     }
  //                     if(((typeof req.body.lastpage != 'undefined') ? parseInt(req.body.lastpage) : 10000000000000000) == pagesms) {
  //                         perPagesms = (typeof sess.smsPerPage != 'undefined') ? parseInt(sess.smsPerPage) : 10;
  //                         pagesms = (typeof req.body.startpage != 'undefined') ? (req.body.startpage == 0) ? 1 : parseInt(req.body.startpage) || 1 : 1;
  //                         console.log('not here')
  //                         clearTimeout(removetimes)
  //                     }
  //                     // link = `http://198.15.103.106/API/pushsms.aspx?loginID=ssvltech1&password=123456&mobile=${smsNumber}&text=${req.body.text}&senderid=SSVLTE&route_id=1&Unicode=0`
  //                     // link = 'dasdas'
  //                     // _req({
  //                     //     "url": link,
  //                     //     "json": true,
  //                     //     "method": "get"
  //                     // }, (err, httpResponse, body) => {
  //                       console.log(smsNumber)

  //                         // console.log(link)
  //                         pagesms = pagesms + 1;
  //                         skipsms = (perPagesms * pagesms) - perPagesms;
  //                         return
  //                     // })

  //                 })
  //             })
  //             console.log(new Date())
  //         // } else {
  //         //     return res.render('/index')
  //         // }
  //     }, parseInt(req.body.second) * 1000)
  // }

  // app.post('/autoSMS', (req, res) => {
  //   console.log('api call')
  //     callbeforeTime(req, res)
  //     return res.redirect('/marketing')
  // })

  // function stopLiveSMS() {
  //     clearTimeout(removetimes)
  // }

})

server = app.listen(port, () => {
  console.log("We Are Live On " + port)
})