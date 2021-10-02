var controller = module.exports = require('../controller/webHandler.js');

module.exports = {

    responseData: (file, data, res, req) => {
        webModel.categoryData((allcategory) => {
            webModel.loginData(req,(userdata) => {
                webModel.errorY(data, (similerProduct) => {
                    data['BaseUrl'] = BaseUrl
                    data['imgUrl'] = imgUrl
                    data['cimageUrl'] = cimgUrl
                    data['category'] = allcategory
                    data['userData'] = userdata
                    data['count'] = (typeof data.count != 'undefined') ? data.count : '',
                    data['error'] = (typeof data.error != 'Y') ? similerProduct : ''
                    // return res.send(data)
                    return res.render(file, data)
                })
            })
        })
    },

    webApi: () => {
        //get api
        app.get('/',                           controller.index)
        app.get('/profile',                    controller.profile)
        app.get('/register',                   controller.register_get)
        app.get('/productDetail',              controller.productDetail)
        app.get('/productList',                controller.productList)
        app.get('/addCart',                    controller.addCart)
        app.get('/cart',                       controller.cart)
        app.get('/removeCart',                 controller.removeCart)
        app.get('/deleteCart',                 controller.deleteCart)
        app.get('/search',                     controller.search)
        app.get('/login',                      controller.login_get)
        app.get('/checkout',                   controller.checkout)
        app.get('/checkoutbycart',             controller.checkoutbycart)
        app.get('/wishlist',                   controller.wishlist)
        app.get('/deleteWishlistProduct',      controller.deleteWishlistProduct)
        app.get('/addWishlistProduct',         controller.addWishlistProduct)
        app.get('/logout',                     controller.logout)
        app.get('/getAddress',                 controller.getAddress)
        app.get('/deleteAddress',              controller.deleteAddress)
        app.get('/buynow',                     controller.buynow)

        //post api
        app.post('/login',                     controller.login_post)
        app.post('/register',                  controller.register_post)
        app.post('/updateProfile',             controller.updateProfile)
        app.post('/forgotPassword',            controller.forgotPassword)
        app.post('/addaddress',                controller.addaddress)
        app.post('/updateAddress',             controller.updateAddress)
        app.post('/paymentCheckout',           controller.paymentCheckout)
        app.post('/paymentCheckoutbycart',     controller.paymentCheckoutbycart)
        app.post('/order',                     controller.order)
        app.use(                               controller.fourzerofour)
    },

    categoryData: (callback) => {
        aggregate = [
            {
                "$lookup": {
                    "from": "subcate",
                    "localField": "_id",
                    "foreignField": "cate",
                    "as": "subcate"
                }
            },
            {
                "$unwind": {
                    path: "$subcate",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                "$lookup": {
                    "from": "petacate",
                    "let": {
                        cId: "$subcate.cate",
                        sId: "$subcate._id"
                    },
                    "pipeline": [
                        {
                         $match: {
                          $expr: {
                           $and: [
                            {
                              $eq: [
                                "$subcate",
                                "$$sId"
                              ]
                            },
                            {
                              $eq: [
                                "$cate",
                                "$$cId"
                              ]
                            },
                           ]
                          }
                         }
                        }
                    ],
                    "as": "subcate.petacate"
                }
            },
            {
                "$group": {
                    "_id": "$_id",
                    "name": {
                        "$first": "$name"
                    },
                    "subcate": {
                        $push: "$subcate"
                    }
                }
            }
        ]
        db.collection('cate').aggregate(aggregate).sort({_id: 1}).toArray((err, category) => {
            callback(category)
        })
    },

    loginData: (req, callback) => {
        sess = req.session;
        if (typeof sess.mobileNo != 'undefined') {
            db.collection('user').findOne({ mobileNo: sess.mobileNo }, (err, mydata) => {
                db.collection('cart').findOne({ mobileNo: sess.mobileNo }, (er, cartCount) => {
                    var totalItem = []
                    if(cartCount){
                        for (var i = 0; i < cartCount.cart.length; i++) {
                            totalItem.push(cartCount.cart[i].quantity)
                        }
                        var itemsum = totalItem.reduce(function (a, b) {
                            console.log(a + b)
                            return a + b;
                        }, 0)
                        var data = {
                            _id: mydata._id,
                            firstname: mydata.firstname,
                            mobileNo: mydata.mobileNo,
                            gender: mydata.gender,
                            email: mydata.email,
                            cartCount: itemsum
                        }
                        if (mydata) {
                            callback(data)
                        } else {
                            callback()
                        }
                    } else {
                        var data = {
                            _id: mydata._id,
                            firstname: mydata.firstname,
                            mobileNo: mydata.mobileNo,
                            gender: mydata.gender,
                            email: mydata.email,
                            cartCount: 0
                        }
                        if (mydata) {
                            callback(data)
                        } else {
                            callback()
                        }
                    }
                    
                })
            })
        } else {
            callback()
        }
    },

    errorY: (data, callback) => {
        if (data.error == 'Y') {
            db.collection('product').find({ pAprove: 1 }).sort({ _id: -1 }).limit(8).toArray((e, results) => {
                if (!e) {
                    db.collection('petacate').find().toArray((err2, gstCharge) => {
                        if (!err2) {
                            for (var i = 0; i < results.length; i++) {
                                for (var k = 0; k < gstCharge.length; k++) {
                                    if (results[i].petacate.toString() == gstCharge[k]._id.toString()) {
                                        cgst = results[i].price * gstCharge[k].cgst / 100;
                                        sgst = results[i].price * gstCharge[k].sgst / 100;
                                        igst = results[i].price * gstCharge[k].igst / 100;
                                    }
                                    results[i].price = parseInt(cgst + sgst + igst + results[i].price)
                                }
                            }
                            callback(results)
                        } else {
                            callback()
                        }
                    })
                } else {
                    callback()
                }
            })
        } else {
            callback()
        }
    }

}