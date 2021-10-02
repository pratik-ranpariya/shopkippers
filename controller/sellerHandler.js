exports.loginpage = (req, res) => {
    sess = '';
    sellerModel.responseData('sellerPanel/index.html', {
        msg: '',
        error: 'N'
    }, res)
}

exports.get_register = (req, res) => {
    sess = '';
    sellerModel.responseData('sellerPanel/register.html', {
        msg: '',
        error: 'N'
    }, res)
}

exports.get_login = (req, res) => {
    sess = '';
    sellerModel.responseData('sellerPanel/index.html', {
        msg: '',
        error: 'N'
    }, res)
}

exports.post_login = (req, res) => {
    sess = req.session;
    var data = req.body;
    var mobile = data.Mobile_no;
    var password = data.password;
    if (mobile && password) {
        db.collection('reseller').findOne({ Mobile_no: mobile }, (err, result) => {
            if (err) {
                console.log(err);
            }
            if (result) {
                bcrypt.compare(password, result.password, function (err, trueres) {
                    if (trueres == true) {
                        if (result.block == 1) {
                            return sellerModel.responseData('sellerPanel/index.html', {
                                msg: 'User Is Blocked',
                                error: 'Y'
                            }, res)
                        } else {
                            sess.Mobile_no = req.body.Mobile_no;
                            return res.redirect('/dashboard');
                        }
                    } else {
                        sess.Mobile_no = req.body.Mobile_no;
                        return sellerModel.responseData('sellerPanel/index.html', {
                            msg: 'Mobile Number and password not metch',
                            error: 'Y'
                        }, res)
                    }
                })
            } else {
                return sellerModel.responseData('sellerPanel/index.html', {
                    msg: 'User Not Found',
                    error: 'Y'
                }, res)
            }
        })
    } else {
        return sellerModel.responseData('sellerPanel/index.html', {
            msg: 'Fillup All Detail',
            error: 'Y'
        }, res)
    }
}

exports.post_register = (req, res) => {
    sess = req.session;
    var data = req.body;

    if (data.companyName == '' || data.sellerName == '' || data.Mobile_no == '' || data.email == '' || typeof data.companyName == 'undefined' || typeof data.sellerName == 'undefined' || typeof data.Mobile_no == 'undefined' || typeof data.email == 'undefined' || typeof data.companyName == 'null' || typeof data.sellerName == 'null' || typeof data.Mobile_no == 'null' || typeof data.email == 'null') {
        return sellerModel.responseData('sellerPanel/register.html', {
            error: 'Y',
            msg: 'Fillup all detail',
        }, res);
    }

    bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(data.password, salt, (err, hash) => {
            var currentTime = new Date()
            currentTime.setUTCHours(currentTime.getHours() + 5);
            currentTime.setUTCMinutes(currentTime.getMinutes() + 30);
            var register = {
                companyName: data.companyName,
                sellerName: data.sellerName,
                Mobile_no: data.Mobile_no,
                email: data.email,
                password: hash,
                date: currentTime
            }

            db.collection('reseller').findOne({ Mobile_no: data.Mobile_no }, (err, mobilexist) => {
                db.collection('reseller').findOne({ email: data.email }, (err, emailexist) => {

                    if (mobilexist) {
                        return sellerModel.responseData('sellerPanel/register.html', {
                            msg: 'Mobile Already Exist!!',
                            error: "Y"
                        }, res);
                    } else if (emailexist) {
                        return sellerModel.responseData('sellerPanel/register.html', {
                            msg: 'Email Already Exist!!',
                            error: "Y"
                        }, res);
                    } else {
                        db.collection('reseller').insertOne(register, (err1, datainserted) => {
                            if (err1) {
                                return sellerModel.responseData('sellerPanel/register.html', {
                                    msg: 'database error',
                                    error: "Y"
                                }, res);
                            }
                            db.collection('register').findOne({ Mobile_no: data.Mobile_no }, (err2, giveres) => {
                                if (err2) {
                                    return sellerModel.responseData('sellerPanel/register.html', {
                                        msg: 'database error',
                                        error: "Y"
                                    }, res);
                                }
                                return res.redirect('/login')
                            })
                        })
                    }
                })
            })
        })
    })
}

exports.dashboard = (req, res) => {
    sess = req.session;
    sess.active = 'dashboard'

    if (typeof sess.Mobile_no != 'undefined') {

        // db.collection()
        return sellerModel.responseData('sellerPanel/dashboard.html', {
            msg: '',
            error: "N"
        }, res);

    } else {
        res.redirect('/logout')
    }
}

exports.bankDetail = (req, res) => {
    sess = req.session;
    sess.active = 'bankdetail'

    if (typeof sess.Mobile_no != 'undefined') {

        db.collection('reseller').findOne({ Mobile_no: sess.Mobile_no }, (err, ifexist) => {
            if (ifexist) {
                db.collection('resellerimps').findOne({ resellerid: objectId(ifexist._id) }, (err, alldata) => {
                    return sellerModel.responseData('sellerPanel/bankdetail.html', {
                        msg: '',
                        msg2: '',
                        msg3: '',
                        data: alldata,
                        error: "N"
                    }, res)
                })
            } else {
                res.redirect('/logout')
            }
        })

    } else {
        res.redirect('/logout')
    }
}

exports.BankDetailinsert = (req, res) => {
    sess = req.session;
    var data = req.body

    if (typeof sess.Mobile_no != 'undefined') {
        db.collection('reseller').findOne({ Mobile_no: sess.Mobile_no }, (err, ifexist) => {
            if (ifexist) {
                db.collection('resellerimps').findOne({ resellerid: objectId(ifexist._id) }, (err, idavailable) => {
                    if (idavailable) {
                        var query = { resellerid: objectId(ifexist._id) }
                        var updatedata = {
                            $set: {
                                accountno: data.accountno,
                                accountholdername: data.accountholdername,
                                bankname: data.bankname,
                                ifsc: data.ifsc,
                                bankStatus: 0
                            }
                        }
                        db.collection('resellerimps').updateOne(query, updatedata, (err2, sucess) => {
                            if (!err2) {
                                res.redirect('/bankDetail')
                            } else {
                                res.redirect('/logout')
                            }
                        })
                    } else {
                        var insertdata = {
                            resellerid: objectId(ifexist._id),
                            accountno: data.accountno,
                            accountholdername: data.accountholdername,
                            bankname: data.bankname,
                            ifsc: data.ifsc,
                            bankStatus: 0
                        }
                        db.collection('resellerimps').insertOne(insertdata, (err2, sucess) => {
                            if (!err2) {
                                res.redirect('/bankDetail')
                            } else {
                                res.redirect('/logout')
                            }
                        })
                    }
                })
            } else {
                res.redirect('/logout')
            }
        })
    } else {
        res.redirect('/logout')
    }
}

exports.BusinessDetailinsert = (req, res) => {
    sess = req.session;
    var data = req.body

    if (typeof sess.Mobile_no != 'undefined') {
        db.collection('reseller').findOne({ Mobile_no: sess.Mobile_no }, (err, ifexist) => {
            if (ifexist) {
                db.collection('resellerimps').findOne({ resellerid: objectId(ifexist._id) }, (err, idavailable) => {
                    if (idavailable) {
                        var query = { resellerid: objectId(ifexist._id) }
                        var updatedata = {
                            $set: {
                                gstnumber: data.gstnumber,
                                registerbusinessaddress: data.registerbusinessaddress,
                                businesstype: data.businesstype,
                                businessStatus: 0
                            }
                        }
                        db.collection('resellerimps').updateOne(query, updatedata, (err2, sucess) => {
                            if (!err2) {
                                res.redirect('/bankDetail')
                            } else {
                                res.redirect('/logout')
                            }
                        })
                    } else {
                        var insertdata = {
                            resellerid: objectId(ifexist._id),
                            gstnumber: data.gstnumber,
                            registerbusinessaddress: data.registerbusinessaddress,
                            businesstype: data.businesstype,
                            businessStatus: 0
                        }
                        db.collection('resellerimps').insertOne(insertdata, (err2, sucess) => {
                            if (!err2) {
                                res.redirect('/bankDetail')
                            } else {
                                res.redirect('/logout')
                            }
                        })
                    }
                })
            } else {
                res.redirect('/logout')
            }
        })
    } else {
        res.redirect('/logout')
    }
}

exports.documentDetailInsert = (req, res) => {
    sess = req.session;
    var data = req.body

    if (typeof sess.Mobile_no != 'undefined') {
        db.collection('reseller').findOne({ Mobile_no: sess.Mobile_no }, (err, ifexist) => {
            if (ifexist) {
                db.collection('resellerimps').findOne({ resellerid: objectId(ifexist._id) }, (err, idavailable) => {
                    if (idavailable) {
                        var query = { resellerid: objectId(ifexist._id) }
                        var wh = {};
                        if (req.files) {
                            if (req.files.gstcertificate) {
                                // var path = 'views/adminPanel/video/imageThumb/' + result1.imageThumb;
                                // fs.unlink(path, (err) => { })
                                var file = req.files.gstcertificate;
                                var firstposter = Date.now() + '_' + file.name;
                                if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/PNG" || file.mimetype == "image/webp") {
                                    file.mv('views/sellerPanel/img/document/' + firstposter)
                                    wh['gstcertificate'] = firstposter
                                } else {
                                    return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                        msg: '',
                                        msg2: '',
                                        msg3: 'GST Certificate Allowed Only jpeg/png/JPG/PNG/webp image type',
                                        data: idavailable,
                                        error: "Y"
                                    }, res)
                                }
                            }

                            if (req.files.passbook) {
                                // var path = 'views/adminPanel/video/imageThumb/' + result1.imageThumb;
                                // fs.unlink(path, (err) => { })
                                var file = req.files.passbook;
                                var firstposter = Date.now() + '_' + file.name;
                                if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/PNG" || file.mimetype == "image/webp") {
                                    file.mv('views/sellerPanel/img/document/' + firstposter)
                                    wh['passbook'] = firstposter
                                } else {
                                    return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                        msg: '',
                                        msg2: '',
                                        msg3: 'Passbook Allowed Only jpeg/png/JPG/PNG/webp image type',
                                        data: idavailable,
                                        error: "Y"
                                    }, res)
                                }
                            }

                            if (req.files.checkbook) {
                                // var path = 'views/adminPanel/video/imageThumb/' + result1.imageThumb;
                                // fs.unlink(path, (err) => { })
                                var file = req.files.checkbook;
                                var firstposter = Date.now() + '_' + file.name;
                                if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/PNG" || file.mimetype == "image/webp") {
                                    file.mv('views/sellerPanel/img/document/' + firstposter)
                                    wh['checkbook'] = firstposter
                                } else {
                                    return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                        msg: '',
                                        msg2: '',
                                        msg3: 'Checkbook Allowed Only jpeg/png/JPG/PNG/webp image type',
                                        data: idavailable,
                                        error: "Y"
                                    }, res)
                                }
                            }

                            if (req.files.adharcard) {
                                // var path = 'views/adminPanel/video/imageThumb/' + result1.imageThumb;
                                // fs.unlink(path, (err) => { })
                                var file = req.files.adharcard;
                                var firstposter = Date.now() + '_' + file.name;
                                if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/PNG" || file.mimetype == "image/webp") {
                                    file.mv('views/sellerPanel/img/document/' + firstposter)
                                    wh['adharcard'] = firstposter
                                } else {
                                    return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                        msg: '',
                                        msg2: '',
                                        msg3: 'Adharcard Allowed Only jpeg/png/JPG/PNG/webp image type',
                                        data: idavailable,
                                        error: "Y"
                                    }, res)
                                }
                            }

                            if (req.files.resellerimage) {
                                // var path = 'views/adminPanel/video/imageThumb/' + result1.imageThumb;
                                // fs.unlink(path, (err) => { })
                                var file = req.files.resellerimage;
                                var firstposter = Date.now() + '_' + file.name;
                                if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/PNG" || file.mimetype == "image/webp") {
                                    file.mv('views/sellerPanel/img/document/' + firstposter)
                                    wh['resellerimage'] = firstposter
                                } else {
                                    return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                        msg: '',
                                        msg2: '',
                                        msg3: 'Passport Size Photo Allowed Only jpeg/png/JPG/PNG/webp image type',
                                        data: idavailable,
                                        error: "Y"
                                    }, res)
                                }
                            }

                            if (req.files.pancard) {
                                // var path = 'views/adminPanel/video/imageThumb/' + result1.imageThumb;
                                // fs.unlink(path, (err) => { })
                                var file = req.files.pancard;
                                var firstposter = Date.now() + '_' + file.name;
                                if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/PNG" || file.mimetype == "image/webp") {
                                    file.mv('views/sellerPanel/img/document/' + firstposter)
                                    wh['pancard'] = firstposter
                                } else {
                                    return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                        msg: '',
                                        msg2: '',
                                        msg3: 'Pancard Allowed Only jpeg/png/JPG/PNG/webp image type',
                                        data: idavailable,
                                        error: "Y"
                                    }, res)
                                }
                            }

                            if (req.files.signature) {
                                // var path = 'views/adminPanel/video/imageThumb/' + result1.imageThumb;
                                // fs.unlink(path, (err) => { })
                                var file = req.files.signature;
                                var firstposter = Date.now() + '_' + file.name;
                                if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/PNG" || file.mimetype == "image/webp") {
                                    file.mv('views/sellerPanel/img/document/' + firstposter)
                                    wh['signature'] = firstposter
                                } else {
                                    return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                        msg: '',
                                        msg2: '',
                                        msg3: 'Signature Allowed Only jpeg/png/JPG/PNG/webp image type',
                                        data: idavailable,
                                        error: "Y"
                                    }, res)
                                }
                            }
                        }

                        wh['DocumentStatus'] = 0
                        
                        var value = { $set: wh }

                        db.collection('resellerimps').updateOne(query, value, (err, success) => {
                            try {
                                if (err) throw err
                                res.redirect('/bankDetail')
                            } catch (error) {
                                res.send('database error')
                            }
                        })
                    } else {

                        if (req.files.gstcertificate && req.files.passbook && req.files.checkbook && req.files.adharcard && req.files.resellerimage && req.files.pancard && req.files.signature) {
                            var file = req.files.gstcertificate;
                            var firstposter = Date.now() + '_' + file.name;
                            if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/PNG" || file.mimetype == "image/webp") {
                                file.mv('views/sellerPanel/img/document/' + firstposter, (err) => {
                                    if (err) {
                                        return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                            msg: '',
                                            msg2: '',
                                            msg3: 'Something Going Wrong',
                                            data: idavailable,
                                            error: "Y"
                                        }, res)
                                    }
                                    var file2 = req.files.passbook;
                                    var secondposter = Date.now() + '_' + file2.name;
                                    if (file2.mimetype == "image/jpeg" || file2.mimetype == "image/png" || file2.mimetype == "image/jpg" || file2.mimetype == "image/PNG" || file2.mimetype == "image/webp") {
                                        file2.mv('views/sellerPanel/img/document/' + secondposter, (err) => {
                                            if (err) {
                                                return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                                    msg: '',
                                                    msg2: '',
                                                    msg3: 'Something Going Wrong',
                                                    data: idavailable,
                                                    error: "Y"
                                                }, res)
                                            }
                                            var file3 = req.files.checkbook;
                                            var thirdposter = Date.now() + '_' + file3.name;
                                            if (file3.mimetype == "image/jpeg" || file3.mimetype == "image/png" || file3.mimetype == "image/jpg" || file3.mimetype == "image/PNG" || file3.mimetype == "image/webp") {
                                                file3.mv('views/sellerPanel/img/document/' + thirdposter, (err) => {
                                                    if (err) {
                                                        return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                                            msg: '',
                                                            msg2: '',
                                                            msg3: 'Something Going Wrong',
                                                            data: idavailable,
                                                            error: "Y"
                                                        }, res)
                                                    }
                                                    var file4 = req.files.adharcard;
                                                    var forthposter = Date.now() + '_' + file4.name;
                                                    if (file4.mimetype == "image/jpeg" || file4.mimetype == "image/png" || file4.mimetype == "image/jpg" || file4.mimetype == "image/PNG" || file4.mimetype == "image/webp") {
                                                        file4.mv('views/sellerPanel/img/document/' + forthposter, (err) => {
                                                            if (err) {
                                                                return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                                                    msg: '',
                                                                    msg2: '',
                                                                    msg3: 'Something Going Wrong',
                                                                    data: idavailable,
                                                                    error: "Y"
                                                                }, res)
                                                            }
                                                            var file5 = req.files.resellerimage;
                                                            var fifthposter = Date.now() + '_' + file5.name;
                                                            if (file5.mimetype == "image/jpeg" || file5.mimetype == "image/png" || file5.mimetype == "image/jpg" || file5.mimetype == "image/PNG" || file5.mimetype == "image/webp") {
                                                                file5.mv('views/sellerPanel/img/document/' + fifthposter, (err) => {
                                                                    if (err) {
                                                                        return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                                                            msg: '',
                                                                            msg2: '',
                                                                            msg3: 'Something Going Wrong',
                                                                            data: idavailable,
                                                                            error: "Y"
                                                                        }, res)
                                                                    }
                                                                    var file6 = req.files.pancard;
                                                                    var sixthposter = Date.now() + '_' + file6.name;
                                                                    if (file6.mimetype == "image/jpeg" || file6.mimetype == "image/png" || file6.mimetype == "image/jpg" || file6.mimetype == "image/PNG" || file6.mimetype == "image/webp") {
                                                                        file6.mv('views/sellerPanel/img/document/' + sixthposter, (err) => {
                                                                            if (err) {
                                                                                return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                                                                    msg: '',
                                                                                    msg2: '',
                                                                                    msg3: 'Something Going Wrong',
                                                                                    data: idavailable,
                                                                                    error: "Y"
                                                                                }, res)
                                                                            }
                                                                            var file7 = req.files.signature;
                                                                            var seventhposter = Date.now() + '_' + file7.name;
                                                                            if (file7.mimetype == "image/jpeg" || file7.mimetype == "image/png" || file7.mimetype == "image/jpg" || file7.mimetype == "image/PNG" || file7.mimetype == "image/webp") {
                                                                                file7.mv('views/sellerPanel/img/document/' + seventhposter, (err) => {
                                                                                    if (err) {
                                                                                        return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                                                                            msg: '',
                                                                                            msg2: '',
                                                                                            msg3: 'Something Going Wrong',
                                                                                            data: idavailable,
                                                                                            error: "Y"
                                                                                        }, res)
                                                                                    }
                                                                                    // 0 = pending
                                                                                    // 1 = approve
                                                                                    // 2 = reject
                                                                                    var insertdata = {
                                                                                        resellerid: objectId(ifexist._id),
                                                                                        gstcertificate: firstposter,
                                                                                        passbook: secondposter,
                                                                                        checkbook: thirdposter,
                                                                                        adharcard: forthposter,
                                                                                        resellerimage: fifthposter,
                                                                                        pancard: sixthposter,
                                                                                        signature: seventhposter,
                                                                                        DocumentStatus: 0
                                                                                    }
                                                                                    db.collection('resellerimps').insertOne(insertdata, (err2, sucess) => {
                                                                                        if (!err2) {
                                                                                            res.redirect('/bankDetail')
                                                                                        } else {
                                                                                            res.redirect('/logout')
                                                                                        }
                                                                                    })
                                                                                })
                                                                            } else {
                                                                                return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                                                                    msg: '',
                                                                                    msg2: '',
                                                                                    msg3: 'Signature Allowed Only jpeg/png/JPG/PNG/webp image type',
                                                                                    data: idavailable,
                                                                                    error: "Y"
                                                                                }, res)
                                                                            }
                                                                        })
                                                                    } else {
                                                                        return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                                                            msg: '',
                                                                            msg2: '',
                                                                            msg3: 'Pancard Allowed Only jpeg/png/JPG/PNG/webp image type',
                                                                            data: idavailable,
                                                                            error: "Y"
                                                                        }, res)
                                                                    }
                                                                })
                                                            } else {
                                                                return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                                                    msg: '',
                                                                    msg2: '',
                                                                    msg3: 'Passport Size Photo Allowed Only jpeg/png/JPG/PNG/webp image type',
                                                                    data: idavailable,
                                                                    error: "Y"
                                                                }, res)
                                                            }
                                                        })
                                                    } else {
                                                        return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                                            msg: '',
                                                            msg2: '',
                                                            msg3: 'Adharcard Allowed Only jpeg/png/JPG/PNG/webp image type',
                                                            data: idavailable,
                                                            error: "Y"
                                                        }, res)
                                                    }
                                                })
                                            } else {
                                                return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                                    msg: '',
                                                    msg2: '',
                                                    msg3: 'checkbook Allowed Only jpeg/png/JPG/PNG/webp image type',
                                                    data: idavailable,
                                                    error: "Y"
                                                }, res)
                                            }
                                        })
                                    } else {
                                        return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                            msg: '',
                                            msg2: '',
                                            msg3: 'Passbook Allowed Only jpeg/png/JPG/PNG/webp image type',
                                            data: idavailable,
                                            error: "Y"
                                        }, res)
                                    }
                                })
                            } else {
                                return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                    msg: '',
                                    msg2: '',
                                    msg3: 'GST Certificate Allowed Only jpeg/png/JPG/PNG/webp image type',
                                    data: idavailable,
                                    error: "Y"
                                }, res)
                            }
                        } else {
                            return sellerModel.responseData('sellerPanel/bankdetail.html', {
                                msg: '',
                                msg2: '',
                                msg3: 'Fillup All Detail',
                                data: idavailable,
                                error: "Y"
                            }, res)
                        }
                    }
                })
            } else {
                res.redirect('/logout')
            }
        })
    } else {
        res.redirect('/logout')
    }
}

exports.listing = (req, res) => {
    sess = req.session;
    sess.active = 'listing'
    if (typeof sess.Mobile_no != 'undefined') {
        db.collection('cate').find({}).toArray((err, myres) => {
            sellerModel.responseData('sellerPanel/listing.html', {
                data: myres,
                msg: '',
                error: 'N'
            }, res)
        })
    } else {
        res.redirect('/login')
    }
}

exports.insertProduct = (req, res) => {
    sess = req.session;
    if (typeof sess.Mobile_no != 'undefined') {

        db.collection('reseller').findOne({ Mobile_no: sess.Mobile_no }, (erro, resellerId) => {

            var data = req.body;
            var multiImg = [];
            var file = req.files.uploaded_image;
            var video = req.files.uploaded_video;
            console.log(video)

            if (video) {
                var video_namess = Date.now() + '_' + video.name;
                var video_name = video_namess.trim()
                if (video.mimetype == "video/mp4" || video.mimetype == "video/mkv" || video.mimetype == "video/3gp") {

                    video.mv('views/sellerPanel/img/productImg/' + video_name, function (err) {
                        if (err)
                            return res.status(500).send(err);
                        addData();

                    })
                }
            } else {
                addData()
            }

            function addData() {
                var file = req.files.uploaded_image;
                if (!Array.isArray(file)) {
                    file = [file];
                }

                if (!Array.isArray(file)) {
                    file = [file];
                }

                function addImg(file, i, done) {
                    var img_namess = Date.now() + '_' + file[i].name
                    var img_name = img_namess.trim()

                    if (file[i].mimetype == "image/JPEG" || file[i].mimetype == "image/jpeg" || file[i].mimetype == "image/png" || file[i].mimetype == "image/PNG" || file[i].mimetype == "image/jpg") {

                        file[i].mv('views/sellerPanel/img/productImg/' + img_name, function (err) {
                            if (err)
                                return res.status(500).send(err)
                        })
                        multiImg.push(img_name)
                        if (typeof file[++i] != 'undefined') {
                            addImg(file, i, done);
                        } else {
                            return done();
                        }

                    }
                }

                addImg(file, 0, (done) => {
                    insertdata = {
                        cate: objectId(data.category),
                        subcate: objectId(data.subcategory.split('/////')[0]),
                        petacate: objectId(data.petacategory),
                        resellerId: objectId(resellerId._id),
                        productName: data.productName,
                        price: data.price == '' ? 0 : parseInt(data.price),
                        stock: data.stock == '' ? 0 : parseInt(data.stock),
                        rating: data.rating == '' ? 0 : parseFloat(data.rating),
                        delevery: parseInt(data.delevery),
                        weight: parseFloat(data.weight),
                        description: data.description,
                        productImage: multiImg,
                        productVideo: video_name,
                        pAprove: 0,
                        soldCount: 0,
                        date: new Date()
                    }
                    db.collection('product').insertOne(insertdata, (err, myproduct) => {
                        if (!err) {
                            return res.redirect('/listing')
                        } else {
                            return res.redirect('/logout');
                        }
                    })
                })
            }

        })
    } else {
        return res.redirect('/logout');
    }
}

exports.getsubcategory = (req, res) => {
    sess = req.session;
    sess.active = 'listing'
    if (!objectId.isValid(req.params._id)) {
        return res.send({ error: true, data: [] });
    }
    db.collection('subcate').find({ cate: objectId(req.params._id) }).toArray((err, sucess) => {
        // console.log({ error: false, data: sucess })
        res.send({ error: false, data: sucess })
    })
}

exports.getpetacategory = (req, res) => {
    sess = req.session;
    sess.active = 'listing'
    if (!objectId.isValid(req.params._id)) {
        return res.send({ error: true, data: [] });
    }

    if (!objectId.isValid(req.params.cate)) {
        return res.send({ error: true, data: [] });
    }
    db.collection('petacate').find({ subcate: objectId(req.params._id), cate: objectId(req.params.cate) }).toArray((err, sucess) => {
        // console.log({ error: false, data: sucess })
        res.send({ error: false, data: sucess })
    })
}

exports.get_productList = (req, res) => {
    sess = req.session;
    sess.active = 'productlist'
    if (typeof sess.Mobile_no != 'undefined') {
        db.collection('reseller').findOne({ Mobile_no: sess.Mobile_no }, (e, results) => {
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
                    delivery: 1,
                    weight: 1,
                    productImage: 1,
                    productVideo: 1,
                    pAprove: 1,
                    soldCount: 1,
                    date: 1
                }
            },
            { $match: { resellerId: objectId(results._id) } },
            { $sort: { _id: -1 } },
            { $skip: skip },
            { $limit: perPage }
            ]
            db.collection('product').aggregate(aggrigate).toArray((e, myalldata) => {
                db.collection('product').countDocuments({ resellerId: objectId(results._id) }, (er, userCount) => {
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
                                return sellerModel.responseData('sellerPanel/productlist.html', data, res)
                            })
                        })
                    })
                })
            })
        })
    } else {
        res.redirect('/login')
    }
}

exports.post_productList = (req, res) => {
    sess = req.session
    sess.active = 'productlist'
    if (typeof sess.Mobile_no != 'undefined') {
        db.collection('reseller').findOne({ Mobile_no: sess.Mobile_no }, (e, myseller) => {
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
                    if (myseller._id) {
                        wh['resellerId'] = objectId(myseller._id)
                    }

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
                            delivery: 1,
                            weight: 1,
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
                                        return sellerModel.responseData('sellerPanel/productlist.html', data, res)
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
        })
    } else {
        return res.redirect('/login')
    }
}

exports.getproductdeltail = (req, res) => {
    sess = req.session;
    sess.active = 'orderlist'
    if (typeof sess.Mobile_no != 'undefined') {
        db.collection('product').findOne({ _id: objectId(req.body._id) }, (e, mydata) => {
            if (!e) {
                if (mydata) {
                    db.collection('cate').findOne({ _id: objectId(mydata.cate) }, (er, mycatename) => {
                        if (!er) {
                            db.collection('subcate').findOne({ _id: objectId(mydata.subcate) }, (err, mysubcatename) => {
                                if (!err) {
                                    db.collection('petacate').findOne({ _id: objectId(mydata.petacate) }, (errr, mypetacatename) => {
                                        if (!errr) {
                                            db.collection('subcate').find({ cate: objectId(mydata.cate) }).toArray((err1, myallsubcate) => {
                                                if (!err1) {
                                                    db.collection('petacate').find({ cate: objectId(mydata.cate), subcate: objectId(mydata.subcate) }).toArray((err2, myallpetacate) => {
                                                        if (!err2) {
                                                            for (var i = 0; i < mydata.length; i++) {
                                                                mydata[i].date = _date(mydata[i].date).format('DD/MM/YYYY h:mm:ss a')
                                                                mydata[i]['cateName'] = (mydata[i].cate.toString() == mycatename._id.toString()) ? mycatename.name : ''
                                                                mydata[i]['subcateName'] = (mydata[i].subcate.toString() == mysubcatename._id.toString()) ? mysubcatename.name : ''
                                                                mydata[i]['petacateName'] = (mydata[i].petacate.toString() == mypetacatename._id.toString()) ? mypetacatename.name : ''
                                                            }
                                                            var data = {
                                                                data: mydata,
                                                                subcate: myallsubcate,
                                                                petacate: myallpetacate
                                                            }
                                                            console.log(data)
                                                            return res.send({ error: 'N', msg: '', data })
                                                        } else {
                                                            return res.send({ error: 'Y', msg: 'Something Going Wroing.', data: '' })
                                                        }
                                                    })
                                                } else {
                                                    return res.send({ error: 'Y', msg: 'Something Going Wroing..', data: '' })
                                                }
                                            })
                                        } else {
                                            return res.send({ error: 'Y', msg: 'Something Going Wroing...', data: '' })
                                        }
                                    })
                                } else {
                                    return res.send({ error: 'Y', msg: 'Something Going Wroing....', data: '' })
                                }
                            })
                        } else {
                            return res.send({ error: 'Y', msg: 'Something Going Wroing.....', data: '' })
                        }
                    })
                } else {
                    return res.send({ error: 'Y', msg: 'Product not found', data: '' })
                }
            } else {
                return res.send({ error: 'Y', msg: 'Something Going Wroing......', data: '' })
            }
        })
    } else {
        return res.redirect('/login')
    }
}

exports.get_orderlist = (req, res) => {
    sess = req.session;
    sess.active = 'orderlist'
    if (typeof sess.Mobile_no != 'undefined') {
        db.collection('reseller').findOne({ Mobile_no: sess.Mobile_no }, (e, myseller) => {
            if (!e) {
                if (myseller) {
                    var perPage = 20;
                    var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
                    var skip = (perPage * page) - perPage;
                    db.collection('order').find({ resellerId: objectId(myseller._id) }).sort({_id: -1}).limit(perPage).skip(skip).toArray((er, myorder) => {
                        if (!er) {
                            db.collection('order').countDocuments({ resellerId: objectId(myseller._id) }, (err, userCount) => {
                                if (!err) {
                                    for (var i = 0; i < myorder.length; i++) {
                                        myorder[i].date = _date(myorder[i].date).format('DD/MM/YYYY h:mm:ss a')
                                    }
                                    var data = {
                                        data: myorder
                                    }
                                    data['totaluser'] = userCount
                                    data['search'] = {}
                                    data['current'] = page
                                    data['pages'] = Math.ceil(userCount / perPage)
                                    console.log(data)
                                    return sellerModel.responseData('sellerPanel/orderlist.html', data, res)
                                } else {
                                    return res.send({ error: 'Y', msg: 'Something Going Wroing......', data: '' })
                                }
                            })
                        } else {
                            return res.send({ error: 'Y', msg: 'Something Going Wroing......', data: '' })
                        }
                    })
                } else {
                    return res.send({ error: 'Y', msg: 'reseller not found', data: '' })
                }
            } else {
                return res.send({ error: 'Y', msg: 'Something Going Wroing......', data: '' })
            }
        })
    } else {
        return res.redirect('/login')
    }
}

exports.post_orderlist = (req, res) => {
    sess = req.session
    if (typeof sess.Mobile_no != 'undefined') {
        db.collection('reseller').findOne({ Mobile_no: sess.Mobile_no }, (e, myseller) => {
            if (!e) {
                if (myseller) {
                    console.log(req.body)
                    var perPage = 20;
                    var page = (typeof req.params.page != 'undefined') ? (req.params.page == 0) ? 1 : req.params.page || 1 : 1;
                    var skip = (perPage * page) - perPage;

                    var wh = {};
                    if (req.body.by == 'buyernumber') {
                        wh['buyerNumber'] = (req.body.search).replace(/\s/g, '');
                    }
                    if (req.body.by == 'orderid') {
                        wh['orderId'] = req.body.search
                    }
                    if (req.body.by == 'pid') {
                        wh['products'] = { $elemMatch: { pid: objectId(req.body.search) } }
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
                    if (myseller._id) {
                        wh['resellerId'] = objectId(myseller._id)
                    }
                    db.collection('order').find(wh).sort({_id: -1}).limit(perPage).skip(skip).toArray((er, myorder) => {
                        if (!er) {
                            db.collection('order').countDocuments(wh, (err, userCount) => {
                                if (!err) {
                                    for (var i = 0; i < myorder.length; i++) {
                                        myorder[i].date = _date(myorder[i].date).format('DD/MM/YYYY h:mm:ss a')
                                    }
                                    var data = {
                                        data: myorder
                                    }
                                    data['totaluser'] = userCount
                                    data['search'] = req.body
                                    data['current'] = page
                                    data['pages'] = Math.ceil(userCount / perPage)
                                    return sellerModel.responseData('sellerPanel/orderlist.html', data, res)
                                } else {
                                    return res.send({ error: 'Y', msg: 'Something Going Wroing......', data: '' })
                                }
                            })
                        } else {
                            return res.send({ error: 'Y', msg: 'Something Going Wroing......', data: '' })
                        }
                    })
                } else {
                    return res.send({ error: 'Y', msg: 'reseller not found', data: '' })
                }
            } else {
                return res.send({ error: 'Y', msg: 'Something Going Wroing......', data: '' })
            }
        })
    } else {
        return res.redirect('/login')
    }
}

exports.orderAcceptBySeller = (req, res) => {
    sess = req.session;
    if (typeof sess.Mobile_no != 'undefined') {
        var data = req.query;
        console.log(data)
        var query = { orderId: data.orderid }
        db.collection('order').findOne(query, (e, mydata) => {
            if (!e) {
                if (mydata) {
                    var value = { $set: { orderStatusBySeller: 1 } }
                    if (data.status == '2') {
                        var value = { $set: { orderStatusBySeller: 2 } }
                    }
                    db.collection('order').updateOne(query, value, (er, ifsucess) => {
                        if (!e) {
                            return res.send({error: 'N', msg: 'success', data: 'success'})
                        } else {
                            return res.send({ error: 'Y', msg: 'Something Going Wroing......', data: '' })
                        }
                    })
                } else {
                    return res.send({ error: 'Y', msg: 'orderid not found', data: '' })
                }
            } else {
                return res.send({ error: 'Y', msg: 'Something Going Wroing......', data: '' })
            }
        })
    } else {
        return res.redirect('/login')
    }
}

exports.deletePesificImage = (req, res) => {
    sess = req.session;
    if (typeof sess.Mobile_no != 'undefined') {
        db.collection('reseller').findOne({ Mobile_no: sess.Mobile_no }, (e, myseller) => {
            if (!e) {
                if (myseller) {
                    db.collection('product').updateOne({ _id: objectId(req.query.pid) }, { $pull: { productImage: req.query.image } }, (req, result) => {
                        res.send({ error: 'N', msg: 'success' })
                    })
                } else {
                    return res.send({ error: 'Y', msg: 'reseller not found' })
                }
            } else {
                return res.send({ error: 'Y', msg: 'something going wrong' })
            }
        })
    } else {
        return res.redirect('/login')
    }
}

exports.editProductDetail = (req, res) => {
    sess = req.session;
    if (typeof sess.Mobile_no != 'undefined') {
        var data = req.body;
        var query = { _id: objectId(data._id) }
        console.log(req.body)
        db.collection('product').findOne(query, (err, result1) => {
            if (!err) {
                if (result1) {

                    var wh = {};
                    if (req.files) {
                        if (!Array.isArray(req.files.Pimage)) {
                            req.files.Pimage = [req.files.Pimage];
                          }
                        if (Array.isArray(req.files.Pimage)) {
                            var multiImg = [];
                            var file = req.files.Pimage;
                            if (!Array.isArray(file)) {
                              file = [file];
                            }
                            for (var i = 0; i < file.length; i++) {
                                var img_namess = Date.now() + '_' + file[i].name;
                                var img_name = img_namess.trim();
                                console.log(img_name)
                                if (file[i].mimetype == "image/jpeg" || file[i].mimetype == "image/png" || file[i].mimetype == "image/jpg" || file[i].mimetype == "image/PNG") {
                                    file[i].mv('views/sellerPanel/img/productImg/' + img_name, (err) => {
                                        if (err)
                                            return res.status(500).send(err);
                                    })
                                    var img_names = {
                                        img: img_name
                                    }
                                    multiImg.push(img_names)
                                }
                            }
                            var multipleImg = [];
                            for (var i = 0; i < multiImg.length; i++) {
                              multipleImg.push(multiImg[i].img)
                            }
                            wh['productImage'] = multipleImg
                        }
                        if (req.files.Pvideo) {
                            if (file.mimetype == "video/mp4" || file.mimetype == "video/mkv" || file.mimetype == "video/3gp") {
                                file.mv('views/sellerPanel/img/productImg/' + Pvideo, function (err) {
                                    if (err)
                                        return res.status(500).send(err);
                                    wh['productVideo'] = Pvideo
                                })
                            } else {
                                return res.send({ error: 'Y', msg: 'image type invalid', data: '' })
                            }
                        }
                    }
                    wh['cate'] = objectId(data.category)
                    wh['subcate'] = objectId(data.subcategory)
                    wh['petacate'] = objectId(data.petacategory)
                    wh['productName'] = data.name
                    wh['price'] = parseInt(data.price)
                    wh['stock'] = parseInt(data.stock)
                    wh['rating'] = parseFloat(data.rating)
                    wh['description'] = data.description
                    wh['pAprove'] = 0
                    wh['soldCount'] = 0
                    wh['last_update'] = new Date()

                    var value = { $set: wh }
                    console.log(wh, 'dasds')

                    db.collection('product').updateOne(query, value, (err, success) => {
                        try {
                            if (err) throw err
                            res.redirect('/productList/1')
                        } catch (error) {
                            res.send('database error')
                        }
                    })
                } else {
                    return res.send({ error: 'Y', msg: 'product not found', data: '' })
                }
            } else {
                return res.send({ error: 'Y', msg: 'something going wrong', data: '' })
            }
        })
    } else {
        res.redirect('/')
    }
}

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/');
    })
}