exports.login = (req, res) => {

    var data = req.body;
    var mobileNo = data.mobileNo;
    var password = data.password;

    if (mobileNo && password) {

        db.collection('user').findOne({ mobileNo: mobileNo }, (err, result) => {
            if (err) {
                console.log(err);
            }
            if (result) {
                bcrypt.compare(password, result.password, function (err, trueres) {
                    if (trueres == true) {
                        var datas = {
                            userId: result._id,
                            name: result.name,
                            mobileNo: result.mobileNo,
                            email: result.email,
                        }
                        if (result.block == 1) {
                            return res.send({ error: 'Y', msg: 'Your Account Is Blocked Due To illegal Activity', data: {} })
                        } else {
                            return res.send({ error: 'N', msg: '', data: datas })
                        }
                    } else {
                        return res.send({ error: 'Y', msg: 'Mobile Number and password does not match', data: {} })
                    }
                })
            } else {
                return res.send({ error: 'Y', msg: 'Mobile Number Not Registered', data: {} })
            }
        })
    } else {
        return res.send({ error: 'Y', msg: 'Fillup All Detail', data: {} })
    }
}

exports.register = (req, res) => {
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
                db.collection('user').findOne({ mobileNo: data.mobileNo }, (err, result) => {
                    if (result) {
                        return res.send({ msg: 'Mobile Number Already Exist', error: "Y", registerData: '' })
                    } else if (data.email) {
                        db.collection('user').findOne({ email: data.email }, (err, emailexist) => {
                            if (emailexist) {
                                return res.send({ msg: 'Email Already Exist', error: "Y", registerData: '' })
                            } else {
                                db.collection('user').insertOne(register, (errs, response) => {
                                    if (errs) {
                                        return res.send({ msg: 'Something Going Wrong', error: "Y", registerData: '' })
                                    } else {
                                        return res.send({ msg: '', error: "N", registerData: 'success' })
                                    }
                                })
                            }
                        })
                    } else {
                        db.collection('user').insertOne(register, (errs, response) => {
                            if (errs) {
                                return res.send({ msg: 'Something Going Wrong', error: "Y", registerData: '' })
                            } else {
                                return res.send({ msg: '', error: "N", registerData: 'success' })
                            }
                        })
                    }

                })
            })
        })
    } else {
        return res.send({ error: 'Y', msg: 'Fillup All Detail', registerData: '' })
    }
}

exports.index = (req, res) => {

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
                "image": {
                    "$first": "$image"
                },
                "subcate": {
                    $push: "$subcate"
                }
            }
        }
    ]
    db.collection('cate').aggregate(aggregate).sort({ _id: 1 }).toArray((err, allcategory) => {
        // db.collection('petacate').find({}).toArray((err2, mydata) => {
        // db.collection('product').find({ pAprove: 1 }).sort({ _id: -1 }).toArray((err3, newproduct) => {
        res.send({
            msg: '',
            error: "N",
            category: allcategory,
            // banner: [],
            // newProduct: newproduct,
            // mostpopuler: [],
            pImgUrl: imgUrl,
            cImgUrl: cImgUrl
        })
        // })
        // })
    })
}

exports.findcategory = (req, res) => {
    var AuthenticateApi = RestApi.checkauthentication(req.query.authdevice, req.useragent, req, res)

    db.collection('category').findOne({
        scategory: {
            $elemMatch: {
                sscategory: {
                    $elemMatch: {
                        _id: objectId(req.query._id)
                    }
                }
            }
        }
    }, (err, data) => {

        var mysscategory = data.scategory[0].sscategory.filter(obj => obj._id == req.query._id)

        if (AuthenticateApi.from == 'web') {
            res.send({ error: 'N', msg: '', data: mysscategory })
        } else {
            res.send({ error: 'N', msg: '', data: mysscategory })
        }

    })
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
    var page = (typeof req.query.startpage != 'undefined') ? (req.query.startpage == 0) ? 1 : parseInt(req.query.startpage) || 1 : 1;
    var skip = (perPage * page) - perPage;

    if (!(req.query.pcid || req.query.scid || req.query.cid)) {
        var data = {
            error: 'N',
            search: {
                minPrice: 1
            },
            current: page,
            pages: 1
        }
        return res.send({ data: '', count: data, msg: '', error: "Y", imgUrl: imgUrl })
    }
    db.collection('petacate').find().toArray((err1, gstCharge) => {
        if (!err1) {
            if (req.query.mobileNo) {
                db.collection('product').find(wh).sort({ _id: -1 }).skip(skip).limit(perPage).toArray((err, results) => {
                    if (!err) {
                        db.collection('user').findOne({ mobileNo: req.query.mobileNo }, (e, mydata) => {
                            if (!e) {
                                if (mydata) {
                                    if (typeof mydata.wishlist[0] == 'undefined') {
                                        mydata.wishlist = [{
                                            pid: objectId('601e68bfc3129fc0586ab7ff')
                                        }]
                                    }
                                    var limiteddata = []
                                    for (var i = 0; i < results.length; i++) {
                                        var wishlistexist = 0
                                        for (var j = 0; j < mydata.wishlist.length; j++) {
                                            if (results[i]._id.toString() == mydata.wishlist[j].pid.toString()) {
                                                wishlistexist = 1
                                            }
                                        }

                                        for (var k = 0; k < gstCharge.length; k++) {
                                            if (results[i].petacate.toString() == gstCharge[k]._id.toString()) {
                                                cgst = results[i].price * gstCharge[k].cgst / 100;
                                                sgst = results[i].price * gstCharge[k].sgst / 100;
                                                igst = results[i].price * gstCharge[k].igst / 100;
                                            }
                                            results[i].price = parseInt(cgst + sgst + igst + results[i].price)
                                        }
                                        limiteddata.push({
                                            "_id": results[i]._id,
                                            "cate": results[i].cate,
                                            "subcate": results[i].subcate,
                                            "petacate": results[i].petacate,
                                            "resellerId": results[i].resellerId,
                                            "productName": results[i].productName,
                                            "price": results[i].price,
                                            "productImage": results[i].productImage[0],
                                            "rating": results[i].rating,
                                            "existWishlist": wishlistexist,
                                            "outofstock": (!(results[i].stock - results[i].soldCount) <= 0) ? 0 : 1,
                                        })
                                    }
                                    return res.send({ msg: '', error: "N", data: limiteddata, imgUrl: imgUrl })
                                } else {
                                    return res.send({ msg: 'user not found', error: "Y", data: [], imgUrl: imgUrl })
                                }

                            } else {
                                return res.send({ msg: 'something Going Wroing', error: "Y", data: [], imgUrl: imgUrl })
                            }
                        })
                    } else {
                        return res.send({ msg: 'something Going Wroing', error: "Y", data: [], imgUrl: imgUrl })
                    }
                })
            } else {
                db.collection('product').find(wh).sort({ _id: -1 }).skip(skip).limit(perPage).toArray((err, results) => {
                    if (!err) {
                        var limiteddata = []

                        for (var i = 0; i < results.length; i++) {

                            for (var k = 0; k < gstCharge.length; k++) {
                                if (results[i].petacate.toString() == gstCharge[k]._id.toString()) {
                                    cgst = results[i].price * gstCharge[k].cgst / 100;
                                    sgst = results[i].price * gstCharge[k].sgst / 100;
                                    igst = results[i].price * gstCharge[k].igst / 100;
                                }
                                results[i].price = parseInt(cgst + sgst + igst + results[i].price)
                            }

                            limiteddata.push({
                                "_id": results[i]._id,
                                "cate": results[i].cate,
                                "subcate": results[i].subcate,
                                "petacate": results[i].petacate,
                                "resellerId": results[i].resellerId,
                                "productName": results[i].productName,
                                "price": results[i].price,
                                "productImage": results[i].productImage[0],
                                "rating": results[i].rating,
                                "existWishlist": 0,
                                "outofstock": 0
                            })
                        }
                        return res.send({ msg: '', error: "N", data: limiteddata, imgUrl: imgUrl })
                    } else {
                        return res.send({ msg: 'something Going Wroing', error: "Y", data: [], imgUrl: imgUrl })
                    }
                })
            }
        } else {
            return res.send({ msg: 'something Going Wroing', error: "Y", data: [], imgUrl: imgUrl })
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
        wh['productName'] = { $regex: req.query.search }
    }
    var perPage = 12;
    var page = (typeof req.query.page != 'undefined') ? (req.query.page == 0) ? 1 : parseInt(req.query.page) || 1 : 1;
    var skip = (perPage * page) - perPage;

    if (!(req.query.rating || (req.query.minPrice || req.query.maxPrice) || req.query.search)) {
        // var data = {
        //     search: {
        //         minPrice : 1
        //     },
        //     startP: skip+1,
        //     endP: skip+perPage,
        //     current: page,
        //     pages: 1
        // }
        return res.send({
            data: '',
            // count: data,
            msg: '',
            error: "Y"
        })
    }
    db.collection('product').find(wh).sort({ _id: -1 }).skip(skip).limit(perPage).toArray((err, sResults) => {
        db.collection('product').countDocuments(wh, (err2, pCount) => {
            // var data = {
            //     search: req.query,
            //     startP: skip + 1,
            //     endP: skip + perPage,
            //     current: page,
            //     pages: Math.ceil(pCount / perPage)
            // }
            return res.send({
                data: sResults,
                // count: data,
                msg: '',
                error: "N"
            })
        })
    })
}

exports.productDetail = (req, res) => {
    if (!objectId.isValid(req.query.pid)) {
        return res.send({ error: 'Y', msg: 'product Id not Valid', data: {} })
    }
    db.collection('product').findOne({ _id: objectId(req.query.pid) }, (err3, productDetail) => {
        db.collection('deleverycharge').find().toArray((err4, mycharge) => {
            db.collection('petacate').findOne({ _id: objectId(productDetail.petacate) }, (err5, gstCharge) => {

                if (err3) {
                    return res.send({ data: {}, msg: 'Something Going Wrong', error: "Y" })
                } else {
                    if (productDetail) {
                        for (var i = 0; i < (productDetail.productImage).length; i++) {
                            productDetail.productImage[i] = imgUrl + '/' + productDetail.productImage[i]
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

                        productDetail.price = parseInt(cgst + sgst + igst + productDetail.price);

                        return res.send({ data: productDetail, msg: '', error: "N" })
                    } else {
                        return res.send({ data: {}, msg: 'product not found', error: "Y" })
                    }
                }
            })
        })
    })
}

exports.deleteAddress = (req, res) => {
    var data = req.body;
    if (typeof data.mobileNo != 'undefined') {
        db.collection('user').findOne({ mobileNo: data.mobileNo, address: { $elemMatch: { id: objectId(req.body.id) } } }, (e, myaddress) => {
            if (!e) {
                if (myaddress) {
                    db.collection('user').update({ mobileNo: data.mobileNo }, { $pull: { address: { id: objectId(req.body.id) } } }, (er, updated) => {
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

exports.insertaddress = (req, res) => {
    var data = req.body
    if (data.mobileNo && data.name && data.BuildingNameOrHouseNumber && data.area && data.contactNumber && data.pincode && data.state && data.city) {
        var address = {
            id: objectId(),
            mobileNo: data.mobileNo,
            name: data.name,
            BuildingNameOrHouseNumber: data.BuildingNameOrHouseNumber,
            area: data.area,
            contactNumber: data.contactNumber,
            pincode: data.pincode,
            state: data.state,
            city: data.city,
            date: new Date()
        }
        db.collection('user').findOne({ mobileNo: data.mobileNo }, (e, ifavail) => {
            if (!e) {
                if (ifavail) {
                    if (isNaN(data.contactNumber)) {
                        return res.send({ error: 'Y', msg: 'Contact Number Must be Digit', data: [] })
                    } else if (isNaN(data.pincode)) {
                        return res.send({ error: 'Y', msg: 'Pincode Not Valid', data: [] })
                    }
                    db.collection('user').update({ mobileNo: data.mobileNo }, { $push: { address: address } }, (er, updated) => {
                        if (!er) {
                            // db.collection('user').findOne({ mobileNo: data.mobileNo }, (err, alladdress) => {
                            //     if (!err) {
                            //         var dd = []
                            //         for(var i = 0; i < alladdress.address.length; i++){
                            //             var cc = {
                            //                 _id: alladdress.address[i]._id,
                            //                 name: alladdress.address[i].name,
                            //                 address: alladdress.address[i]['address'] = `${alladdress.address[i].BuildingNameOrHouseNumber}, ${alladdress.address[i].area}, ${alladdress.address[i].city}-${alladdress.address[i].pincode}, ${alladdress.address[i].state}, Mobile Number: ${alladdress.address[i].contactNumber}`,
                            //                 date: alladdress.address[i].date
                            //             }
                            //             dd.push(cc)
                            //         }
                            //         return res.send({ error: 'N', msg: '', data: dd })
                            //     } else {
                            //         return res.send({ error: 'Y', msg: 'Something Going Wrong...3', data: [] })
                            //     }
                            // })
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
}

exports.getaddress = (req, res) => {
    var data = req.body
    if (data.mobileNo) {
        db.collection('user').findOne({ mobileNo: data.mobileNo }, (e, alladdress) => {
            if (!e) {
                if (alladdress) {
                    var dd = []
                    for (var i = 0; i < alladdress.address.length; i++) {
                        var cc = {
                            name: alladdress.address[i].name,
                            addressId: alladdress.address[i].id,
                            address: alladdress.address[i]['address'] = `${alladdress.address[i].BuildingNameOrHouseNumber}, ${alladdress.address[i].area}, ${alladdress.address[i].city}-${alladdress.address[i].pincode}, ${alladdress.address[i].state}, Mobile Number: ${alladdress.address[i].contactNumber}`,
                            date: alladdress.address[i].date
                        }
                        dd.push(cc)
                    }
                    return res.send({ error: 'N', msg: '', data: dd })
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
}

exports.wishlist = (req, res) => {
    var data = req.body
    db.collection('user').findOne({ mobileNo: data.mobileNo }, (e, mydata) => {
        if (!e) {
            if (mydata) {
                var array = []
                for (var i = 0; i < mydata.wishlist.length; i++) {
                    array.push(objectId(mydata.wishlist[i].pid))
                }
                db.collection('product').find({ _id: { $in: array } }).sort({ _id: 1 }).toArray((er, allcart) => {
                    if (!er) {
                        var wishlistData = []
                        for (var i = 0; i < allcart.length; i++) {
                            var mycart = {
                                pid: allcart[i]._id,
                                productName: allcart[i].productName,
                                price: allcart[i].price,
                                productImage: allcart[i].productImage[0],
                            }
                            wishlistData.push(mycart)
                        }
                        return res.send({ data: wishlistData, msg: '', error: "N" })
                    } else {
                        return res.send({ data: [], msg: 'Something Going Wrong!!', error: "Y" })
                    }
                })
            } else {
                return res.send({ data: [], msg: 'user not found!!', error: "Y" })
            }
        } else {
            return res.send({ data: [], msg: 'Something Going Wrong!!', error: "Y" })
        }
    })
}

exports.deleteWishlistProduct = (req, res) => {
    var data = req.body
    if (objectId.isValid(data.pid)) {
        db.collection('user').findOne({ mobileNo: data.mobileNo }, (e, mydata) => {
            if (!e) {
                if (mydata) {
                    db.collection('user').updateOne({ mobileNo: data.mobileNo }, { $pull: { wishlist: { pid: objectId(data.pid) } } }, (er, updated) => {
                        if (!er) {
                            return res.send({ msg: '', error: 'N' })
                        } else {
                            return res.send({ msg: 'Something Going Wrong!!', error: "Y" })
                        }
                    })
                } else {
                    return res.send({ msg: 'User Not Found In wishlist!!', error: "Y" })
                }
            } else {
                return res.send({ msg: 'Something Going Wrong!!', error: "Y" })
            }
        })
    } else {
        return res.send({ msg: 'Something Going Wrong!!', error: "Y" })
    }
}

exports.addWishlistProduct = (req, res) => {
    var data = req.body;
    if (objectId.isValid(data.pid)) {
        db.collection('user').findOne({ mobileNo: data.mobileNo }, (e, mydata) => {
            if (!e) {
                if (mydata) {
                    db.collection('user').findOne({ mobileNo: data.mobileNo, wishlist: { $elemMatch: { pid: objectId(data.pid) } } }, (e, mydata) => {
                        if (!mydata) {
                            db.collection('user').updateOne({ mobileNo: data.mobileNo }, { $push: { wishlist: { pid: objectId(data.pid), date: new Date() } } }, (er, updated) => {
                                if (!er) {
                                    console.log('done')
                                    return res.send({ msg: '', error: "N" })
                                } else {
                                    return res.send({ msg: 'Something Going Wrong!!', error: "Y" })
                                }
                            })
                        } else {
                            console.log('already here')
                            return res.send({ msg: 'product already available in wishlist', error: "N" })
                        }
                    })
                } else {
                    return res.send({ msg: 'User Not Found In wishlist!!', error: "Y" })
                }
            } else {
                return res.send({ msg: 'Something Going Wrong!!', error: "Y" })
            }
        })
    } else {
        return res.send({ msg: 'Something Going Wrong!!', error: "Y" })
    }
}

exports.cart = (req, res) => {
    var data = req.body;
    if (data.mobileNo) {
        console.log(data)
        db.collection('user').findOne({ mobileNo: data.mobileNo }, (e, ifuserExits) => {
            if (!e) {
                if (ifuserExits) {
                    db.collection('cart').findOne({ mobileNo: data.mobileNo }, (er, mydata) => {
                        if (!er) {
                            if (mydata) {
                                var array = []
                                for (var i = 0; i < mydata.cart.length; i++) {
                                    array.push(objectId(mydata.cart[i].pid))
                                }
                                db.collection('product').find({ _id: { $in: array } }).sort({ _id: 1 }).toArray((err, allcart) => {
                                    if (!err) {
                                        db.collection('petacate').find().toArray((errr, gstCharge) => {
                                            if(!errr){

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

                                        var sum = totalAmount.reduce(function (a, b) {
                                            return a + b;
                                        }, 0);

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
                                            address: (typeof ifuserExits.address[0] != 'undefined') ? ifuserExits.address[0] : {},
                                            totalAmount: sum,
                                            withDelivery: withDelivery,
                                            disableBuy: (defaults > 0) ? 1 : 0
                                        }

                                        return res.send({ data: cartitem, msg: '', error: "N" })
                                    } else {
                                        return res.send({ error: 'Y', msg: 'Something Going Wrong', data: {} })
                                    }
                                })
                                    } else {
                                        return res.send({ error: 'Y', msg: 'Something Going Wrong', data: {} })
                                    }
                                })
                                    } else {
                                        return res.send({ data: {}, msg: 'Something Going Wrong!!', error: "Y" })
                                    }
                                })
                            } else {
                                var cartitem = {
                                    product: [],
                                    totalAmount: 0,
                                    address: (typeof ifuserExits.address[0] != 'undefined') ? ifuserExits.address[0] : {},
                                    disableBuy: 1
                                }

                                return res.send({ data: cartitem, msg: 'cart empty', error: "N" })
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
        return res.send({ error: 'Y', msg: 'Mobile Number Not found', data: {} })
    }
}

exports.addCart = (req, res) => {
    var data = req.body;
    if (objectId.isValid(data.pid)) {
        if (data.mobileNo) {
            db.collection('cart').findOne({ mobileNo: data.mobileNo }, (e, existuser) => {
                db.collection('user').findOne({ mobileNo: data.mobileNo }, (error2, uservalid) => {
                    if (!error2) {
                        if (uservalid) {
                            if (!e) {
                                db.collection('product').findOne({ _id: objectId(data.pid) }, (err2, pidExist) => {
                                    if (!err2) {
                                        if (pidExist) {
                                            if (pidExist.stock != pidExist.soldCount) {
                                                if (existuser) {
                                                    db.collection('cart').findOne({ mobileNo: data.mobileNo, cart: { $elemMatch: { pid: objectId(data.pid) } } }, (er, mydata) => {
                                                        if (!er) {
                                                            if (mydata) {
                                                                for (var i = 0; i < mydata.cart.length; i++) {
                                                                    if (mydata.cart[i].pid.toString() == data.pid) {
                                                                        if(((pidExist.stock - pidExist.soldCount) - mydata.cart[i].quantity) <= 0){
                                                                            return res.send({ msg: '', error: "N", data: `only ${(pidExist.stock - pidExist.soldCount)} item available in stock` })
                                                                        }
                                                                    }
                                                                }
                                                                db.collection('cart').updateOne({ mobileNo: data.mobileNo, cart: { $elemMatch: { pid: objectId(data.pid) } } }, { $inc: { "cart.$.quantity": +1 } }, (err, updated) => {
                                                                    return res.send({ msg: '', error: "N", data: '0' })
                                                                    return res.redirect(307, '/cart')
                                                                })
                                                            } else {
                                                                db.collection('cart').updateOne({ mobileNo: data.mobileNo }, { $push: { cart: { pid: objectId(data.pid), quantity: 1, date: new Date() } } }, (err, insertone) => {
                                                                    if (!err) {
                                                                        return res.send({ msg: '', error: "N", data: '0' })
                                                                    } else {
                                                                        return res.send({ msg: 'Something Going Wrong!!', error: "Y", data: '' })
                                                                    }
                                                                })
                                                            }
                                                        } else {
                                                            return res.send({ error: 'Y', msg: 'something Going Wrong', data: '' })
                                                        }
                                                    })
                                                } else {
                                                    var product = {
                                                        mobileNo: data.mobileNo,
                                                        cart: [{
                                                            pid: objectId(data.pid),
                                                            quantity: 1,
                                                            date: new Date()
                                                        }]
                                                    }
                                                    db.collection('cart').insertOne(product, (err, mydata) => {
                                                        if (!err) {
                                                            return res.send({ msg: '', error: "N", data: 'success' })
                                                        } else {
                                                            return res.send({ error: 'Y', msg: 'something Going Wrong', data: '' })
                                                        }
                                                    })
                                                }
                                            } else {
                                                return res.send({ error: 'N', msg: 'out of stocksss', data: '' })
                                            }
                                        } else {
                                            return res.send({ error: 'Y', msg: 'product Id Not Found', data: '' })
                                        }
                                    } else {
                                        return res.send({ error: 'Y', msg: 'something Going Wrong', data: '' })
                                    }
                                })
                            } else {
                                return res.send({ error: 'Y', msg: 'something Going Wrong', data: '' })
                            }
                        } else {
                            return res.send({ error: 'Y', msg: 'user not found', data: '' })
                        }
                    } else {
                        return res.send({ error: 'Y', msg: 'something Going Wrong', data: '' })
                    }
                })
            })
        } else {
            return res.send({ error: 'Y', msg: 'Mobile Number Not found', data: '' })
        }
    } else {
        return res.send({ error: 'Y', msg: 'product id not Valid', data: '' })
    }
}

exports.removeCart = (req, res) => {
    var data = req.body;
    if (objectId.isValid(data.pid)) {
        if (data.mobileNo) {
            db.collection('cart').findOne({ mobileNo: data.mobileNo }, (e, existuser) => {
                if (!e) {
                    db.collection('product').findOne({ _id: objectId(data.pid) }, (err2, pidExist) => {
                        if (!err2) {
                            if (pidExist) {
                                if (existuser) {
                                    db.collection('cart').findOne({ mobileNo: data.mobileNo, cart: { $elemMatch: { pid: objectId(data.pid) } } }, (er, mydata) => {
                                        if (!er) {
                                            if (mydata) {
                                                var array = []
                                                for (var i = 0; i < mydata.cart.length; i++) {
                                                    if (mydata.cart[i].pid.toString() == data.pid) {
                                                        array.push(mydata.cart[i].quantity)
                                                    }
                                                }
                                                if (array[0] > 1) {
                                                    db.collection('cart').updateOne({ mobileNo: data.mobileNo, cart: { $elemMatch: { pid: objectId(data.pid) } } }, { $inc: { "cart.$.quantity": -1 } }, (err, updated) => {
                                                        return res.send({ msg: 'success', error: "N", data: 'success'})
                                                    })
                                                } else {
                                                    return res.send({ error: 'Y', msg: 'minimum allow 1 product', data: '' })
                                                }
                                            } else {
                                                return res.send({ error: 'Y', msg: 'product not available in cart', data: '' })
                                            }
                                        } else {
                                            return res.send({ error: 'Y', msg: 'something Going Wrong', data: '' })
                                        }
                                    })
                                } else {
                                    return res.send({ error: 'Y', msg: 'product not available in cart', data: '' })
                                }
                            } else {
                                return res.send({ error: 'Y', msg: 'product Id Not Found', data: '' })
                            }
                        } else {
                            return res.send({ error: 'Y', msg: 'something Going Wrong', data: '' })
                        }
                    })
                } else {
                    return res.send({ error: 'Y', msg: 'something Going Wrong', data: '' })
                }
            })
        } else {
            return res.send({ error: 'Y', msg: 'Mobile Number Not found', data: '' })
        }
    } else {
        return res.send({ error: 'Y', msg: 'product id not Valid', data: '' })
    }
}

exports.deleteCart = (req, res) => {
    var data = req.body;
    if (objectId.isValid(data.pid)) {
        if (data.mobileNo) {
            db.collection('cart').updateOne({ mobileNo: data.mobileNo }, { $pull: { cart: { pid: objectId(data.pid) } } }, (e, update) => {
                if (!e) {
                    return res.send({ error: 'N', msg: 'success', data: 'success' })
                } else {
                    return res.send({ error: 'Y', msg: 'something Going Wrong', data: '' })
                }
            })
        } else {
            return res.send({ error: 'Y', msg: 'Mobile Number Not found', data: '' })
        }
    } else {
        return res.send({ error: 'Y', msg: 'product id not Valid', data: '' })
    }
}

exports.payment = (req, res) => {
    var data = req.body;
    if (data.mobileNo && data.type && data.address && data.paymentType) {
        db.collection('user').findOne({ mobileNo: data.mobileNo }, (e, ifuserexist) => {
            if (ifuserexist) {
                db.collection('deleverycharge').find().toArray((err1, mycharge) => {
                    if (!err1) {
                        if (data.type == 'cart') {
                            db.collection('cart').findOne({ mobileNo: data.mobileNo }, (err2, mydata) => {
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
                                                    if (ifuserexist.address[i].id == data.address) {
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
                                                        // return res.redirect('/')
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
                            if (data.pid && data.quantity) {
                                db.collection('product').findOne({ _id: objectId(data.pid) }, (er, myorder) => {
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
        return res.send({ error: 'Y', msg: 'fill all detail', data: '' })
    }
}

exports.orderHistory = (req, res) => {
    var data = req.body
    if (data.mobileNo) {
        db.collection('user').findOne({ mobileNo: data.mobileNo }, (er, ifexist) => {
            if (ifexist) {
                db.collection('order').find({ buyerNumber: data.mobileNo }).sort({ _id: -1 }).toArray((err, mydata) => {
                    if (!err) {
                        db.collection('reseller').find({}).toArray((e, resellerdata) => {
                            if (!e) {
                                var orderH = []
                                for (var i = 0; i < mydata.length; i++) {
                                    orderH.push({
                                        orderId: mydata[i].orderId,
                                        pid: mydata[i].products.pid,
                                        productImage: mydata[i].products.productImage,
                                        productName: mydata[i].products.productName,
                                        orderStatusBySeller: mydata[i].orderStatusBySeller,
                                        orderStatusByBuyer: mydata[i].orderStatusByBuyer,
                                        date: mydata[i].date
                                    })
                                }
                                return res.send({ error: 'N', msg: '', data: orderH })
                            } else {
                                return res.send({ error: 'Y', msg: 'something going wrong', data: '' })
                            }
                        })
                    } else {
                        return res.send({ error: 'Y', msg: 'something going wrong', data: '' })
                    }
                })
            } else {
                return res.send({ error: 'Y', msg: 'mobile number not found', data: '' })
            }
        })
    }
}