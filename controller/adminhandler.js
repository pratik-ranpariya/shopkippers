exports.loginpage = (req, res) => {
    sess = '';
    adminModel.responseData('adminPanel/index.html', {
        msg: '',
        error: 'N'
    }, res)
}

exports.get_register = (req, res) => {
    sess = '';
    adminModel.responseData('adminPanel/register.html', {
        msg: '',
        error: 'N'
    }, res)
}

exports.get_login = (req, res) => {
    sess = '';
    adminModel.responseData('adminPanel/index.html', {
        msg: '',
        error: 'N'
    }, res)
}

exports.post_login = (req, res) => {
    sess = req.session;
    var data = req.body;
    var Mobile_no = data.Mobile_no;
    var password = data.password;
    if (Mobile_no && password) {
        db.collection('adminlogin').findOne({ Mobile_no, password }, (err, result) => {
            if (err) {
                console.log(err);
            }
            if (result) {
                // bcrypt.compare(password, result.password, function (err, trueres) {
                    // if (trueres == true) {
                        if (result.block == 1) {
                            return adminModel.responseData('adminPanel/index.html', {
                                msg: 'User Is Blocked',
                                error: 'Y'
                            }, res)
                        } else {
                            sess.Mobile_no = req.body.Mobile_no;
                            return res.redirect('/dashboard');
                        }
                    // } else {
                    //     sess.Mobile_no = req.body.Mobile_no;
                    //     return adminModel.responseData('adminPanel/index.html', {
                    //         msg: 'Mobile Number and password not metch',
                    //         error: 'Y'
                    //     }, res)
                    // }
                // })
            } else {
                return adminModel.responseData('adminPanel/index.html', {
                    msg: 'Mobile Number and password not metch',
                    error: 'Y'
                }, res)
            }
        })
    } else {
        return adminModel.responseData('adminPanel/index.html', {
            msg: 'Fillup All Detail',
            error: 'Y'
        }, res)
    }
}

exports.dashboard = (req, res) => {
    sess = req.session;
    sess.active = 'dashboard';
    if (typeof sess.Mobile_no != 'undefined') {
        db.collection('reseller').countDocuments({}, (e, totalreseller) => {
            db.collection('product').countDocuments({ pAprove: 0 }, (e, approvePending) => {
                db.collection('product').countDocuments({}, (e, allProduct) => {
                    if (!e) {
                        data = {
                            totalreseller: totalreseller,
                            totalProduct: allProduct,
                            approvePending: approvePending
                        }
                        adminModel.responseData('adminPanel/dashboard.html', {
                            data: data,
                            msg: '',
                            error: 'N'
                        }, res)
                    } else {
                        return res.send({ error: 'Y', msg: 'something going worng' })
                    }
                })
            })
        })
    } else {
        return res.redirect('/')
    }
}

exports.get_productList = (req, res) => {
    sess = req.session;
    sess.active = 'productlist'
    if (typeof sess.Mobile_no != 'undefined') {
        // db.collection('reseller').findOne({ Mobile_no: sess.Mobile_no }, (e, results) => {
            var perPage = 20;
            var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
            var skip = (perPage * page) - perPage;
            var aggrigate = [{
                $lookup:
                {
                    from: "cate",
                    localField: "cate",
                    foreignField: "_id",
                    as: "mycatename"
                }
            }, {
                $lookup:
                {
                    from: "subcate",
                    localField: "subcate",
                    foreignField: "_id",
                    as: "mysubcatename"
                }
            }, {
                $lookup:
                {
                    from: "petacate",
                    localField: "petacate",
                    foreignField: "_id",
                    as: "mypetacatename"
                }
            },
            { $unwind: "$mycatename" },
            { $unwind: "$mysubcatename" },
            { $unwind: "$mypetacatename" },
            {
                $project: {
                    _id: 1,
                    cate: 1,
                    subcate: 1,
                    petacate: 1,
                    cateName: "$mycatename.name",
                    subcateName: "$mysubcatename.name",
                    petacateName: "$mypetacatename.name",
                    resellerId: 1,
                    productName: 1,
                    price: 1,
                    stock: 1,
                    rating: 1,
                    description: 1,
                    productImage: 1,
                    productVideo: 1,
                    pAprove: 1,
                    soldCount: 1,
                    date: 1
                }
            },
            // { $match: { resellerId: objectId(results._id) } },
            { $match: { pAprove: 0 } },
            { $sort: { _id: -1 } },
            { $skip: skip },
            { $limit: perPage }]
            db.collection('product').aggregate(aggrigate).toArray((e, myalldata) => {
                db.collection('product').countDocuments({ pAprove: 0 }, (er, userCount) => {
                    db.collection('cate').find({}).toArray((err, myallcate) => {
                        db.collection('subcate').find({}).toArray((err1, myallsubcate) => {
                            db.collection('petacate').find({}).toArray((err2, myallpetacate) => {
                                for (var i = 0; i < myalldata.length; i++) {
                                    myalldata[i].date = _date(myalldata[i].date).format('DD/MM/YYYY h:mm:ss a')
                                    myalldata[i].productImage = myalldata[i].productImage[0]
                                }
                                var data = {
                                    data: myalldata,
                                    catedata: myallcate,
                                    subcatedata: myallsubcate,
                                    petacatedata: myallpetacate
                                }
                                data['totaluser'] = userCount
                                data['search'] = {}
                                data['current'] = page
                                data['pages'] = Math.ceil(userCount / perPage)
                                return adminModel.responseData('adminPanel/productlist.html', data, res)
                            })
                        })
                    })
                })
            })
        // })
    } else {
        res.redirect('/login')
    }
}

exports.post_productList = (req, res) => {
    sess = req.session
    sess.active = 'productlist'
    if (typeof sess.Mobile_no != 'undefined') {
        // db.collection('reseller').findOne({ Mobile_no: sess.Mobile_no }, (e, myseller) => {
            if (!e) {
                if (myseller) {
                    console.log(req.body)
                    var perPage = 20;
                    var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
                    var skip = (perPage * page) - perPage;

                    var wh = {};
                    if (req.body.by == 'pid') {
                        wh['_id'] = objectId(req.body.search)
                    }
                    if (req.body.todate != '' && req.body.fromdate != '') {
                        wh['$and'] = [{
                            date: {
                                $gte: new Date(req.body.todate + ' 00:00:00')
                            }
                        }, {
                            date: {
                                $lte: new Date(req.body.fromdate + ' 23:59:59')
                            }
                        }]
                    }

                    wh['pAprove'] = 0
                    // if (myseller._id) {
                    //     wh['resellerId'] = objectId(myseller._id)
                    // }

                    var aggregate = [{
                        $lookup:
                        {
                            from: "cate",
                            localField: "cate",
                            foreignField: "_id",
                            as: "mycatename"
                        }
                    }, {
                        $lookup:
                        {
                            from: "subcate",
                            localField: "subcate",
                            foreignField: "_id",
                            as: "mysubcatename"
                        }
                    }, {
                        $lookup:
                        {
                            from: "petacate",
                            localField: "petacate",
                            foreignField: "_id",
                            as: "mypetacatename"
                        }
                    },
                    { $unwind: "$mycatename" },
                    { $unwind: "$mysubcatename" },
                    { $unwind: "$mypetacatename" },
                    {
                        $project: {
                            _id: 1,
                            cate: 1,
                            subcate: 1,
                            petacate: 1,
                            cateName: "$mycatename.name",
                            subcateName: "$mysubcatename.name",
                            petacateName: "$mypetacatename.name",
                            resellerId: 1,
                            productName: 1,
                            price: 1,
                            stock: 1,
                            rating: 1,
                            description: 1,
                            productImage: 1,
                            productVideo: 1,
                            pAprove: 1,
                            soldCount: 1,
                            date: 1
                        }
                    },
                    { $match: wh },
                    { $sort: { _id: -1 } },
                    { $skip: skip },
                    { $limit: perPage }
                    ]
                    db.collection('product').aggregate(aggregate).toArray((e, myalldata) => {
                        db.collection('product').countDocuments(wh, (er, userCount) => {
                            db.collection('cate').find({}).toArray((err, myallcate) => {
                                db.collection('subcate').find({}).toArray((err1, myallsubcate) => {
                                    db.collection('petacate').find({}).toArray((err2, myallpetacate) => {
                                        for (var i = 0; i < myalldata.length; i++) {
                                            myalldata[i].date = _date(myalldata[i].date).format('DD/MM/YYYY h:mm:ss a')
                                            myalldata[i].productImage = myalldata[i].productImage[0]
                                        }
                                        var data = {
                                            data: myalldata,
                                            catedata: myallcate,
                                            subcatedata: myallsubcate,
                                            petacatedata: myallpetacate
                                        }
                                        data['totaluser'] = userCount
                                        data['search'] = {}
                                        data['current'] = page
                                        data['pages'] = Math.ceil(userCount / perPage)
                                        console.log(data)
                                        return adminModel.responseData('adminPanel/productlist.html', data, res)
                                    })
                                })
                            })
                        })
                    })
                } else {
                    return res.send({ error: 'Y', msg: 'reseller not found', data: '' })
                }
            } else {
                return res.send({ error: 'Y', msg: 'Something Going Wroing......', data: '' })
            }
        // })
    } else {
        return res.redirect('/login')
    }
}

exports.ApporveProduct = (req, res) => {
    db.collection('product').findOne({ _id: objectId(req.params._id) }, (err, myproduct) => {
        if (myproduct) {
            db.collection('product').updateOne({ _id: objectId(req.params._id) }, { $set: { pAprove: 1 } }, (e, mydata) => {
                if (!e) {
                    return res.send({ error: 'N', msg: 'success' })
                } else {
                    return res.send({ error: 'Y', msg: 'success' })
                }
            })
        }
    })
}

exports.RejectProduct = (req, res) => {
    db.collection('product').findOne({ _id: objectId(req.params._id) }, (err, myproduct) => {
        if (myproduct) {
            db.collection('product').updateOne({ _id: objectId(req.params._id) }, { $set: { pAprove: 2 } }, (e, mydata) => {
                if (!e) {
                    return res.send({ error: 'N', msg: 'success' })
                } else {
                    return res.send({ error: 'Y', msg: 'success' })
                }
            })
        }
    })
}

exports.bankdetailverify_list = (req, res) => {
    sess = req.session;
    sess.active = 'bankdetailverify'
    if (typeof sess.Mobile_no != 'undefined') {
        var perPage = 20;
        var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
        var skip = (perPage * page) - perPage;

        db.collection('resellerimps')
            .find()
            .project({
                resellerid: 1,
                accountno: 1,
                accountholdername: 1,
                bankname: 1,
                ifsc: 1,
                bankStatus: 1
            })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(perPage)
            .toArray((e, mydetail) => {

                db.collection('resellerimps')
                    .find()
                    .toArray((er, userCount) => {

                        if (!e) {
                            var myapi = []
                            for (var i = 0; i < mydetail.length; i++) {
                                if (typeof mydetail[i].bankStatus != 'undefined') {
                                    if (mydetail[i].bankStatus == 0 || mydetail[i].bankStatus == 1 || mydetail[i].bankStatus == 2) {
                                        myapi.push(mydetail[i])
                                    }
                                }
                            }
                            var totalCount = []
                            for (var i = 0; i < userCount.length; i++) {
                                if (typeof userCount[i].bankStatus != 'undefined') {
                                    if (userCount[i].bankStatus == 0 || userCount[i].bankStatus == 1 || userCount[i].bankStatus == 2) {
                                        totalCount.push(userCount[i])
                                    }
                                }
                            }
                            var data = {
                                data: myapi
                            }
                            data['search'] = {}
                            data['current'] = page
                            data['pages'] = Math.ceil(totalCount.length / perPage)
                            data['dImgUrl'] = dImgUrl
                            console.log(data)
                            return adminModel.responseData('adminPanel/bankdetailverification.html', data, res)
                        } else {
                            return res.redirect('/login')
                        }
                    })
            })
    } else {
        return res.redirect('/login')
    }
}

exports.ApporveBankDetail = (req, res) => {
    db.collection('resellerimps').findOne({ _id: objectId(req.params._id) }, (err, myproof) => {
        if (myproof) {
            db.collection('resellerimps').updateOne({ _id: objectId(req.params._id) }, { $set: { bankStatus: 1 } }, (e, mydata) => {
                if (!e) {
                    return res.send({ error: 'N', msg: 'success' })
                } else {
                    return res.send({ error: 'Y', msg: 'database error' })
                }
            })
        } else {
            return res.send({ error: 'Y', msg: 'success' })
        }
    })
}

exports.RejectBankDetail = (req, res) => {
    db.collection('resellerimps').findOne({ _id: objectId(req.params._id) }, (err, myproof) => {
        if (myproof) {
            db.collection('resellerimps').updateOne({ _id: objectId(req.params._id) }, { $set: { bankStatus: 2 } }, (e, mydata) => {
                if (!e) {
                    return res.send({ error: 'N', msg: 'success' })
                } else {
                    return res.send({ error: 'Y', msg: 'database error' })
                }
            })
        } else {
            return res.send({ error: 'Y', msg: 'success' })
        }
    })
}

exports.businessdetailverify_list = (req, res) => {
    sess = req.session;
    sess.active = 'businessdetailverify'
    if (typeof sess.Mobile_no != 'undefined') {
        var perPage = 20;
        var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
        var skip = (perPage * page) - perPage;

        db.collection('resellerimps')
            .find()
            .project({
                resellerid: 1,
                businessStatus: 1,
                businesstype: 1,
                gstnumber: 1,
                registerbusinessaddress: 1
            })
            .sort({_id: -1})
            .skip(skip)
            .limit(perPage)
            .toArray((e, mydetail) => {

                db.collection('resellerimps')
                    .find()
                    .toArray((er, userCount) => {
                        if (!e) {
                            var myapi = []
                            for (var i = 0; i < mydetail.length; i++) {
                                if (typeof mydetail[i].businessStatus != 'undefined') {
                                    if (mydetail[i].businessStatus == 0 || mydetail[i].businessStatus == 1 || mydetail[i].businessStatus == 2) {
                                        myapi.push(mydetail[i])
                                    }
                                }
                            }
                            var totalCount = []
                            for (var i = 0; i < userCount.length; i++) {
                                if (typeof userCount[i].businessStatus != 'undefined') {
                                    if (userCount[i].businessStatus == 0 || userCount[i].businessStatus == 1 || userCount[i].businessStatus == 2) {
                                        totalCount.push(userCount[i])
                                    }
                                }
                            }
                            var data = {
                                data: myapi
                            }
                            data['search'] = {}
                            data['current'] = page
                            data['pages'] = Math.ceil(userCount.length / perPage)
                            return adminModel.responseData('adminPanel/businessdetailverification.html', data, res)
                        } else {
                            return res.redirect('/login')
                        }
                    })
            })
    } else {
        return res.redirect('/login')
    }
}

exports.ApporveBusinessDetail = (req, res) => {
    db.collection('resellerimps').findOne({ _id: objectId(req.params._id) }, (err, myproof) => {
        if (myproof) {
            db.collection('resellerimps').updateOne({ _id: objectId(req.params._id) }, { $set: { businessStatus: 1 } }, (e, mydata) => {
                if (!e) {
                    return res.send({ error: 'N', msg: 'success' })
                } else {
                    return res.send({ error: 'Y', msg: 'database error' })
                }
            })
        } else {
            return res.send({ error: 'Y', msg: 'success' })
        }
    })
}

exports.RejectBusinessDetail = (req, res) => {
    db.collection('resellerimps').findOne({ _id: objectId(req.params._id) }, (err, myproof) => {
        if (myproof) {
            db.collection('resellerimps').updateOne({ _id: objectId(req.params._id) }, { $set: { businessStatus: 2 } }, (e, mydata) => {
                if (!e) {
                    return res.send({ error: 'N', msg: 'success' })
                } else {
                    return res.send({ error: 'Y', msg: 'database error' })
                }
            })
        } else {
            return res.send({ error: 'Y', msg: 'success' })
        }
    })
}

exports.DocumentImage_list = (req, res) => {
    sess = req.session;
    sess.active = 'documentimage'
    if (typeof sess.Mobile_no != 'undefined') {
        var perPage = 10;
        var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
        var skip = (perPage * page) - perPage;

        db.collection('resellerimps')
            .find()
            .project({
                resellerid: 1,
                adharcard: 1,
                checkbook: 1,
                gstcertificate: 1,
                pancard: 1,
                passbook: 1,
                resellerimage: 1,
                signature: 1,
                DocumentStatus:1
            })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(perPage)
            .toArray((e, mydetail) => {

                db.collection('resellerimps')
                    .find()
                    .toArray((er, userCount) => {
                        if (!e) {
                            var myapi = []
                            for (var i = 0; i < mydetail.length; i++) {
                                if (typeof mydetail[i].DocumentStatus != 'undefined') {
                                    if (mydetail[i].DocumentStatus == 0 || mydetail[i].DocumentStatus == 1 || mydetail[i].DocumentStatus == 2) {
                                        myapi.push(mydetail[i])
                                    }
                                }
                            }
                            var totalCount = []
                            for (var i = 0; i < userCount.length; i++) {
                                if (typeof userCount[i].DocumentStatus != 'undefined') {
                                    if (userCount[i].DocumentStatus == 0 || userCount[i].DocumentStatus == 1 || userCount[i].DocumentStatus == 2) {
                                        totalCount.push(userCount[i])
                                    }
                                }
                            }
                            var data = {
                                data: myapi
                            }
                            data['search'] = {}
                            data['current'] = page
                            data['pages'] = Math.ceil(totalCount.length / perPage)
                            return adminModel.responseData('adminPanel/documentimage.html', data, res)
                        } else {
                            return res.redirect('/login')
                        }
                    })
            })
    } else {
        return res.redirect('/login')
    }
}

exports.ApporveDocumentImage = (req, res) => {
    db.collection('resellerimps').findOne({ _id: objectId(req.params._id) }, (err, myproof) => {
        if (myproof) {
            db.collection('resellerimps').updateOne({ _id: objectId(req.params._id) }, { $set: { DocumentStatus: 1 } }, (e, mydata) => {
                if (!e) {
                    return res.send({ error: 'N', msg: 'success' })
                } else {
                    return res.send({ error: 'Y', msg: 'database error' })
                }
            })
        } else {
            return res.send({ error: 'Y', msg: 'success' })
        }
    })
}

exports.RejectDocumentImage = (req, res) => {
    db.collection('resellerimps').findOne({ _id: objectId(req.params._id) }, (err, myproof) => {
        if (myproof) {
            db.collection('resellerimps').updateOne({ _id: objectId(req.params._id) }, { $set: { DocumentStatus: 2 } }, (e, mydata) => {
                if (!e) {
                    return res.send({ error: 'N', msg: 'success' })
                } else {
                    return res.send({ error: 'Y', msg: 'database error' })
                }
            })
        } else {
            return res.send({ error: 'Y', msg: 'success' })
        }
    })
}

exports.bannerAndDelevery = (req, res) => {
    sess = req.session;
    sess.active = 'banner'
    if (typeof sess.Mobile_no != 'undefined') {
        db.collection('banner').find().toArray((e, mybanner) => {
            if (!e) {
                db.collection('deleverycharge').find().toArray((err, allcharges) => {
                    if (!err) {
                        for (var i = 0; i < mybanner.length; i++) {
                            mybanner[i].date = _date(mybanner[i].date).format('DD/MM/YYYY h:mm:ss a')
                        }
                        for (var i = 0; i < allcharges.length; i++) {
                            allcharges[i].date = _date(allcharges[i].date).format('DD/MM/YYYY h:mm:ss a')
                        }
                        adminModel.responseData('adminPanel/bannerAndDelevery.html', {
                            data: mybanner,
                            data1: allcharges,
                            msg: '',
                            error: 'N'
                        }, res)
                    } else {
                        return res.redirect('/')
                    }
                })
            } else {
                return res.redirect('/')
            }
        })
    } else {
        return res.redirect('/')
    }
}

exports.uploadBanner = (req, res) => {
    sess = req.session;
    sess.active = 'banner'
    if (typeof sess.Mobile_no != 'undefined') {
        if (req.files.banner) {
            var file = req.files.banner;
            var myBanner = Date.now() + '_' + file.name;
            if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/PNG" || file.mimetype == "image/webp") {
                file.mv('views/adminPanel/img/banner/' + myBanner)
                // wh['banner'] = myBanner
                db.collection('banner').insertOne({banner: myBanner, date: new Date()}, (e, mydata) => {
                    if(!e){
                        return res.redirect('/bannerAndDelevery')
                    } else {
                        return res.send({error: 'Y', msg: 'something going wrong', data: ''})
                    }
                })
            } else {
                return sellerModel.responseData('adminPanel/banner.html', {
                    msg: 'Banner Allowed Only jpeg/png/JPG/PNG/webp image type',
                    data: idavailable,
                    error: "Y"
                }, res)
            }
        }
    } else {
        return res.redirect('/')
    }
}

exports.deleteBanner = (req, res) => {
    sess = req.session;
    sess.active = 'banner'
    if (typeof sess.Mobile_no != 'undefined') {
        if (objectId.isValid(req.query.id)) {
            db.collection('banner').deleteOne({_id: objectId(req.query.id)}, (e, ifsucess) => {
                if(!e){
                    return res.send({error: 'N', msg: 'sucess', data: 'banner image deleted succesfully'})
                } else {
                    return res.send({error: 'Y', msg: 'something going wrong!!', data: ''})
                }
            })
        } else{
            return res.send({error: 'Y', msg: 'id not valid', data: ''})
        }
    } else {
        return res.redirect('/')
    }
}

exports.buyerList_get = (req, res) => {
    sess = req.session;
    sess.active = 'buyerlist'
    if (typeof sess.Mobile_no != 'undefined') {
        var perPage = 20;
        var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
        var skip = (perPage * page) - perPage;

        db.collection('user')
            .find({})
            .sort({ _id: -1 })
            .skip(skip)
            .limit(perPage)
            .project({ firstname: 1, lastname: 1, mobileNo: 1, block: 1, date: 1 })
            .toArray((e, alluser) => {

                db.collection('user').countDocuments((err, userCount) => {

                    for (var i = 0; i < alluser.length; i++) {
                        alluser[i].date = _date(alluser[i].date).format('DD/MM/YYYY h:mm:ss a')
                    }

                    var data = {
                        data: alluser
                    }
                    data['totaluser'] = userCount
                    data['search'] = {}
                    data['current'] = page
                    data['pages'] = Math.ceil(userCount / perPage)
                    return adminModel.responseData('adminPanel/userlist.html', data, res)
                })
            })
    } else {
        return res.redirect('/')
    }
}

exports.buyerList_post = (req, res) => {
    sess = req.session;
    sess.active = 'buyerlist'
    if (typeof sess.Mobile_no != 'undefined') {
        var perPage = 20;
        var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
        var skip = (perPage * page) - perPage;

        var wh = {};
        if (req.body.by == '_id') {
            if(objectId.isValid(req.body.search)){
                wh['_id'] = objectId(req.body.search)
            } else {
                wh['_id'] = ''
            }
        }
        if (req.body.by == 'name') {
            wh['firstname'] = { $regex: req.body.search, $options: "i" }
        }
        if (req.body.by == 'mobile') {
            wh['mobileNo'] = req.body.search
        }
        if (req.body.by == 'email') {
            wh['email'] = req.body.search
        }
        if (req.body.todate != '' && req.body.fromdate != '') {
            wh['$and'] = [{
                date: {
                    $gte: new Date(req.body.todate + ' 00:00:00')
                }
            }, {
                date: {
                    $lte: new Date(req.body.fromdate + ' 23:59:59')
                }
            }]
        }

        db.collection('user')
            .find(wh)
            .sort({ _id: -1 })
            .skip(skip)
            .limit(perPage)
            .project({ firstname: 1, lastname: 1, mobileNo: 1, block: 1, date: 1 })
            .toArray((e, alluser) => {

                db.collection('user').countDocuments((err, userCount) => {

                    for (var i = 0; i < alluser.length; i++) {
                        alluser[i].date = _date(alluser[i].date).format('DD/MM/YYYY h:mm:ss a')
                    }

                    var data = {
                        data: alluser
                    }
                    data['totaluser'] = userCount
                    data['search'] = req.body
                    data['current'] = page
                    data['pages'] = Math.ceil(userCount / perPage)
                    return adminModel.responseData('adminPanel/userlist.html', data, res)
                })
            })
    } else {
        return res.redirect('/')
    }
}

exports.resellerList_get = (req, res) => {
    sess = req.session;
    sess.active = 'resellerlist'
    if (typeof sess.Mobile_no != 'undefined') {
        var perPage = 20;
        var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
        var skip = (perPage * page) - perPage;

        db.collection('reseller')
            .find({})
            .sort({ _id: -1 })
            .skip(skip)
            .limit(perPage)
            .toArray((e, alluser) => {

                db.collection('reseller').countDocuments((err, userCount) => {

                    for (var i = 0; i < alluser.length; i++) {
                        alluser[i].date = _date(alluser[i].date).format('DD/MM/YYYY h:mm:ss a')
                    }

                    var data = {
                        data: alluser
                    }
                    data['totaluser'] = userCount
                    data['search'] = {}
                    data['current'] = page
                    data['pages'] = Math.ceil(userCount / perPage)
                    return adminModel.responseData('adminPanel/resellerlist.html', data, res)
                })
            })
    } else {
        return res.redirect('/')
    }
}

exports.resellerList_post = (req, res) => {
    sess = req.session;
    sess.active = 'buyerlist'
    if (typeof sess.Mobile_no != 'undefined') {
        var perPage = 20;
        var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
        var skip = (perPage * page) - perPage;

        var wh = {};
        if (req.body.by == '_id') {
            if(objectId.isValid(req.body.search)){
                wh['_id'] = objectId(req.body.search)
            } else {
                wh['_id'] = ''
            }
        }
        if (req.body.by == 'name') {
            wh['sellerName'] = { $regex: req.body.search, $options: "i" }
        }
        if (req.body.by == 'mobile') {
            wh['Mobile_no'] = req.body.search
        }
        if (req.body.by == 'email') {
            wh['email'] = req.body.search
        }
        if (req.body.todate != '' && req.body.fromdate != '') {
            wh['$and'] = [{
                date: {
                    $gte: new Date(req.body.todate + ' 00:00:00')
                }
            }, {
                date: {
                    $lte: new Date(req.body.fromdate + ' 23:59:59')
                }
            }]
        }

        db.collection('user')
            .find(wh)
            .sort({ _id: -1 })
            .skip(skip)
            .limit(perPage)
            .project({ firstname: 1, lastname: 1, mobileNo: 1, block: 1, date: 1 })
            .toArray((e, alluser) => {

                db.collection('user').countDocuments((err, userCount) => {

                    for (var i = 0; i < alluser.length; i++) {
                        alluser[i].date = _date(alluser[i].date).format('DD/MM/YYYY h:mm:ss a')
                    }

                    var data = {
                        data: alluser
                    }
                    data['totaluser'] = userCount
                    data['search'] = req.body
                    data['current'] = page
                    data['pages'] = Math.ceil(userCount / perPage)
                    return adminModel.responseData('adminPanel/userlist.html', data, res)
                })
            })
    } else {
        return res.redirect('/')
    }
}

exports.insertDeleveryCharges = (req, res) => {
    sess = req.session;
    sess.active = 'buyerlist'
    if (typeof sess.Mobile_no != 'undefined') {
        var data = req.body
        if (data.from && data.to && data.rate) {
            // db.collection('deleverycharge').find().toArray((e, mydata) => {
                var mycoll = {
                    from: parseFloat(data.from),
                    to: parseFloat(data.to),
                    rate: parseFloat(data.rate),
                    date: new Date()
                }
                db.collection('deleverycharge').insertOne(mycoll, (e, sucessss) => {
                if (!e) {
                    return res.redirect('/bannerAndDelevery')
                } else {
                    return res.send({ error: 'Y', msg: 'something going wrong' })
                }
            })
        } else {
            return res.send({ error: 'Y', msg: 'fillup all detail' })
        }
    } else {
        return res.redirect('/')
    }
}

exports.deleteDelevery = (req, res) => {
    sess = req.session;
    sess.active = 'banner'
    if (typeof sess.Mobile_no != 'undefined') {
        if (objectId.isValid(req.query.id)) {
            db.collection('deleverycharge').deleteOne({_id: objectId(req.query.id)}, (e, ifsucess) => {
                if(!e){
                    return res.send({error: 'N', msg: 'sucess', data: 'Delevery Charge deleted succesfully'})
                } else {
                    return res.send({error: 'Y', msg: 'something going wrong!!', data: ''})
                }
            })
        } else{
            return res.send({error: 'Y', msg: 'id not valid', data: ''})
        }
        
    } else {
        return res.redirect('/')
    }
}

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/');
    })
}

exports.category = (req, res) => {
    sess = req.session
    sess.active = 'category';
    if (typeof sess.Mobile_no != 'undefined') {
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
        db.collection('cate').aggregate(aggregate).sort({ _id: 1 }).toArray((err, category) => {
            db.collection('cate').find({}).toArray((err, mydata) => {
                console.log(category)
                return adminModel.responseData('adminPanel/category.html', {
                    data: mydata,
                    data1: category,
                    msg: '',
                    error: 'N'
                }, res)
            })
        })
    } else {
        return res.redirect('/')
    }
}

exports.addcategory = (req, res) => {
    console.log(req.files)
    var file1 = req.files.photo
    var categoryimage = Date.now() + '_' + file1.name;
    if (file1.mimetype == "image/jpeg" || file1.mimetype == "image/png" || file1.mimetype == "image/jpg" || file1.mimetype == "image/PNG") {
        file1.mv('views/adminPanel/img/category/' + categoryimage, (err1) => {
            if (err1)
                return res.status(500).send({ error: 'Y', msg: `poster image can't uploaded` });
            var mydata = {
                name: req.body.name,
                image: categoryimage
            }
            db.collection('cate').insertOne(mydata, (err, data) => {
                try {
                    if (err) throw err;
                    return res.redirect('/category')
                } catch (error) {
                    return res.send({ error: 'Y', msg: 'something Wrong' })
                }
            })
        })
    } else {
        return res.send({ error: 'Y', msg: 'invalid image type' }) 
    }
}

exports.addsubcategory = (req, res) => {
    if (!objectId.isValid(req.body.category)) {
        return res.send({ error: 'Y', msg: 'category Id not Valid' });
    }
    if (typeof req.body.name != 'undefined') {
        var file1 = req.files.photo
        var categoryimage = Date.now() + '_' + file1.name;
        if (file1.mimetype == "image/jpeg" || file1.mimetype == "image/png" || file1.mimetype == "image/jpg" || file1.mimetype == "image/PNG") {
            file1.mv('views/adminPanel/img/category/' + categoryimage, (err1) => {
                if (err1)
                    return res.status(500).send({ error: true, msg: `poster image can't uploaded` });
                var mydata = {
                    cate: objectId(req.body.category),
                    name: req.body.name,
                    image: categoryimage
                }
                db.collection('subcate').insertOne(mydata, (err, sucess) => {
                    try {
                        if (err) throw err;
                        return res.redirect('/category')
                    } catch (error) {
                        return res.send({ error: 'Y', msg: 'something Wrong' })
                    }
                })
            })
        } else {
            return res.send({ error: 'Y', msg: 'invalid image type' }) 
        }
    } else {
        return res.send({ error: 'Y', msg: 'Fillup All detail' })
    }
}

exports.addpetacategory = (req, res) => {
    console.log(req.body)
    if (!objectId.isValid(req.body.category)) {
        return res.send({ error: 'Y', msg: 'category Id not Valid' });
    }
    if (!objectId.isValid(req.body.subcategory.split('/////')[0])) {
        return res.send({ error: 'Y', msg: 'subcategory Id not Valid' });
    }
    if (typeof req.body.name != 'undefined') {
        var file1 = req.files.photo
        var categoryimage = Date.now() + '_' + file1.name;
        if (file1.mimetype == "image/jpeg" || file1.mimetype == "image/png" || file1.mimetype == "image/jpg" || file1.mimetype == "image/PNG") {
            file1.mv('views/adminPanel/img/category/' + categoryimage, (err1) => {
                if (err1)
                    return res.status(500).send({ error: true, msg: `poster image can't uploaded` });
                var mydata = {
                    cate: objectId(req.body.category),
                    subcate: objectId(req.body.subcategory.split('/////')[0]),
                    name: req.body.name,
                    cgst: parseFloat(req.body.cgst),
                    igst: parseFloat(req.body.igst),
                    sgst: parseFloat(req.body.sgst),
                    image: categoryimage
                }
                db.collection('petacate').insertOne(mydata, (err, sucess) => {
                    try {
                        if (err) throw err;
                        return res.redirect('/category')
                    } catch (error) {
                        return res.send({ error: 'Y', msg: 'something Wrong' })
                    }
                })
            })
        } else {
            return res.send({ error: 'Y', msg: 'invalid image' })
        }
    } else {
        return res.send({ error: 'Y', msg: 'Fillup All detail' })
    }
}

exports.getsubcategory = (req, res) => {
    if (!objectId.isValid(req.params._id)) {
        return res.send({ error: true, data: [] });
    }
    db.collection('subcate').find({ cate: objectId(req.params._id) }).toArray((err, sucess) => {
        return res.send({ error: false, data: sucess })
    })
}

exports.getpetacategory = (req, res) => {
    if (!objectId.isValid(req.params._id)) {
        return res.send({ error: true, data: [] });
    }

    if (!objectId.isValid(req.params.cate)) {
        return res.send({ error: true, data: [] });
    }
    db.collection('petacate').find({ subcate: objectId(req.params._id), cate: objectId(req.params.cate) }).toArray((err, sucess) => {
        return res.send({ error: false, data: sucess })
    })
}
