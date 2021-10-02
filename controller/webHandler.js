
exports.login_post = (req, res) => {

    sess = req.session;
    var data = req.body;
    var mobileNo = data.mobileNo;
    var password = data.password;

    if (mobileNo && password) {

        db.collection('user').findOne({ mobileNo: mobileNo }, (err, result) => {
            if (err) {
                return webModel.responseData('web/404.html', {
                    data: '',
                    msg: 'something Going Wrong',
                    error: "Y"
                }, res, req)
            }
            if (result) {
                bcrypt.compare(password, result.password, function (err1, trueres) {
                    if (err1) {
                        return webModel.responseData('web/404.html', {
                            data: '',
                            msg: 'something Going Wrong',
                            error: "Y"
                        }, res, req)
                    }
                    if (trueres == true) {
                        // var datas = {
                        //     userid: result._id,
                        //     name: result.name,
                        //     mobileNo: result.mobileNo,
                        //     email: result.email,
                        //     // my_referid: result.my_referid,
                        //     // walletBalance: 0,
                        //     // coinBalance: 0,
                        //     date: result.date
                        // }
                        if (result.block == 1) {
                            return webModel.responseData('web/index.html', {
                                msg: 'Your Account Is Blocked Due To illegal Activity',
                                error: 'Y'
                            }, res, req)
                        } else {
                            sess.mobileNo = result.mobileNo;
                            console.log(sess.mobileNo)
                            res.redirect('/');
                        }
                    } else {
                        // sess.mobileNo = req.body.mobileNo;
                        webModel.responseData('web/login.html', {
                            msg: 'Mobile Number and Password does not match',
                            error: 'Y'
                        }, res, req)
                    }
                })
            } else {
                return webModel.responseData('web/login.html', {
                    msg: 'Mobile Number Not Registered',
                    error: 'Y'
                }, res, req)
            }
        })
    } else {
        return webModel.responseData('web/login.html', {
            msg: 'Fillup All Detail',
            error: 'Y'
        }, res, req)
    }
}

exports.register_post = (req, res) => {
    var data = req.body;
    if (data.firstname && data.lastname && data.mobileNo && data.password && data.gender) {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            bcrypt.hash(data.password, salt, (err, hash) => {
                var currentTime = new Date()
                currentTime.setUTCHours(currentTime.getHours() + 5);
                currentTime.setUTCMinutes(currentTime.getMinutes() + 30);
                var register = {
                    firstname: data.firstname,
                    lastname: data.lastname,
                    mobileNo: data.mobileNo,
                    gender: data.gender,
                    email: typeof data.email == 'undefined' ? '' : data.email,
                    password: hash,
                    block: 0,
                    address: [],
                    wishlist: [],
                    date: currentTime
                }
                db.collection('user').findOne({ mobileNo: data.mobileNo }, (e, result) => {
                    if (!e) {
                        if (result) {
                            return webModel.responseData('web/register.html', {
                                msg: 'Mobile Number Already Exist',
                                error: "N"
                            }, res, req)
                        } else {
                            if (data.email) {
                                db.collection('user').findOne({ email: data.email }, (er, emailexist) => {
                                    if (!er) {
                                        if (emailexist) {
                                            return webModel.responseData('web/register.html', {
                                                msg: 'Email Already Exist',
                                                error: "N"
                                            }, res, req)
                                        } else {
                                            db.collection('user').insertOne(register, (errs, response) => {
                                                if (!errs) {
                                                    return webModel.responseData('web/login.html', {
                                                        msg: '',
                                                        error: "N"
                                                    }, res, req)
                                                } else {
                                                    return webModel.responseData('web/login.html', {
                                                        msg: 'Something Going Wrong',
                                                        error: "Y"
                                                    }, res, req)
                                                }
                                            })
                                        }
                                    } else {
                                        return webModel.responseData('web/404.html', {
                                            data: '',
                                            msg: 'something Going Wrong',
                                            error: "Y"
                                        }, res, req)
                                    }
                                })
                            } else {
                                db.collection('user').insertOne(register, (err, response) => {
                                    if (!err) {
                                        return webModel.responseData('web/register.html', {
                                            msg: 'Something Going Wrong',
                                            error: "Y"
                                        }, res, req)
                                    } else {
                                        return webModel.responseData('web/404.html', {
                                            data: '',
                                            msg: 'something Going Wrong',
                                            error: "Y"
                                        }, res, req)
                                    }
                                })
                            }
                        }
                    } else {
                        return webModel.responseData('web/404.html', {
                            data: '',
                            msg: 'something Going Wrong',
                            error: "Y"
                        }, res, req)
                    }
                })
            })
        })
    } else {
        return webModel.responseData('web/register.html', {
            data: '',
            msg: 'Fillup All Detail',
            error: "N"
        }, res, req)
    }
}

exports.register_get = (req, res) => {
    return webModel.responseData('web/register.html', {
        msg: '',
        error: "N"
    }, res, req)
}

exports.login_get = (req, res) => {
    return webModel.responseData('web/login.html', {
        msg: '',
        error: "N"
    }, res, req)
}

exports.index = (req, res) => {
    db.collection('product').find({ pAprove: 1 }).sort({ _id: -1 }).limit(8).toArray((e, results) => {
        if (!e) {
            db.collection('subcate').find({}).toArray((er, mydatas) => {
                if (!er) {
                    db.collection('banner').find({}).project({_id: 0, banner: 1}).toArray((err, mybanner) => {
                        if (!err) {
                            db.collection('petacate').find().toArray((errr, gstCharge) => {
                                if(!errr){
                                    for (var i = 0; i < results.length; i++) {
                                        for (var k = 0; k < gstCharge.length; k++) {
                                            if (results[i].petacate.toString() == gstCharge[k]._id.toString()) {
                                                cgst = results[i].price * gstCharge[k].cgst / 100;
                                                sgst = results[i].price * gstCharge[k].sgst / 100;
                                                igst = results[i].price * gstCharge[k].igst / 100;
                                            }
                                        }
                                        results[i].price = parseInt(cgst + sgst + igst + results[i].price)
                                    }
                                } else {
                                    return webModel.responseData('web/404.html', {
                                        data: '',
                                        msg: 'something Going Wrong',
                                        error: "Y"
                                    }, res, req)
                                }
                            })
                            for(var i = 0; i < mybanner.length; i++){
                                mybanner[i].banner = bImgUrl+mybanner[i].banner
                            }
                            return webModel.responseData('web/index.html', {
                                category: mydatas,
                                banner: mybanner,
                                newProduct: results,
                                mostpopuler: [],
                                msg: '',
                                error: "N"
                            }, res, req)
                        } else {
                            return webModel.responseData('web/404.html', {
                                data: '',
                                msg: 'something Going Wrong',
                                error: "Y"
                            }, res, req)
                        }
                    })
                } else {
                    return webModel.responseData('web/404.html', {
                        data: '',
                        msg: 'something Going Wrong',
                        error: "Y"
                    }, res, req)
                }
            })
        } else {
            return webModel.responseData('web/404.html', {
                data: '',
                msg: 'something Going Wrong',
                error: "Y"
            }, res, req)
        }
    })
}

exports.productDetail = (req, res) => {
    sess = req.session
    if (objectId.isValid(req.query.pid)) {
        db.collection('product').findOne({ _id: objectId(req.query.pid), pAprove: 1 }, (e, productDetail) => {
            if (!e) {
                if (productDetail) {
                    db.collection('product').find({ _id: { $nin: [objectId(req.query.pid)] }, subcate: objectId(productDetail.subcate), pAprove: 1 }).sort({ _id: -1 }).limit(8).toArray((er, similerP) => {
                        db.collection('deleverycharge').find().toArray((err4, mycharge) => {
                            db.collection('petacate').findOne({ _id: objectId(productDetail.petacate) }, (err5, gstCharge) => {
                                db.collection('petacate').find().toArray((err6, mygstCharge) => {
                                    if (!er) {
                                        productDetail.wishlist = 0
                                        productDetail.cart = 0
                                        for (var i = 0; i < (productDetail.productImage).length; i++) {
                                            productDetail.productImage[i] = productDetail.productImage[i]
                                        }

                                        if (productDetail.delivery != 0) {
                                            var dynamicCharge = []
                                            for (var i = 0; i < mycharge.length; i++) {
                                                if (mycharge[i].from < productDetail.weight && mycharge[i].to > productDetail.weight) {
                                                    dynamicCharge.push(mycharge[i].rate)
                                                }
                                            }
                                            if (dynamicCharge[0] == null) {
                                                productDetail.delivery = mycharge.sort((a, b) => b.rate - a.rate)[0].rate;
                                            } else {
                                                productDetail.delivery = dynamicCharge[0]
                                            }
                                        }

                                        var cgst = productDetail.price * gstCharge.cgst / 100;
                                        var sgst = productDetail.price * gstCharge.sgst / 100;
                                        var igst = productDetail.price * gstCharge.igst / 100;

                                        productDetail.price = parseInt(cgst + sgst + igst + productDetail.price)

                                        for (var i = 0; i < similerP.length; i++) {
                                            for (var k = 0; k < mygstCharge.length; k++) {
                                                if (similerP[i].petacate.toString() == mygstCharge[k]._id.toString()) {
                                                    cgst = similerP[i].price * mygstCharge[k].cgst / 100;
                                                    sgst = similerP[i].price * mygstCharge[k].sgst / 100;
                                                    igst = similerP[i].price * mygstCharge[k].igst / 100;
                                                }
                                            }
                                            similerP[i].price = parseInt(cgst + sgst + igst + similerP[i].price)
                                        }

                                        if (sess.mobileNo) {
                                            db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, mydata) => {
                                                if (!e) {
                                                    arraywishlist = []
                                                    for (var i = 0; i < mydata.wishlist.length; i++) {
                                                        if (mydata.wishlist[i].pid.toString() == req.query.pid) {
                                                            arraywishlist.push(productDetail.wishlist = 1)
                                                        }
                                                    }
                                                    db.collection('cart').findOne({ mobileNo: sess.mobileNo }, (e, cartdata) => {
                                                        if (!e) {
                                                            if (cartdata) {
                                                                arraycart = []
                                                                for (var i = 0; i < cartdata.cart.length; i++) {
                                                                    if (cartdata.cart[i].pid.toString() == req.query.pid) {
                                                                        arraycart.push(productDetail.cart = 1)
                                                                    }
                                                                }
                                                                return webModel.responseData('web/productbuy.html', {
                                                                    product: productDetail,
                                                                    similerProduct: similerP,
                                                                    msg: '',
                                                                    error: "N"
                                                                }, res, req)
                                                            } else {
                                                                return webModel.responseData('web/productbuy.html', {
                                                                    product: productDetail,
                                                                    similerProduct: similerP,
                                                                    msg: '',
                                                                    error: "N"
                                                                }, res, req)
                                                            }
                                                        } else {
                                                            return webModel.responseData('web/404.html', {
                                                                data: '',
                                                                msg: 'Something Going Wrong',
                                                                error: "Y"
                                                            }, res, req)
                                                        }
                                                    })
                                                } else {
                                                    return webModel.responseData('web/404.html', {
                                                        data: '',
                                                        msg: 'Something Going Wrong',
                                                        error: "Y"
                                                    }, res, req)
                                                }
                                            })
                                        } else {
                                            return webModel.responseData('web/productbuy.html', {
                                                product: productDetail,
                                                similerProduct: similerP,
                                                msg: '',
                                                error: "N"
                                            }, res, req)
                                        }
                                    } else {
                                        return webModel.responseData('web/404.html', {
                                            data: '',
                                            msg: 'Something Going Wrong',
                                            error: "Y"
                                        }, res, req)
                                    }
                                })
                            })
                        })
                    })
                } else {
                    return webModel.responseData('web/404.html', {
                        data: '',
                        msg: 'Product Not Found',
                        error: "Y"
                    }, res, req)
                }
            } else {
                return webModel.responseData('web/404.html', {
                    data: '',
                    msg: 'something Going Wrong',
                    error: "Y"
                }, res, req)
            }
        })
    } else {
        return webModel.responseData('web/404.html', {
            data: '',
            msg: 'Product id not valid',
            error: "Y"
        }, res, req)
    }
}

exports.productList = (req, res) => {
    var wh = {}

    if (req.query.cid) {
        if (!objectId.isValid(req.query.cid)) {
            // wh['cate'] = '';
        } else {
            wh['cate'] = objectId(req.query.cid)
        }
    }

    if (req.query.scid) {
        if (!objectId.isValid(req.query.scid)) {
            // wh['subcate'] = '';
        } else {
            wh['subcate'] = objectId(req.query.scid)
        }
    }

    if (req.query.pcid) {
        if (!objectId.isValid(req.query.pcid)) {
            // wh['petacate'] = '';
            // console.log(wh)
        } else {
            wh['petacate'] = objectId(req.query.pcid)
        }
    }

    if (req.query.pcid || req.query.scid || req.query.cid) {
        wh['pAprove'] = 1
    }

    if (req.query.rating) {
        wh['rating'] = { $gte: parseInt(req.query.rating), $lte: parseInt(req.query.rating) + 1 }
    }

    if (req.query.minPrice || req.query.maxPrice) {
        wh['price'] = { $gte: parseInt(req.query.minPrice), $lte: parseInt(req.query.maxPrice) }
    }

    var perPage = 12;
    var page = (typeof req.query.page != 'undefined') ? (req.query.page == 0) ? 1 : parseInt(req.query.page) || 1 : 1;
    var skip = (perPage * page) - perPage;

    if (!(wh.petacate || wh.subcate || wh.cate)) {
        var data = {
            search: {
                minPrice: 1
            },
            startP: skip + 1,
            endP: skip + perPage,
            current: page,
            pages: 1
        }
        return webModel.responseData('web/productlist.html', {
            data: '',
            Listname: 'result Not Found',
            count: data,
            msg: '',
            error: "N"
        }, res, req)
    }

    db.collection('product').find(wh).sort({ _id: -1 }).skip(skip).limit(perPage).toArray((e, results) => {
        if (!e) {
            db.collection('petacate').find().toArray((errs, gstCharge) => {
                if (!errs) {
                    for (var i = 0; i < results.length; i++) {
                        for (var k = 0; k < gstCharge.length; k++) {
                            if (results[i].petacate.toString() == gstCharge[k]._id.toString()) {
                                cgst = results[i].price * gstCharge[k].cgst / 100;
                                sgst = results[i].price * gstCharge[k].sgst / 100;
                                igst = results[i].price * gstCharge[k].igst / 100;
                            }
                        }
                        results[i].price = parseInt(cgst + sgst + igst + results[i].price)
                    }
                    db.collection('product').countDocuments(wh, (er, pCount) => {
                        if (!er) {
                            var data = {
                                search: req.query,
                                startP: skip + 1,
                                endP: skip + perPage,
                                current: page,
                                pages: Math.ceil(pCount / perPage)
                            }

                            function Listname(req, res, callback) {
                                if (wh.petacate) {
                                    db.collection('petacate').findOne({ _id: wh.petacate }, (err, result) => {
                                        if (!err) {
                                            if (result) {
                                                return callback(result.name)
                                            } else {
                                                return callback()
                                            }
                                        } else {
                                            return webModel.responseData('web/404.html', {
                                                data: '',
                                                msg: 'Something Going Wrong!!',
                                                error: "Y"
                                            }, res, req)
                                        }
                                    })
                                } else if (wh.subcate) {
                                    db.collection('subcate').findOne({ _id: wh.subcate }, (err, result) => {
                                        if (!err) {
                                            if (result) {
                                                return callback(result.name)
                                            } else {
                                                return callback()
                                            }
                                        } else {
                                            return webModel.responseData('web/404.html', {
                                                data: '',
                                                msg: 'Something Going Wrong!!',
                                                error: "Y"
                                            }, res, req)
                                        }
                                    })
                                } else if (wh.cate) {
                                    db.collection('cate').findOne({ _id: wh.cate }, (err, result) => {
                                        if (!err) {
                                            if (result) {
                                                return callback(result.name)
                                            } else {
                                                return callback()
                                            }
                                        } else {
                                            return webModel.responseData('web/404.html', {
                                                data: '',
                                                msg: 'Something Going Wrong!!',
                                                error: "Y"
                                            }, res, req)
                                        }
                                    })
                                } else {
                                    return callback()
                                }
                            }
                            Listname(req, res, (i) => {
                                return webModel.responseData('web/productlist.html', {
                                    data: results,
                                    Listname: i,
                                    count: data,
                                    msg: '',
                                    error: "N"
                                }, res, req)
                            })
                        } else {
                            return webModel.responseData('web/404.html', {
                                data: '',
                                msg: 'Something Going Wrong!!',
                                error: "Y"
                            }, res, req)
                        }
                    })
                } else {
                    return webModel.responseData('web/404.html', {
                        data: '',
                        msg: 'Something Going Wrong!!',
                        error: "Y"
                    }, res, req)
                }
            })
        } else {
            return webModel.responseData('web/404.html', {
                data: '',
                msg: 'Something Going Wrong!!',
                error: "Y"
            }, res, req)
        }
    })
}

exports.search = (req, res) => {
    var wh = {}
    wh['pAprove'] = 1
    if (req.query.rating) {
        wh['rating'] = { $gte: parseInt(req.query.rating), $lte: parseInt(req.query.rating) + 1 }
    }
    if (req.query.minPrice || req.query.maxPrice) {
        wh['price'] = { $gte: parseInt(req.query.minPrice), $lte: parseInt(req.query.maxPrice) }
    }
    if (req.query.search) {
        wh['productName'] = { $regex: req.query.search, $options: "i" }
    }
    var perPage = 12;
    var page = (typeof req.query.page != 'undefined') ? (req.query.page == 0) ? 1 : parseInt(req.query.page) || 1 : 1;
    var skip = (perPage * page) - perPage;

    if (!(req.query.rating || (req.query.minPrice || req.query.maxPrice) || req.query.search)) {
        var data = {
            search: {
                minPrice: 1
            },
            startP: skip + 1,
            endP: skip + perPage,
            current: page,
            pages: 1
        }
        return webModel.responseData('web/productlist.html', {
            data: '',
            Listname: `Product Not Found`,
            count: data,
            msg: '',
            error: "N"
        }, res, req)
    }
    db.collection('product').find(wh).sort({ _id: -1 }).skip(skip).limit(perPage).toArray((e, results) => {
        if (!e) {
            db.collection('product').countDocuments(wh, (er, pCount) => {
                if (!er) {
                    db.collection('petacate').find().toArray((err, gstCharge) => {
                        if(!err){
                            for (var i = 0; i < results.length; i++) {
                                for (var k = 0; k < gstCharge.length; k++) {
                                    if (results[i].petacate.toString() == gstCharge[k]._id.toString()) {
                                        cgst = results[i].price * gstCharge[k].cgst / 100;
                                        sgst = results[i].price * gstCharge[k].sgst / 100;
                                        igst = results[i].price * gstCharge[k].igst / 100;
                                    }
                                }
                                results[i].price = parseInt(cgst + sgst + igst + results[i].price)
                            }
                            var data = {
                                search: req.query,
                                startP: skip + 1,
                                endP: skip + perPage,
                                current: page,
                                pages: Math.ceil(pCount / perPage)
                            }
                            return webModel.responseData('web/productlist.html', {
                                data: results,
                                Listname: `Show results for '${req.query.search}' instead`,
                                count: data,
                                msg: '',
                                error: "N"
                            }, res, req)
                        } else {
                            return webModel.responseData('web/404.html', {
                                data: '',
                                msg: 'Something Going Wrong!!',
                                error: "Y"
                            }, res, req)
                        }
                    })
                } else {
                    return webModel.responseData('web/404.html', {
                        data: '',
                        msg: 'Something Going Wrong!!',
                        error: "Y"
                    }, res, req)
                }
            })
        } else {
            return webModel.responseData('web/404.html', {
                data: '',
                msg: 'Something Going Wrong!!',
                error: "Y"
            }, res, req)
        }
    })
}

exports.buynow = (req, res) => {
    sess = req.session;
    if (typeof sess.mobileNo != 'undefined') {
        db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, ifexist) => {
            if (!e) {
                if (ifexist) {
                    if (objectId.isValid(req.query.pid)) {
                        db.collection('product').findOne({ _id: objectId(req.query.pid), pAprove: 1 }, (error, mypid) => {
                            if (!error) {
                                if (mypid) {
                                    sess.product = req.query.pid
                                    res.redirect('/checkout')
                                } else {
                                    return webModel.responseData('web/404.html', {
                                        data: '',
                                        msg: 'product Id not fund',
                                        error: "Y"
                                    }, res, req)
                                }
                            } else {
                                return webModel.responseData('web/404.html', {
                                    data: '',
                                    msg: 'Something Going Wrong!!',
                                    error: "Y"
                                }, res, req)
                            }
                        })
                    } else {
                        return webModel.responseData('web/404.html', {
                            data: '',
                            msg: 'product Id not Valid',
                            error: "Y"
                        }, res, req)
                    }

                } else {
                    return webModel.responseData('web/404.html', {
                        data: '',
                        msg: 'user not found',
                        error: "Y"
                    }, res, req)
                }
            } else {
                return webModel.responseData('web/404.html', {
                    data: '',
                    msg: 'Something Going Wrong!!',
                    error: "Y"
                }, res, req)
            }
        })
    } else {
        return res.redirect('/')
    }
}

exports.checkout = (req, res) => {
    sess = req.session;
    if (typeof sess.mobileNo != 'undefined') {
        if (typeof sess.product != 'undefined') {
            if (objectId.isValid(sess.product)) {
                db.collection('product').findOne({ _id: objectId(sess.product), pAprove: 1 }, (error, mypid) => {
                    if (!error) {
                        db.collection('petacate').findOne({ _id: objectId(mypid.petacate) }, (err2, gstCharge) => {
                            if (!err2) {
                                if (mypid) {
                                    db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, alladdress) => {
                                        if (!e) {
                                            db.collection('deleverycharge').find().toArray((err1, mycharge) => {
                                                if (!err1) {
                                                    var dd = []
                                                    for (var i = 0; i < alladdress.address.length; i++) {
                                                        var cc = {
                                                            _id: alladdress.address[i].id,
                                                            name: alladdress.address[i].name,
                                                            address: alladdress.address[i]['address'] = `${alladdress.address[i].BuildingNameOrHouseNumber}, 
                                                                    ${alladdress.address[i].area}, 
                                                                    ${alladdress.address[i].city}-${alladdress.address[i].pincode}, 
                                                                    ${alladdress.address[i].state}, 
                                                                    Mobile Number: ${alladdress.address[i].contactNumber}`,
                                                            date: alladdress.address[i].date
                                                        }
                                                        dd.push(cc)
                                                    }
                                                    if (mypid.delivery != 0) {
                                                        var dynamicCharge = []
                                                        for (var i = 0; i < mycharge.length; i++) {
                                                            if (mycharge[i].from < mypid.weight && mycharge[i].to > mypid.weight) {
                                                                dynamicCharge.push(mycharge[i].rate)
                                                            }
                                                        }
                                                        if (dynamicCharge[0] == undefined) {
                                                            mypid.DeliveryRate = mycharge.sort((a, b) => b.rate - a.rate)[0].rate;
                                                        } else {
                                                            mypid.DeliveryRate = dynamicCharge[0]
                                                        }
                                                    } else {
                                                        mypid.DeliveryRate = 0
                                                    }
                                                    var cgst = mypid.price * gstCharge.cgst / 100;
                                                    var sgst = mypid.price * gstCharge.sgst / 100;
                                                    var igst = mypid.price * gstCharge.igst / 100;
                                                    mypid.price = parseInt(cgst + sgst + igst + mypid.price)
                                                    mypid.withdelevery = mypid.price + mypid.DeliveryRate
                                                    console.log(mypid.withdelevery)
                                                    return webModel.responseData('web/checkout.html', {
                                                        data: dd,
                                                        product: mypid,
                                                        msg: '',
                                                        error: "N"
                                                    }, res, req)
                                                } else {
                                                    return webModel.responseData('web/404.html', {
                                                        data: '',
                                                        msg: 'Something Going Wrong!!',
                                                        error: "Y"
                                                    }, res, req)
                                                }
                                            })
                                        } else {
                                            return webModel.responseData('web/404.html', {
                                                data: '',
                                                msg: 'Something Going Wrong!!',
                                                error: "Y"
                                            }, res, req)
                                        }
                                    })
                                } else {
                                    return webModel.responseData('web/404.html', {
                                        data: '',
                                        msg: 'product not found!!',
                                        error: "Y"
                                    }, res, req)
                                }
                            } else {
                                return webModel.responseData('web/404.html', {
                                    data: '',
                                    msg: 'Something Going Wrong!!',
                                    error: "Y"
                                }, res, req)
                            }
                        })
                    } else {
                        return webModel.responseData('web/404.html', {
                            data: '',
                            msg: 'Something Going Wrong!!',
                            error: "Y"
                        }, res, req)
                    }
                })
            } else {
                return webModel.responseData('web/404.html', {
                    data: '',
                    msg: 'pid not valid!!',
                    error: "Y"
                }, res, req)
            }
        } else {
            return res.redirect('/')
        }
    } else {
        return res.redirect('/')
    }
}

exports.checkoutbycart = (req, res) => {
    sess = req.session;
    if (typeof sess.mobileNo != 'undefined') {

        db.collection('cart').findOne({ mobileNo: sess.mobileNo }, (er, mydata) => {
            if (!er) {
                if (mydata) {
                    var array = []
                    for (var i = 0; i < mydata.cart.length; i++) {
                        array.push(objectId(mydata.cart[i].pid))
                    }
                    db.collection('product').find({ _id: { $in: array } }).sort({ _id: 1 }).toArray((err, allcart) => {
                        if (!err) {
                            db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, alladdress) => {
                                if (!e) {
                                    db.collection('deleverycharge').find().toArray((err3, mycharge) => {
                                        if (!err3) {
                                            db.collection('petacate').find().toArray((err2, gstCharge) => {
                                                if (!err2) {

                                            var bigCharge = [], diliveryCharge = [], dynamicCharge = [], cartData = []
                                            bigCharge.push(mycharge.sort((a, b) => b.to - a.to)[0].to)
                                            diliveryCharge.push(mycharge.sort((a, b) => b.rate - a.to)[0].rate)

                                            for (var l = 0; l < allcart.length; l++) {
                                                if (allcart[l].delivery > 0) {
                                                    if (bigCharge[0] < allcart[l].weight) {
                                                        for (var j = 0; j < mydata.cart.length; j++) {
                                                            if (allcart[l]._id.toString() == mydata.cart[j].pid.toString()) {
                                                                dynamicCharge.push(diliveryCharge[0] * mydata.cart[j].quantity);
                                                            }
                                                        }
                                                    } else {
                                                        for (var k = 0; k < mycharge.length; k++) {
                                                            if (mycharge[k].from < allcart[l].weight && mycharge[k].to > allcart[l].weight) {
                                                                for (var j = 0; j < mydata.cart.length; j++) {
                                                                    if (allcart[l]._id.toString() == mydata.cart[j].pid.toString()) {
                                                                        dynamicCharge.push(mycharge[k].rate * mydata.cart[j].quantity);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }

                                            var total = 0;
                                            for (var totaldeleverycharge in dynamicCharge) { total += dynamicCharge[totaldeleverycharge]; }

                                            var totalAmount = []
                                            for (var i = 0; i < cartData.length; i++) {
                                                totalAmount.push(cartData[i].price)
                                            }
                                            var Amountsum = totalAmount.reduce(function (a, b) {
                                                return a + b;
                                            }, 0)


                                            for (var i = 0; i < allcart.length; i++) {
                                                for (var j = 0; j < mydata.cart.length; j++) {
                                                    if (allcart[i]._id.toString() == mydata.cart[j].pid.toString()) {
                                                        for (var k = 0; k < gstCharge.length; k++) {
                                                            if (allcart[i].petacate.toString() == gstCharge[k]._id.toString()) {
                                                                cgst = allcart[i].price * gstCharge[k].cgst / 100;
                                                                sgst = allcart[i].price * gstCharge[k].sgst / 100;
                                                                igst = allcart[i].price * gstCharge[k].igst / 100;
                                                            }
                                                        }
                                                        allcart[i].price = parseInt(cgst + sgst + igst + allcart[i].price)
                                                        var price = allcart[i].price * mydata.cart[j].quantity;
                                                        var mycart = {
                                                            pid: allcart[i]._id,
                                                            productName: allcart[i].productName,
                                                            price: price,
                                                            productImage: allcart[i].productImage[0],
                                                            quantity: mydata.cart[j].quantity
                                                        }
                                                    }
                                                }
                                                cartData.push(mycart)
                                            }

                                            var totalAmount = []
                                            for (var i = 0; i < cartData.length; i++) {
                                                totalAmount.push(cartData[i].price)
                                            }

                                            var sum = totalAmount.reduce(function (a, b) {
                                                return a + b;
                                            }, 0);

                                            var totalItem = []
                                            for (var i = 0; i < mydata.cart.length; i++) {
                                                totalItem.push(mydata.cart[i].quantity)
                                            }
                                            var itemsum = totalItem.reduce(function (a, b) {
                                                return a + b;
                                            }, 0)

                                            var dd = []

                                            for (var i = 0; i < alladdress.address.length; i++) {
                                                var cc = {
                                                    _id: alladdress.address[i].id,
                                                    name: alladdress.address[i].name,
                                                    address: alladdress.address[i]['address'] = `${alladdress.address[i].BuildingNameOrHouseNumber}, 
                                                            ${alladdress.address[i].area}, 
                                                            ${alladdress.address[i].city}-${alladdress.address[i].pincode}, 
                                                            ${alladdress.address[i].state}, 
                                                            Mobile Number: ${alladdress.address[i].contactNumber}`,
                                                    date: alladdress.address[i].date
                                                }
                                                dd.push(cc)
                                            }

                                            var withDelivery = total + sum

                                            var cartitem = {
                                                product: cartData,
                                                deleveryCharge: total,
                                                // totalAmount: Amountsum,
                                                withDelivery: withDelivery,
                                                data: dd,
                                                totaitem: itemsum,
                                                totalAmount: sum
                                            }
                                            console.log(cartitem)


                                            return webModel.responseData('web/checkoutbycart.html', {
                                                data: cartitem,
                                                msg: '',
                                                error: "N"
                                            }, res, req)

                                        } else {
                                            return webModel.responseData('web/404.html', {
                                                data: '',
                                                msg: 'Something Going Wrong!!',
                                                error: "Y"
                                            }, res, req)
                                        }
                                    })

                                        } else {
                                            return webModel.responseData('web/404.html', {
                                                data: '',
                                                msg: 'Something Going Wrong!!',
                                                error: "Y"
                                            }, res, req)
                                        }
                                    })
                                } else {
                                    return webModel.responseData('web/404.html', {
                                        data: '',
                                        msg: 'Something Going Wrong!!',
                                        error: "Y"
                                    }, res, req)
                                }
                            })
                        } else {
                            return webModel.responseData('web/404.html', {
                                data: '',
                                msg: 'Something Going Wrong!!',
                                error: "Y"
                            }, res, req)
                        }
                    })
                } else {
                    // var cartitem = {
                    //     product: [],
                    //     totalAmount: 0,
                    //     address: (typeof ifuserExits.address[0] != 'undefined') ? ifuserExits.address[0] : {}
                    // }
                    return webModel.responseData('web/404.html', {
                        data: 'cartitem',
                        msg: 'cart empty',
                        error: "Y"
                    }, res, req)
                }
            } else {
                return webModel.responseData('web/404.html', {
                    data: '',
                    msg: 'Something Going Wrong!!',
                    error: "Y"
                }, res, req)
            }
        })
        // if (typeof sess.product != 'undefined') {
        // if (objectId.isValid(sess.product)) {
        // db.collection('product').findOne({ _id: objectId(sess.product), pAprove: 1 }, (error, mypid) => {
        //     if (!error) {
        //         if (mypid) {
        //             db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, alladdress) => {
        //                 if (!e) {
        //                     var dd = []
        //                     for (var i = 0; i < alladdress.address.length; i++) {
        //                         var cc = {
        //                             _id: alladdress.address[i].id,
        //                             name: alladdress.address[i].name,
        //                             address: alladdress.address[i]['address'] = `${alladdress.address[i].BuildingNameOrHouseNumber}, 
        //                                     ${alladdress.address[i].area}, 
        //                                     ${alladdress.address[i].city}-${alladdress.address[i].pincode}, 
        //                                     ${alladdress.address[i].state}, 
        //                                     Mobile Number: ${alladdress.address[i].contactNumber}`,
        //                             date: alladdress.address[i].date
        //                         }
        //                         dd.push(cc)
        //                     }
        //                     return webModel.responseData('web/checkout.html', {
        //                         data: dd,
        //                         product: mypid,
        //                         msg: '',
        //                         error: "N"
        //                     }, res, req)
        //                 } else {
        //                     return webModel.responseData('web/404.html', {
        //                         data: '',
        //                         msg: 'Something Going Wrong!!',
        //                         error: "Y"
        //                     }, res, req)
        //                 }
        //             })
        //         } else {
        //             return webModel.responseData('web/404.html', {
        //                 data: '',
        //                 msg: 'product not found!!',
        //                 error: "Y"
        //             }, res, req)
        //         }
        //     } else {
        //         return webModel.responseData('web/404.html', {
        //             data: '',
        //             msg: 'Something Going Wrong!!',
        //             error: "Y"
        //         }, res, req)
        //     }
        // })
        //     } else {
        //         return webModel.responseData('web/404.html', {
        //             data: '',
        //             msg: 'pid not valid!!',
        //             error: "Y"
        //         }, res, req)
        //     }
        // } else {
        //     return res.redirect('/')
        // }
    } else {
        return res.redirect('/')
    }
}

exports.wishlist = (req, res) => {
    sess = req.session;
    if (typeof sess.mobileNo != 'undefined') {
        db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, mydata) => {
            if (!e) {
                var array = []
                for (var i = 0; i < mydata.wishlist.length; i++) {
                    array.push(objectId(mydata.wishlist[i].pid))
                }
                db.collection('product').find({ _id: { $in: array } }).sort({ _id: 1 }).toArray((er, allcart) => {
                    if (!er) {
                        db.collection('petacate').find().toArray((err, gstCharge) => {
                            if(!err){
                        var wishlistData = []
                        for (var i = 0; i < allcart.length; i++) {
                            for (var k = 0; k < gstCharge.length; k++) {
                                if (allcart[i].petacate.toString() == gstCharge[k]._id.toString()) {
                                    cgst = allcart[i].price * gstCharge[k].cgst / 100;
                                    sgst = allcart[i].price * gstCharge[k].sgst / 100;
                                    igst = allcart[i].price * gstCharge[k].igst / 100;
                                }
                            }
                            allcart[i].price = parseInt(cgst + sgst + igst + allcart[i].price)
                            var mycart = {
                                pid: allcart[i]._id,
                                productName: allcart[i].productName,
                                price: allcart[i].price,
                                productImage: allcart[i].productImage[0]
                            }
                            wishlistData.push(mycart)
                        }
                        return webModel.responseData('web/wishlist.html', {
                            data: wishlistData,
                            msg: '',
                            error: "N"
                        }, res, req)
                    } else {
                        return webModel.responseData('web/404.html', {
                            data: '',
                            msg: 'Something Going Wrong!!',
                            error: "Y"
                        }, res, req)
                    }
                })
                    } else {
                        return webModel.responseData('web/404.html', {
                            data: '',
                            msg: 'Something Going Wrong!!',
                            error: "Y"
                        }, res, req)
                    }
                })
            } else {
                return webModel.responseData('web/404.html', {
                    data: '',
                    msg: 'Something Going Wrong!!',
                    error: "Y"
                }, res, req)
            }
        })

    } else {
        return res.redirect('/')
    }
}

exports.deleteWishlistProduct = (req, res) => {
    sess = req.session;
    if (typeof sess.mobileNo != 'undefined') {
        if (objectId.isValid(req.query.pid)) {
            db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, mydata) => {
                if (!e) {
                    if (mydata) {
                        db.collection('user').update({ mobileNo: sess.mobileNo }, { $pull: { wishlist: { pid: objectId(req.query.pid) } } }, (er, updated) => {
                            if (!er) {
                                return res.redirect('/wishlist')
                            } else {
                                return webModel.responseData('web/404.html', {
                                    data: '',
                                    msg: 'Something Going Wrong!!',
                                    error: "Y"
                                }, res, req)
                            }
                        })
                    } else {
                        return webModel.responseData('web/404.html', {
                            data: '',
                            msg: 'User Not Found In wishlist!!',
                            error: "Y"
                        }, res, req)
                    }
                } else {
                    return webModel.responseData('web/404.html', {
                        data: '',
                        msg: 'Something Going Wrong!!',
                        error: "Y"
                    }, res, req)
                }
            })
        } else {
            return webModel.responseData('web/404.html', {
                data: '',
                msg: 'Something Going Wrong!!',
                error: "Y"
            }, res, req)
        }
    } else {
        return res.redirect('/')
    }
}

exports.addWishlistProduct = (req, res) => {
    sess = req.session;
    if (typeof sess.mobileNo != 'undefined') {
        if (objectId.isValid(req.query.pid)) {
            db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, mydata) => {
                if (!e) {
                    if (mydata) {
                        db.collection('user').findOne({ mobileNo: sess.mobileNo, wishlist: { $elemMatch: { pid: objectId(req.query.pid) } } }, (e, mydata) => {
                            if (!mydata) {
                                db.collection('user').update({ mobileNo: sess.mobileNo }, { $push: { wishlist: { pid: objectId(req.query.pid), date: new Date() } } }, (er, updated) => {
                                    if (!er) {
                                        return res.redirect('/wishlist')
                                    } else {
                                        return webModel.responseData('web/404.html', {
                                            data: '',
                                            msg: 'Something Going Wrong!!',
                                            error: "Y"
                                        }, res, req)
                                    }
                                })
                            } else {
                                return res.redirect('/wishlist')
                            }
                        })
                    } else {
                        return webModel.responseData('web/404.html', {
                            data: '',
                            msg: 'User Not Found In wishlist!!',
                            error: "Y"
                        }, res, req)
                    }
                } else {
                    return webModel.responseData('web/404.html', {
                        data: '',
                        msg: 'Something Going Wrong!!',
                        error: "Y"
                    }, res, req)
                }
            })
        } else {
            return webModel.responseData('web/404.html', {
                data: '',
                msg: 'Something Going Wrong!!',
                error: "Y"
            }, res, req)
        }
    } else {
        return res.redirect('/')
    }
}

exports.cart = (req, res) => {
    var data = req.body;
    sess = req.session;
    if (typeof sess.mobileNo != 'undefined') {
        db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, ifuserExits) => {
            if (!e) {
                if (ifuserExits) {
                    db.collection('cart').findOne({ mobileNo: sess.mobileNo }, (er, mydata) => {
                        if (!er) {
                            if (mydata) {
                                var array = []
                                for (var i = 0; i < mydata.cart.length; i++) {
                                    array.push(objectId(mydata.cart[i].pid))
                                }
                                db.collection('product').find({ _id: { $in: array } }).sort({ _id: 1 }).toArray((err, allcart) => {
                                    if (!err) {
                                        db.collection('petacate').find().toArray((err2, gstCharge) => {
                                            if (!err2) {
                                                db.collection('deleverycharge').find().toArray((err3, mycharge) => {
                                                    if (!err3) {

                                                        var bigCharge = [], diliveryCharge = [], dynamicCharge = [], cartData = []
                                                        bigCharge.push(mycharge.sort((a, b) => b.to - a.to)[0].to)
                                                        diliveryCharge.push(mycharge.sort((a, b) => b.rate - a.to)[0].rate)

                                                        for (var l = 0; l < allcart.length; l++) {
                                                            if (allcart[l].delivery > 0) {
                                                                if (bigCharge[0] < allcart[l].weight) {
                                                                    for (var j = 0; j < mydata.cart.length; j++) {
                                                                        if (allcart[l]._id.toString() == mydata.cart[j].pid.toString()) {
                                                                            dynamicCharge.push(diliveryCharge[0] * mydata.cart[j].quantity);
                                                                        }
                                                                    }
                                                                } else {
                                                                    for (var k = 0; k < mycharge.length; k++) {
                                                                        if (mycharge[k].from < allcart[l].weight && mycharge[k].to > allcart[l].weight) {
                                                                            for (var j = 0; j < mydata.cart.length; j++) {
                                                                                if (allcart[l]._id.toString() == mydata.cart[j].pid.toString()) {
                                                                                    dynamicCharge.push(mycharge[k].rate * mydata.cart[j].quantity);
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }

                                                        for (var i = 0; i < allcart.length; i++) {
                                                            for (var j = 0; j < mydata.cart.length; j++) {

                                                                if (allcart[i]._id.toString() == mydata.cart[j].pid.toString()) {

                                                                    var outofstock = 0
                                                                    if (!(mydata.cart[i].quantity <= (allcart[i].stock - allcart[i].soldCount))) {
                                                                        outofstock = 1
                                                                    }
                                                                    for (var k = 0; k < gstCharge.length; k++) {
                                                                        if (allcart[i].petacate.toString() == gstCharge[k]._id.toString()) {
                                                                            cgst = allcart[i].price * gstCharge[k].cgst / 100;
                                                                            sgst = allcart[i].price * gstCharge[k].sgst / 100;
                                                                            igst = allcart[i].price * gstCharge[k].igst / 100;
                                                                        }
                                                                    }
                                                                    allcart[i].price = parseInt(cgst + sgst + igst + allcart[i].price)
                                                                    var price = allcart[i].price * mydata.cart[j].quantity;
                                                                    var mycart = {
                                                                        pid: allcart[i]._id,
                                                                        productName: allcart[i].productName,
                                                                        singleproductprice: allcart[i].price,
                                                                        price: price,
                                                                        productImage: allcart[i].productImage[0],
                                                                        quantity: mydata.cart[j].quantity,
                                                                        outofstock: outofstock
                                                                    }
                                                                }
                                                            }
                                                            cartData.push(mycart)
                                                        }

                                                        var total = 0;
                                                        for (var totaldeleverycharge in dynamicCharge) { total += dynamicCharge[totaldeleverycharge]; }

                                                        var totalAmount = []
                                                        for (var i = 0; i < cartData.length; i++) {
                                                            totalAmount.push(cartData[i].price)
                                                        }
                                                        var Amountsum = totalAmount.reduce(function (a, b) {
                                                            return a + b;
                                                        }, 0)

                                                        var totalItem = []
                                                        for (var i = 0; i < mydata.cart.length; i++) {
                                                            totalItem.push(mydata.cart[i].quantity)
                                                        }
                                                        var itemsum = totalItem.reduce(function (a, b) {
                                                            return a + b;
                                                        }, 0)

                                                        var disableBuydata = []
                                                        for (var i = 0; i < cartData.length; i++) {
                                                            disableBuydata.push(cartData[i].outofstock)
                                                        }
                                                        var defaults = disableBuydata.reduce(function (a, b) {
                                                            return a + b;
                                                        }, 0)

                                                        var withDelivery = total + Amountsum

                                                        var cartitem = {
                                                            product: cartData,
                                                            deleveryCharge: total,
                                                            totalAmount: Amountsum,
                                                            withDelivery: withDelivery,
                                                            totalItem: itemsum,
                                                            disableBuy: (defaults > 0) ? 1 : 0
                                                        }

                                                        return webModel.responseData('web/cart.html', {
                                                            data: cartitem,
                                                            msg: '',
                                                            error: "N"
                                                        }, res, req)

                                                    } else {
                                                        return res.send({ data: {}, msg: 'Something Going Wrong!!', error: "Y" })
                                                    }
                                                })
                                            } else {
                                                return res.send({ data: {}, msg: 'Something Going Wrong!!', error: "Y" })
                                            }
                                        })
                                    } else {
                                        return res.send({ data: {}, msg: 'Something Going Wrong!!', error: "Y" })
                                    }
                                })
                            } else {
                                var cartitem = {
                                    product: [],
                                    deleveryCharge: 0,
                                    totalAmount: 0,
                                    totalItem: 0,
                                    disableBuy: 1
                                }

                                return webModel.responseData('web/cart.html', {
                                    data: cartitem,
                                    msg: '',
                                    error: "N"
                                }, res, req)
                                return res.send({ data: {}, msg: 'user not found!!', error: "Y" })
                            }
                        } else {
                            return res.send({ data: {}, msg: 'Something Going Wrong!!', error: "Y" })
                        }
                    })
                } else {
                    return res.send({ error: 'Y', msg: 'Mobile Number Not found', data: {} })
                }
            } else {
                return res.send({ error: 'Y', msg: 'Something Going Wrong', data: {} })
            }
        })
    } else {
        return res.redirect('/login')
    }
}

exports.addCart = (req, res) => {
    var data = req.query;
    sess = req.session;
    if (objectId.isValid(data.pid)) {
        if (typeof sess.mobileNo != 'undefined') {
            db.collection('cart').findOne({ mobileNo: sess.mobileNo }, (e, existuser) => {
                if (!e) {
                    db.collection('product').findOne({ _id: objectId(data.pid) }, (err2, pidExist) => {
                        if (!err2) {
                            if (pidExist) {
                                if (pidExist.stock != pidExist.soldCount) {
                                    if (existuser) {
                                        db.collection('cart').findOne({ mobileNo: sess.mobileNo, cart: { $elemMatch: { pid: objectId(data.pid) } } }, (er, mydata) => {
                                            if (!er) {
                                                if (mydata) {
                                                    for (var i = 0; i < mydata.cart.length; i++) {
                                                        if (mydata.cart[i].pid.toString() == data.pid) {
                                                            console.log((pidExist.stock - pidExist.soldCount) - mydata.cart[i].quantity, '======> data')
                                                            if(((pidExist.stock - pidExist.soldCount) - mydata.cart[i].quantity) <= 0){
                                                                return res.send({error: 'Y', msg: `only ${(pidExist.stock - pidExist.soldCount)} item available in stock`})
                                                            }
                                                        }
                                                    }
                                                    db.collection('cart').updateOne({ mobileNo: sess.mobileNo, cart: { $elemMatch: { pid: objectId(data.pid) } } }, { $inc: { "cart.$.quantity": +1 } }, (err, updated) => {
                                                        return res.redirect(307, '/cart')
                                                    })
                                                } else {
                                                    db.collection('cart').updateOne({ mobileNo: sess.mobileNo }, { $push: { cart: { pid: objectId(data.pid), quantity: 1, date: new Date() } } }, (err, insertone) => {
                                                        if (!err) {
                                                            return res.redirect(307, '/cart')
                                                        } else {
                                                            return res.send({ msg: 'Something Going Wrong!!', error: "Y" })
                                                        }
                                                    })
                                                }
                                            } else {
                                                return res.send({ error: 'Y', msg: 'something Going Wrong', data: [] })
                                            }
                                        })
                                    } else {
                                        var product = {
                                            mobileNo: sess.mobileNo,
                                            cart: [{
                                                pid: objectId(data.pid),
                                                quantity: 1,
                                                date: new Date()
                                            }]
                                        }
                                        db.collection('cart').insertOne(product, (err, mydata) => {
                                            if (!err) {
                                                return res.redirect(307, '/cart')
                                            } else {
                                                return res.send({ error: 'Y', msg: 'something Going Wrong', data: [] })
                                            }
                                        })
                                    }
                                } else {
                                    return res.send({ error: 'N', msg: 'out of stock', data: [] })
                                }
                            } else {
                                return res.send({ error: 'Y', msg: 'product Id Not Found', data: [] })
                            }
                        } else {
                            return res.send({ error: 'Y', msg: 'something Going Wrong', data: [] })
                        }
                    })
                } else {
                    return res.send({ error: 'Y', msg: 'something Going Wrong', data: [] })
                }
            })
        } else {
            return res.send({ error: 'Y', msg: 'Mobile Number Not found', data: [] })
        }
    } else {
        return res.send({ error: 'Y', msg: 'product id not Valid', data: [] })
    }
}

exports.deleteCart = (req, res) => {
    var data = req.query;
    if (objectId.isValid(data.pid)) {
        if (sess.mobileNo) {
            db.collection('cart').updateOne({ mobileNo: sess.mobileNo }, { $pull: { cart: { pid: objectId(data.pid) } } }, (e, update) => {
                if (!e) {
                    return res.redirect('/cart')
                } else {
                    return res.send({ error: 'Y', msg: 'something Going Wrong', data: [] })
                }
            })
        } else {
            return res.send({ error: 'Y', msg: 'Mobile Number Not found', data: [] })
        }
    } else {
        return res.send({ error: 'Y', msg: 'product id not Valid', data: [] })
    }
}

exports.removeCart = (req, res) => {
    var data = req.query;
    if (objectId.isValid(data.pid)) {
        if (sess.mobileNo) {
            db.collection('cart').findOne({ mobileNo: sess.mobileNo }, (e, existuser) => {
                if (!e) {
                    db.collection('product').findOne({ _id: objectId(data.pid) }, (err2, pidExist) => {
                        if (!err2) {
                            if (pidExist) {
                                if (existuser) {
                                    db.collection('cart').findOne({ mobileNo: sess.mobileNo, cart: { $elemMatch: { pid: objectId(data.pid) } } }, (er, mydata) => {
                                        if (!er) {
                                            if (mydata) {
                                                var array = []
                                                for (var i = 0; i < mydata.cart.length; i++) {
                                                    if (mydata.cart[i].pid.toString() == data.pid) {
                                                        array.push(mydata.cart[i].quantity)
                                                    }
                                                }
                                                if (array[0] > 1) {
                                                    db.collection('cart').updateOne({ mobileNo: sess.mobileNo, cart: { $elemMatch: { pid: objectId(data.pid) } } }, { $inc: { "cart.$.quantity": -1 } }, (err, updated) => {
                                                        console.log('cart')
                                                        return res.redirect('/cart')
                                                    })
                                                } else {
                                                    console.log('dasdas')
                                                    return res.send({ error: 'Y', msg: 'minimum allow 1 product', data: [] })
                                                }
                                            } else {
                                                return res.send({ error: 'Y', msg: 'product not available in cart', data: [] })
                                            }
                                        } else {
                                            return res.send({ error: 'Y', msg: 'something Going Wrong', data: [] })
                                        }
                                    })
                                } else {
                                    return res.send({ error: 'Y', msg: 'product not available in cart', data: [] })
                                }
                            } else {
                                return res.send({ error: 'Y', msg: 'product Id Not Found', data: [] })
                            }
                        } else {
                            return res.send({ error: 'Y', msg: 'something Going Wrong', data: [] })
                        }
                    })
                } else {
                    return res.send({ error: 'Y', msg: 'something Going Wrong', data: [] })
                }
            })
        } else {
            return res.send({ error: 'Y', msg: 'Mobile Number Not found', data: [] })
        }
    } else {
        return res.send({ error: 'Y', msg: 'product id not Valid', data: [] })
    }
}

exports.profile = (req, res) => {
    sess = req.session;
    if (typeof sess.mobileNo != 'undefined') {
        db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, mydata) => {
            if (!e) {
                if (mydata) {
                    var dd = []
                    for (var i = 0; i < mydata.address.length; i++) {
                        dd.push(`${mydata.address[i].BuildingNameOrHouseNumber}, ${mydata.address[i].area}, ${mydata.address[i].city}-${mydata.address[i].pincode}, ${mydata.address[i].state}, Mobile Number: ${mydata.address[i].contactNumber}`)
                    }

                    var allinformation = {
                        profile: {
                            firstname: mydata.firstname,
                            lastname: mydata.lastname,
                            email: mydata.email,
                            gender: mydata.gender
                        },
                        alladdress: dd
                    }
                    return webModel.responseData('web/profile.html', {
                        data: allinformation,
                        msg: '',
                        error: "N"
                    }, res, req)
                } else {
                    return webModel.responseData('web/404.html', {
                        data: '',
                        msg: 'user not found',
                        error: "Y"
                    }, res, req)
                }
            } else {
                return webModel.responseData('web/404.html', {
                    data: '',
                    msg: 'Something Going Wrong',
                    error: "Y"
                }, res, req)
            }
        })
    } else {
        return res.redirect('/')
    }
}

exports.updateProfile = (req, res) => {
    sess = req.session;
    if (typeof sess.mobileNo != 'undefined') {
        var data = req.body;
        var updatedata = {
            $set: {
                firstname: data.firstname,
                lastname: data.lastname,
                email: (typeof data.email != 'undefined') ? data.email : '',
                gender: data.gender
            }
        }
        var query = {
            mobileNo: sess.mobileNo
        }
        db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, mydata) => {
            if (!e) {
                if (mydata) {
                    db.collection('user').updateOne(query, updatedata, (er, ifsuccess) => {
                        if (!er) {
                            return res.redirect('/profile')
                        } else {
                            return webModel.responseData('web/404.html', {
                                data: '',
                                msg: 'Something Going Wrong',
                                error: "Y"
                            }, res, req)
                        }
                    })
                } else {
                    return webModel.responseData('web/404.html', {
                        data: '',
                        msg: 'user not found',
                        error: "Y"
                    }, res, req)
                }
            } else {
                return webModel.responseData('web/404.html', {
                    data: '',
                    msg: 'Something Going Wrong',
                    error: "Y"
                }, res, req)
            }
        })
    } else {
        return res.redirect('/')
    }
}

exports.forgotPassword = (req, res) => {
    sess = req.session;
    if (typeof sess.mobileNo != 'undefined') {
        var data = req.body;
        if (data.currentPassword && data.newPassword1 && data.newPassword2) {
            if (data.newPassword1 == data.newPassword2) {
                var query = { mobileNo: sess.mobileNo }
                db.collection('user').findOne(query, (er, ifMobileExist) => {
                    if (!er) {
                        if (ifMobileExist) {
                            bcrypt.compare(data.currentPassword, ifMobileExist.password, function (e, trueres) {
                                if (!e) {
                                    if (trueres == true) {
                                        bcrypt.genSalt(saltRounds, (err, salt) => {
                                            bcrypt.hash(data.newPassword1, salt, (err, hash) => {
                                                var newPass = { $set: { password: hash } }
                                                db.collection('user').updateOne(query, newPass, (err, updatedsuccess) => {
                                                    if (!err) {
                                                        return res.send({ error: 'N', msg: 'password change successfully.', data: '' })
                                                    } else {
                                                        return webModel.responseData('web/404.html', {
                                                            data: '',
                                                            msg: 'user not found',
                                                            error: "Y"
                                                        }, res, req)
                                                    }
                                                })

                                            })
                                        })
                                    } else {
                                        return res.send({ error: 'Y', msg: 'Wrong Password', data: '' })
                                    }
                                } else {
                                    return webModel.responseData('web/404.html', {
                                        data: '',
                                        msg: 'something Going Wrong',
                                        error: "Y"
                                    }, res, req)
                                }
                            })
                        } else {
                            return webModel.responseData('web/404.html', {
                                data: '',
                                msg: 'user not found',
                                error: "Y"
                            }, res, req)
                        }
                    } else {
                        return webModel.responseData('web/404.html', {
                            data: '',
                            msg: 'something Going Wrong',
                            error: "Y"
                        }, res, req)
                    }
                })
            } else {
                return res.send({ error: 'Y', msg: 'Password Not match', data: '' })
            }
        } else {
            return res.send({
                data: '',
                msg: 'Fillup All Detail',
                error: "Y"
            })
        }
    } else {
        return res.redirect('/')
    }
}

exports.addaddress = (req, res) => {
    sess = req.session;
    if (typeof sess.mobileNo != 'undefined') {
        var data = req.body
        if (sess.mobileNo && data.name && data.BuildingNameOrHouseNumber && data.area && data.contactNumber && data.pincode && data.state && data.city) {
            var address = {
                id: objectId(),
                mobileNo: sess.mobileNo,
                name: data.name,
                BuildingNameOrHouseNumber: data.BuildingNameOrHouseNumber,
                area: data.area,
                contactNumber: data.contactNumber,
                pincode: data.pincode,
                state: data.state,
                city: data.city,
                date: new Date()
            }
            db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, ifavail) => {
                if (!e) {
                    if (ifavail) {
                        if (isNaN(data.contactNumber)) {
                            return res.send({ error: 'Y', msg: 'Contact Number Must be Digit', data: [] })
                        } else if (isNaN(data.pincode)) {
                            return res.send({ error: 'Y', msg: 'Pincode Not Valid', data: [] })
                        }
                        db.collection('user').update({ mobileNo: sess.mobileNo }, { $push: { address: address } }, (er, updated) => {
                            if (!er) {
                                return res.send({ error: 'N', msg: 'success', data: [] })
                            } else {
                                return res.send({ error: 'Y', msg: 'Something Going Wrong...2', data: [] })
                            }
                        })
                    } else {
                        return res.send({ error: 'Y', msg: 'user Not Found', data: [] })
                    }
                } else {
                    return res.send({ error: 'Y', msg: 'Something Going Wrong...1', data: [] })
                }
            })

        } else {
            return res.send({ error: 'Y', msg: 'Fillup All Detail', data: [] })
        }
    } else {
        return res.redirect('/')
    }
}

exports.updateAddress = (req, res) => {
    sess = req.session;
    if (typeof sess.mobileNo != 'undefined') {
        var data = req.body
        if (data.pid && sess.mobileNo && data.name && data.BuildingNameOrHouseNumber && data.area && data.contactNumber && data.pincode && data.state && data.city) {
            var address = {
                "address.$.mobileNo": sess.mobileNo,
                "address.$.name": data.name,
                "address.$.BuildingNameOrHouseNumber": data.BuildingNameOrHouseNumber,
                "address.$.area": data.area,
                "address.$.contactNumber": data.contactNumber,
                "address.$.pincode": data.pincode,
                "address.$.state": data.state,
                "address.$.city": data.city,
                "address.$.date": new Date()
            }
            console.log(sess.mobileNo, 'dssds')
            db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, ifavail) => {
                if (!e) {
                    if (ifavail) {
                        if (isNaN(data.contactNumber)) {
                            return res.send({ error: 'Y', msg: 'Contact Number Must be Digit', data: [] })
                        } else if (isNaN(data.pincode)) {
                            return res.send({ error: 'Y', msg: 'Pincode Not Valid', data: [] })
                        }
                        db.collection('user').updateOne({ mobileNo: sess.mobileNo, address: { $elemMatch: { id: objectId(data.pid) } } }, { $set: address }, (er, updated) => {
                            if (!er) {
                                return res.send({ error: 'N', msg: 'success', data: [] })
                            } else {
                                return res.send({ error: 'Y', msg: 'Something Going Wrong...2', data: [] })
                            }
                        })
                    } else {
                        return res.send({ error: 'Y', msg: 'user Not Found', data: [] })
                    }
                } else {
                    return res.send({ error: 'Y', msg: 'Something Going Wrong...1', data: [] })
                }
            })

        } else {
            return res.send({ error: 'Y', msg: 'Fillup All Detail', data: [] })
        }
    } else {
        return res.redirect('/')
    }
}

exports.getAddress = (req, res) => {
    sess = req.session
    if (typeof sess.mobileNo != 'undefined') {
        db.collection('user').findOne({ mobileNo: sess.mobileNo, address: { $elemMatch: { id: objectId(req.query.id) } } }, (e, myaddress) => {
            if (!e) {
                if (myaddress) {
                    var myaddressOne = []
                    for (var i = 0; i < myaddress.address.length; i++) {
                        if (req.query.id == myaddress.address[i].id.toString()) {
                            myaddressOne.push(myaddress.address[i])
                        }
                    }
                    res.send({ error: 'N', msg: '', data: myaddressOne[0] })
                } else {
                    res.send({ error: 'Y', msg: 'user not found' })
                }
            } else {
                res.send({ error: 'Y', msg: 'something wrong' })
            }
        })
    } else {
        return res.redirect('/')
    }
}

exports.deleteAddress = (req, res) => {
    sess = req.session
    if (typeof sess.mobileNo != 'undefined') {
        db.collection('user').findOne({ mobileNo: sess.mobileNo, address: { $elemMatch: { id: objectId(req.query.id) } } }, (e, myaddress) => {
            if (!e) {
                if (myaddress) {
                    db.collection('user').update({ mobileNo: sess.mobileNo }, { $pull: { address: { id: objectId(req.query.id) } } }, (er, updated) => {
                        if (!e) {
                            if (updated) {
                                res.send({ error: 'N', msg: '' })
                            } else {
                                res.send({ error: 'Y', msg: 'user not found' })
                            }
                        } else {
                            res.send({ error: 'Y', msg: 'something wrong' })
                        }
                    })
                } else {
                    res.send({ error: 'Y', msg: 'user not found' })
                }
            } else {
                res.send({ error: 'Y', msg: 'something wrong' })
            }
        })
    } else {
        return res.redirect('/')
    }
}

exports.paymentCheckout = (req, res) => {
    sess = req.session;
    if (typeof sess.mobileNo != 'undefined') {
        if (typeof sess.product != 'undefined') {
            if (objectId.isValid(sess.product)) {
                if (objectId.isValid(req.body.id)) {
                    db.collection('product').findOne({ _id: objectId(sess.product), pAprove: 1 }, (error, mypid) => {
                        if (!error) {
                            if (mypid) {
                                db.collection('petacate').findOne({ _id: objectId(mypid.petacate) }, (err, gstCharge) => {
                                    if (!err) {
                                        db.collection('user').findOne({ mobileNo: sess.mobileNo, address: { $elemMatch: { id: objectId(req.body.id) } } }, (e, alladdress) => {
                                            if (!e) {
                                                db.collection('deleverycharge').find().toArray((err1, mycharge) => {
                                                    if (!err1) {
                                                        if (alladdress) {
                                                            var cgst = mypid.price * gstCharge.cgst / 100;
                                                            var sgst = mypid.price * gstCharge.sgst / 100;
                                                            var igst = mypid.price * gstCharge.igst / 100;
                                                            mypid.price = parseInt(cgst + sgst + igst + mypid.price)
                                                            if (mypid.delivery != 0) {
                                                                var dynamicCharge = []
                                                                for (var i = 0; i < mycharge.length; i++) {
                                                                    if (mycharge[i].from < mypid.weight && mycharge[i].to > mypid.weight) {
                                                                        dynamicCharge.push(mycharge[i].rate)
                                                                    }
                                                                }
                                                                if (dynamicCharge[0] == undefined) {
                                                                    mypid.DeliveryRate = mycharge.sort((a, b) => b.rate - a.rate)[0].rate;
                                                                } else {
                                                                    mypid.DeliveryRate = dynamicCharge[0]
                                                                }
                                                            } else {
                                                                mypid.DeliveryRate = 0
                                                            }
                                                            mypid.withdelevery = mypid.DeliveryRate + mypid.price
                                                            sess.address = req.body.id
                                                            return webModel.responseData('web/paymentcheckout.html', {
                                                                data: 'dd',
                                                                product: mypid,
                                                                msg: '',
                                                                error: "N"
                                                            }, res, req)
                                                        } else {
                                                            return webModel.responseData('web/404.html', {
                                                                data: '',
                                                                msg: 'address not found',
                                                                error: "Y"
                                                            }, res, req)
                                                        }
                                                    } else {
                                                        return webModel.responseData('web/404.html', {
                                                            data: '',
                                                            msg: 'Something Going Wrong!!',
                                                            error: "Y"
                                                        }, res, req)
                                                    }
                                                })
                                            } else {
                                                return webModel.responseData('web/404.html', {
                                                    data: '',
                                                    msg: 'Something Going Wrong!!',
                                                    error: "Y"
                                                }, res, req)
                                            }
                                        })
                                    } else {
                                        return webModel.responseData('web/404.html', {
                                            data: '',
                                            msg: 'Something Going Wrong!!',
                                            error: "Y"
                                        }, res, req)
                                    }
                                })
                            } else {
                                return webModel.responseData('web/404.html', {
                                    data: '',
                                    msg: 'product not found!!',
                                    error: "Y"
                                }, res, req)
                            }
                        } else {
                            return webModel.responseData('web/404.html', {
                                data: '',
                                msg: 'Something Going Wrong!!',
                                error: "Y"
                            }, res, req)
                        }
                    })
                } else {
                    return webModel.responseData('web/404.html', {
                        data: '',
                        msg: 'address id not valid!!',
                        error: "Y"
                    }, res, req)
                }
            } else {
                return webModel.responseData('web/404.html', {
                    data: '',
                    msg: 'pid not valid!!',
                    error: "Y"
                }, res, req)
            }
        } else {
            return res.redirect('/')
        }
    } else {
        return res.redirect('/')
    }
}

exports.paymentCheckoutbycart = (req, res) => {
    sess = req.session;
    if (typeof sess.mobileNo != 'undefined') {
        db.collection('cart').findOne({ mobileNo: sess.mobileNo }, (er, mydata) => {
            if (!er) {
                if (mydata) {
                    var array = []
                    for (var i = 0; i < mydata.cart.length; i++) {
                        array.push(objectId(mydata.cart[i].pid))
                    }
                    db.collection('product').find({ _id: { $in: array } }).sort({ _id: 1 }).toArray((err, allcart) => {
                        if (!err) {
                            db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, alladdress) => {
                                if (!e) {
                                    db.collection('user').findOne({ mobileNo: sess.mobileNo, address: { $elemMatch: { id: objectId(req.body.id) } } }, (e, alladdress) => {
                                        if (!e) {
                                            db.collection('deleverycharge').find().toArray((err3, mycharge) => {
                                                if (!err3) {
                                                    db.collection('petacate').find().toArray((err2, gstCharge) => {
                                                        if (!err2) {
                                                            if (alladdress) {
                                                                sess.address = req.body.id

                                                                var bigCharge = [], diliveryCharge = [], dynamicCharge = [], cartData = []
                                                                bigCharge.push(mycharge.sort((a, b) => b.to - a.to)[0].to)
                                                                diliveryCharge.push(mycharge.sort((a, b) => b.rate - a.to)[0].rate)

                                                                for (var l = 0; l < allcart.length; l++) {
                                                                    if (allcart[l].delivery > 0) {
                                                                        if (bigCharge[0] < allcart[l].weight) {
                                                                            for (var j = 0; j < mydata.cart.length; j++) {
                                                                                if (allcart[l]._id.toString() == mydata.cart[j].pid.toString()) {
                                                                                    dynamicCharge.push(diliveryCharge[0] * mydata.cart[j].quantity);
                                                                                }
                                                                            }
                                                                        } else {
                                                                            for (var k = 0; k < mycharge.length; k++) {
                                                                                if (mycharge[k].from < allcart[l].weight && mycharge[k].to > allcart[l].weight) {
                                                                                    for (var j = 0; j < mydata.cart.length; j++) {
                                                                                        if (allcart[l]._id.toString() == mydata.cart[j].pid.toString()) {
                                                                                            dynamicCharge.push(mycharge[k].rate * mydata.cart[j].quantity);
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                for (var i = 0; i < allcart.length; i++) {
                                                                    for (var j = 0; j < mydata.cart.length; j++) {
                                                                        if (allcart[i]._id.toString() == mydata.cart[j].pid.toString()) {
                                                                            for (var k = 0; k < gstCharge.length; k++) {
                                                                                if (allcart[i].petacate.toString() == gstCharge[k]._id.toString()) {
                                                                                    cgst = allcart[i].price * gstCharge[k].cgst / 100;
                                                                                    sgst = allcart[i].price * gstCharge[k].sgst / 100;
                                                                                    igst = allcart[i].price * gstCharge[k].igst / 100;
                                                                                }
                                                                            }
                                                                            allcart[i].price = parseInt(cgst + sgst + igst + allcart[i].price)
                                                                            var price = allcart[i].price * mydata.cart[j].quantity;
                                                                            var mycart = {
                                                                                pid: allcart[i]._id,
                                                                                productName: allcart[i].productName,
                                                                                price: price,
                                                                                productImage: allcart[i].productImage[0],
                                                                                quantity: mydata.cart[j].quantity
                                                                            }
                                                                        }
                                                                    }
                                                                    cartData.push(mycart)
                                                                }

                                                                var total = 0;
                                                                for (var totaldeleverycharge in dynamicCharge) { total += dynamicCharge[totaldeleverycharge]; }

                                                                var totalAmount = []
                                                                for (var i = 0; i < cartData.length; i++) {
                                                                    totalAmount.push(cartData[i].price)
                                                                }
                                                                var Amountsum = totalAmount.reduce(function (a, b) {
                                                                    return a + b;
                                                                }, 0)

                                                                var totalAmount = []
                                                                for (var i = 0; i < cartData.length; i++) {
                                                                    totalAmount.push(cartData[i].price)
                                                                }

                                                                var sum = totalAmount.reduce(function (a, b) {
                                                                    return a + b;
                                                                }, 0);

                                                                var totalItem = []
                                                                for (var i = 0; i < mydata.cart.length; i++) {
                                                                    totalItem.push(mydata.cart[i].quantity)
                                                                }
                                                                var itemsum = totalItem.reduce(function (a, b) {
                                                                    return a + b;
                                                                }, 0)

                                                                var withDelivery = total + sum

                                                                var cartitem = {
                                                                    product: cartData,
                                                                    deleveryCharge: total,
                                                                    // totalAmount: Amountsum,
                                                                    withDelivery: withDelivery,
                                                                    totaitem: itemsum,
                                                                    totalAmount: sum
                                                                }

                                                                return webModel.responseData('web/paymentcheckoutbycart.html', {
                                                                    data: cartitem,
                                                                    msg: '',
                                                                    error: "N"
                                                                }, res, req)

                                                            } else {
                                                                return webModel.responseData('web/404.html', {
                                                                    data: '',
                                                                    msg: 'address not found',
                                                                    error: "Y"
                                                                }, res, req)
                                                            }
                                                        } else {
                                                            return webModel.responseData('web/404.html', {
                                                                data: '',
                                                                msg: 'Something Going Wrong!!',
                                                                error: "Y"
                                                            }, res, req)
                                                        }
                                                    })
                                                } else {
                                                    return webModel.responseData('web/404.html', {
                                                        data: '',
                                                        msg: 'Something Going Wrong!!',
                                                        error: "Y"
                                                    }, res, req)
                                                }
                                            })
                                        } else {
                                            return webModel.responseData('web/404.html', {
                                                data: '',
                                                msg: 'Something Going Wrong!!',
                                                error: "Y"
                                            }, res, req)
                                        }
                                    })
                                } else {
                                    return webModel.responseData('web/404.html', {
                                        data: '',
                                        msg: 'Something Going Wrong!!',
                                        error: "Y"
                                    }, res, req)
                                }
                            })
                        } else {
                            return webModel.responseData('web/404.html', {
                                data: '',
                                msg: 'Something Going Wrong!!',
                                error: "Y"
                            }, res, req)
                        }
                    })
                } else {
                    return webModel.responseData('web/404.html', {
                        data: 'cartitem',
                        msg: 'cart empty',
                        error: "Y"
                    }, res, req)
                }
            } else {
                return webModel.responseData('web/404.html', {
                    data: '',
                    msg: 'Something Going Wrong!!',
                    error: "Y"
                }, res, req)
            }
        })
    } else {
        return res.redirect('/')
    }
}

exports.order = (req, res) => {
    var data = req.body;
    sess = req.session
    if (typeof sess.mobileNo != 'undefined') {
        if (typeof sess.address != 'undefined') {
            if (data.type && data.paymentType) {
                db.collection('user').findOne({ mobileNo: sess.mobileNo }, (e, ifuserexist) => {
                    if (ifuserexist) {
                        db.collection('deleverycharge').find().toArray((err1, mycharge) => {
                            if (!err1) {
                                if (data.type == 'cart') {
                                    db.collection('cart').findOne({ mobileNo: sess.mobileNo }, (err2, mydata) => {
                                        var array = []
                                        for (var i = 0; i < mydata.cart.length; i++) {
                                            array.push(objectId(mydata.cart[i].pid))
                                        }
                                        db.collection('product').find({ _id: { $in: array } }).sort({ _id: 1 }).toArray((err, allcart) => {
                                            if (!err) {
                                                db.collection('petacate').find().toArray((err2, gstCharge) => {
                                                    if (!err2) {
                                                        var addressfirst = []
                                                        for (var i = 0; i < ifuserexist.address.length; i++) {
                                                            if (ifuserexist.address[i].id == sess.address) {
                                                                addressfirst.push(ifuserexist.address[i])
                                                            }
                                                        }
                                                        var bigCharge = [], diliveryCharge = [];
                                                        bigCharge.push(mycharge.sort((a, b) => b.to - a.to)[0].to)
                                                        diliveryCharge.push(mycharge.sort((a, b) => b.rate - a.to)[0].rate)
                                                        for (var i = 0; i < allcart.length; i++) {
                                                            for (var j = 0; j < mydata.cart.length; j++) {
                                                                if (allcart[i]._id.toString() == mydata.cart[j].pid.toString()) {
                                                                    for (var k = 0; k < gstCharge.length; k++) {
                                                                        if (allcart[i].petacate.toString() == gstCharge[k]._id.toString()) {
                                                                            cgst = allcart[i].price * gstCharge[k].cgst / 100;
                                                                            sgst = allcart[i].price * gstCharge[k].sgst / 100;
                                                                            igst = allcart[i].price * gstCharge[k].igst / 100;

                                                                            if (allcart[i].delivery > 0) {
                                                                                if (bigCharge[0] < allcart[i].weight) {
                                                                                    console.log()
                                                                                    allcart[i].deleveryCharge = diliveryCharge[0] * mydata.cart[j].quantity
                                                                                } else {
                                                                                    for (var a = 0; a < mycharge.length; a++) {
                                                                                        if (mycharge[a].from < allcart[i].weight && mycharge[a].to > allcart[i].weight) {
                                                                                            allcart[i].deleveryCharge = mycharge[a].rate * mydata.cart[j].quantity
                                                                                        }
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                allcart[i].deleveryCharge = 0;
                                                                            }

                                                                            allcart[i].totalPrice = parseInt(cgst + sgst + igst + allcart[i].price)
                                                                            allcart[i].gstAmount = parseInt(cgst + sgst + igst)
                                                                            allcart[i].withDelivery = parseInt(allcart[i].deleveryCharge + allcart[i].totalPrice)
                                                                            var orderDetail = {
                                                                                orderId: 'orderid-' + uniqid('Aa1', 10),
                                                                                products: {
                                                                                    pid: objectId(allcart[i]._id),
                                                                                    cate: objectId(allcart[i].cate),
                                                                                    subcate: objectId(allcart[i].subcate),
                                                                                    petacate: objectId(allcart[i].petacate),
                                                                                    productName: allcart[i].productName,
                                                                                    price: allcart[i].price,
                                                                                    productImage: allcart[i].productImage[0]
                                                                                },
                                                                                buyerName: ifuserexist.firstname + ' ' + ifuserexist.lastname,
                                                                                buyerNumber: ifuserexist.mobileNo,
                                                                                resellerId: objectId(allcart[i].resellerId),
                                                                                quantity: mydata.cart[j].quantity,
                                                                                cgst: gstCharge[k].cgst,
                                                                                sgst: gstCharge[k].sgst,
                                                                                igst: gstCharge[k].igst,
                                                                                address: addressfirst[0],
                                                                                deleveryCharge: allcart[i].deleveryCharge,
                                                                                gstAmount: allcart[i].gstAmount,
                                                                                totalPrice: parseInt(allcart[i].withDelivery * mydata.cart[j].quantity),
                                                                                orderStatusBySeller: 0,
                                                                                orderStatusByBuyer: 0,
                                                                                paymentType: data.paymentType,
                                                                                date: new Date()
                                                                            }
                                                                            var values = { $inc: { soldCount: mydata.cart[j].quantity } }
                                                                            console.log(orderDetail)
                                                                            var querys = { _id: objectId(allcart[i]._id) }
                                                                            db.collection('product').updateOne(querys, values, (errr) => {
                                                                                if (!errr) {
                                                                                    return
                                                                                } else {
                                                                                    return
                                                                                }
                                                                            })
                                                                            db.collection('order').insertOne(orderDetail, (error) => {
                                                                                if (!error) {
                                                                                    return
                                                                                } else {
                                                                                    return
                                                                                }
                                                                            })
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            if (i == allcart.length - 1) {
                                                                return res.redirect('/')
                                                                res.send({ error: 'N', msg: '', data: '' })
                                                            }
                                                        }
                                                    } else {
                                                        return res.send({ data: {}, msg: 'Something Going Wrong!!', error: "Y" })
                                                    }
                                                })
                                            } else {
                                                return res.send({ data: {}, msg: 'Something Going Wrong!!', error: "Y" })
                                            }
                                        })
                                    })

                                } else if (data.type == 'buynow') {
                                    if (sess.product && data.quantity) {
                                        db.collection('product').findOne({ _id: objectId(sess.product) }, (er, myorder) => {
                                            if (!er) {
                                                db.collection('petacate').findOne({ _id: objectId(myorder.petacate) }, (err, gstCharge) => {
                                                    if (!err) {
                                                        if (myorder.stock > myorder.soldCount) {
                                                            if (myorder) {
                                                                var addressfirst = []
                                                                for (var i = 0; i < ifuserexist.address.length; i++) {
                                                                    if (ifuserexist.address[i].id == sess.address) {
                                                                        addressfirst.push(ifuserexist.address[i])
                                                                    }
                                                                }

                                                                if (myorder.delivery != 0) {
                                                                    var dynamicCharge = []
                                                                    for (var i = 0; i < mycharge.length; i++) {
                                                                        if (mycharge[i].from < myorder.weight && mycharge[i].to > myorder.weight) {
                                                                            dynamicCharge.push(mycharge[i].rate)
                                                                        }
                                                                    }
                                                                    if (dynamicCharge[0] == undefined) {
                                                                        myorder.DeliveryRate = mycharge.sort((a, b) => b.rate - a.rate)[0].rate;
                                                                    } else {
                                                                        myorder.DeliveryRate = dynamicCharge[0]
                                                                    }
                                                                } else {
                                                                    myorder.DeliveryRate = 0
                                                                }

                                                                var cgst = myorder.price * gstCharge.cgst / 100;
                                                                var sgst = myorder.price * gstCharge.sgst / 100;
                                                                var igst = myorder.price * gstCharge.igst / 100;
                                                                gstAmount = parseInt(cgst + sgst + igst)
                                                                totalPrice = parseInt(cgst + sgst + igst + myorder.price + myorder.DeliveryRate)

                                                                var orderDetail = {
                                                                    orderId: 'orderid-' + uniqid('Aa1', 10),
                                                                    products: {
                                                                        pid: objectId(myorder._id),
                                                                        cate: objectId(myorder.cate),
                                                                        subcate: objectId(myorder.subcate),
                                                                        petacate: objectId(myorder.petacate),
                                                                        productName: myorder.productName,
                                                                        price: myorder.price,
                                                                        productImage: myorder.productImage[0]
                                                                    },
                                                                    buyerName: ifuserexist.firstname + ' ' + ifuserexist.lastname,
                                                                    buyerNumber: ifuserexist.mobileNo,
                                                                    resellerId: objectId(myorder.resellerId),
                                                                    quantity: parseInt(data.quantity),
                                                                    cgst: gstCharge.cgst,
                                                                    sgst: gstCharge.sgst,
                                                                    igst: gstCharge.igst,
                                                                    address: addressfirst[0],
                                                                    deleveryCharge: myorder.DeliveryRate,
                                                                    gstAmount: gstAmount,
                                                                    totalPrice: totalPrice,
                                                                    orderStatusBySeller: 0,
                                                                    orderStatusByBuyer: 0,
                                                                    paymentType: data.paymentType,
                                                                    date: new Date()
                                                                }
                                                                var values = { $inc: { soldCount: parseInt(data.quantity) } }
                                                                var querys = { _id: objectId(myorder._id) }
                                                                db.collection('product').updateOne(querys, values, (errr) => {
                                                                    if (!errr) {
                                                                        db.collection('order').insertOne(orderDetail, (error, ifsuccess) => {
                                                                            delete sess.product
                                                                            delete sess.address
                                                                            return res.send(orderDetail)
                                                                        })
                                                                    } else {
                                                                        return
                                                                    }
                                                                })
                                                            } else {
                                                                return res.send({ error: 'Y', msg: 'product not found', data: '' })
                                                            }
                                                        } else {
                                                            return res.send({ error: 'Y', msg: 'out of stock', data: '' })
                                                        }
                                                    } else {
                                                        return res.send({ error: 'Y', msg: 'something going wrong', data: '' })
                                                    }
                                                })
                                            } else {
                                                return res.send({ error: 'Y', msg: 'something going wrong', data: '' })
                                            }
                                        })
                                    } else {
                                        return res.send({ error: 'Y', msg: 'fill all detail', data: '' })
                                    }
                                } else {
                                    return res.send({ error: 'Y', msg: 'Invalid Type', data: '' })
                                }

                            } else {
                                return res.send({ error: 'Y', msg: 'something going wrong', data: '' })
                            }
                        })
                    } else {
                        return res.send({ error: 'Y', msg: 'User not found', data: '' })
                    }
                })
            } else {
                return res.send({ error: 'Y', msg: 'fillup all detail', data: '' })
            }
        } else {
            return res.redirect('/')
        }
    } else {
        return res.redirect('/')
    }
}

exports.fourzerofour = (req, res, next) => {
    return webModel.responseData('web/404.html', {
        data: '',
        msg: 'Something Going Wrong!!',
        error: "Y"
    }, res, req)
}

exports.logout = (req, res) => {
    req.session.destroy(function (err) {
        console.log(err);
        res.redirect('/');
    })
}