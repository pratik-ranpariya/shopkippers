const { link } = require('fs');

var controller = module.exports = require('../controller/serverHandler.js');

module.exports = {

    // checkauthentication: (itsmobile, itsweb, req, res) => {

    //     if(itsweb['isBot'] == 'postman'){
    
    //         return { req, res, from: 'postmen' }
    //         // return false;
    //         return res.send({ error: 'Y', msg: 'unAuthorised Api Call', data: [] })
    
    //     } else if (itsweb['isAuthoritative'] == true) {
    
    //         sess = req.session
    //         if (typeof sess.user != 'undefined') {
    //             return {req, res, from: 'web'}
    //         } else {
    //             return {req, res, from: 'web'}
    //             res.send({ ww: 'Session Not found!!' })
    //         }
    //         // res.send({ error: 'N', msg: 'its call from Browser', data: [] })
            
    //     } else {
    
    //         if (itsmobile == 'mobile') {
    //             return { req, res, from: 'mobile' }
    //             // res.send({ error: 'N', msg: 'its call from Android App', data: [] })
    //         } else {
    //             res.send({ error: 'Y', msg: 'unAuthorised Api Call from android App', data: [] })
    //         }
            
    //     }
    // },

    myapi: () => {

        //get api
        app.get('/index',                 controller.index)
        app.get('/findcategory',          controller.findcategory)
        app.get('/productList',           controller.productList)
        app.get('/search',                controller.search)
        app.get('/productDetail',         controller.productDetail)

        // post api
        app.post('/login',                controller.login)
        app.post('/register',             controller.register)
        app.post('/insertaddress',        controller.insertaddress)
        app.post('/getaddress',           controller.getaddress)
        app.post('/payment',              controller.payment)
        app.post('/wishlist',             controller.wishlist)
        app.post('/deleteWishlistProduct',controller.deleteWishlistProduct)
        app.post('/addWishlistProduct',   controller.addWishlistProduct)
        app.post('/addCart',              controller.addCart)
        app.post('/cart',                 controller.cart)
        app.post('/removeCart',           controller.removeCart)
        app.post('/deleteCart',           controller.deleteCart)
        app.post('/orderHistory',         controller.orderHistory)
        app.post('/deleteAddress',        controller.deleteAddress)

        // app.post('/marketingnumber', (req, res) => {
        //     sess = req.session;
        //     sess.active = 'marketing';

        //     if (typeof sess.user != 'undefined') {
        //         var array2 = req.body.mobile.split("\n");

        //         db.collection('LudoNewUser').find({}).toArray((err, existmobileNo) => {

        //             var array1 = []
        //             for (var i = 0; i < existmobileNo.length; i++) {
        //                 var mydata = existmobileNo[i].mobileNo
        //                 array1.push(mydata)
        //             }
        //             console.log(array1, array2)

        //             var InsertMobile = array2.filter(function (obj) { return array1.indexOf(obj) == -1; });
        //             var common = array1.filter(value => array2.includes(value));

        //             if (InsertMobile.length != 0) {
        //                 for (var i = 0; i < InsertMobile.length; i++) {
        //                     db.collection('marketing').insertOne({ mobileNo: InsertMobile[i] }, (err, ifexist) => {
        //                         i--
        //                         console.log((InsertMobile.length - i) == InsertMobile.length, (InsertMobile.length - i), InsertMobile.length)
        //                         if ((InsertMobile.length - i) == InsertMobile.length) {
        //                             return responseData('marketing.html',
        //                                 {
        //                                     data: common,
        //                                     msg: 'successfully inserted'
        //                                 },
        //                                 res
        //                             )
        //                         }
        //                     })
        //                 }
        //             } else {
        //                 return responseData('marketing.html',
        //                     {
        //                         data: common,
        //                         msg: 'All Number Is Commen'
        //                     },
        //                     res
        //                 )
        //             }
        //         })
        //     } else {
        //         res.redirect('/');
        //     }
        // })



    }

}