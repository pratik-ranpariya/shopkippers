var controller = module.exports = require('../controller/sellerHandler.js');

module.exports = {

    responseData: (file, data, res) => {
        data['BaseUrl'] = BaseUrl;
        data['active']  = typeof sess.active != 'undefined' ? sess.active : 'dashboard';
        data['cImgUrl'] = cImgUrl;
        data['pImgUrl'] = pImgUrl;
        res.render(file, data);
    },

    sellerApi: () => {

        //get api
        app.get('/',                           controller.loginpage)
        app.get('/login',                      controller.get_login)
        app.get('/register',                   controller.get_register)
        app.get('/dashboard',                  controller.dashboard)
        app.get('/bankDetail',                 controller.bankDetail)
        app.get('/listing',                    controller.listing)
        app.get('/getsubcategory/:_id',        controller.getsubcategory)
        app.get('/getpetacategory/:_id/:cate', controller.getpetacategory)
        app.get('/productList/:page',          controller.get_productList)
        app.get('/orderlist/:page',            controller.get_orderlist)
        app.get('/orderAcceptBySeller',        controller.orderAcceptBySeller)
        app.get('/deletePesificImage',         controller.deletePesificImage)
        app.get('/logout',                     controller.logout)

        //post api
        app.post('/login',                     controller.post_login)
        app.post('/register',                  controller.post_register)
        app.post('/BankDetailinsert',          controller.BankDetailinsert)
        app.post('/BusinessDetailinsert',      controller.BusinessDetailinsert)
        app.post('/documentDetailInsert',      controller.documentDetailInsert)
        app.post('/insertProduct',             controller.insertProduct)
        app.post('/productList/:page',         controller.post_productList)
        app.post('/getproductdeltail',         controller.getproductdeltail)
        app.post('/orderlist/:page',           controller.post_orderlist)
        app.post('/editProductDetail',         controller.editProductDetail)
        
        // var removetimes
        // app.post('/stopsms', (req, res) => {
        //     myTime()
        // })

        // var perPagesms;
        // var pagesms;
        // var skipsms = (perPagesms * pagesms) - perPagesms;

        // function callbeforeTime(req, res) {
        //     sess = req.session;
        //     sess.active = 'marketing';

        //     perPagesms = (typeof sess.smsPerPage != 'undefined') ? parseInt(sess.smsPerPage) : 10;
        //     pagesms = (typeof req.body.startpage != 'undefined') ? (req.body.startpage == 0) ? 1 : parseInt(req.body.startpage) || 1 : 1;
        //     removetimes = setInterval(() => {
        //         if (typeof sess.user != 'undefined') {

        //             var data2 = {
        //                 error: false
        //             }

        //             var data = {
        //                 error: false
        //             }

        //             db.collection('marketing').find({}).skip(skipsms).limit(perPagesms).toArray((err, smsNo) => {
        //                 db.collection('marketing').countDocuments((err, numCount) => {

        //                     var smsNumber = []
        //                     for (var i = 0; i < smsNo.length; i++) {
        //                         smsNumber.push(smsNo[i].mobileNo)
        //                     }

        //                     if (smsNo.length == 0) {
        //                         perPagesms = 1; pagesms = 1; skipsms = (perPagesms * pagesms) - perPagesms;
        //                         clearTimeout(removetimes)
        //                     }

        //                     if (pagesms == (typeof req.body.lastpage != 'undefined') ? parseInt(req.body.lastpage) : 1000000000000000) {
        //                         perPagesms = (typeof sess.smsPerPage != 'undefined') ? parseInt(sess.smsPerPage) : 10;
        //                         pagesms = (typeof req.body.startpage != 'undefined') ? (req.body.startpage == 0) ? 1 : parseInt(req.body.startpage) || 1 : 1;
        //                         clearTimeout(removetimes)
        //                     }

        //                     link = `http://198.15.103.106/API/pushsms.aspx?loginID=ssvltech1&password=123456&mobile=${smsNumber}&text=${req.body.text}&senderid=SSVLTE&route_id=1&Unicode=0`
        //                     _req({
        //                         "url": link,
        //                         "json": true,
        //                         "method": "get"
        //                     }, (err, httpResponse, body) => {
        //                         return
        //                     })

        //                     pagesms = pagesms + 1;
        //                     skipsms = (perPagesms * pagesms) - perPagesms;
        //                 })
        //             })
        //         } else {
        //             return res.render('/')
        //         }
        //     }, parseInt(req.body.second) * 1000)
        // }

        // app.post('/autoSMS', (req, res) => {
        //     callbeforeTime(req, res)
        //     return res.redirect('/marketing')
        // })

        // var perPagesms;
        // var pagesms;
        // var skipsms;

        // function callbeforeTime(req, res) {
        //     sess = req.session;
        //     sess.active = 'marketing';

        //     perPagesms = (typeof sess.smsPerPage != 'undefined') ? parseInt(sess.smsPerPage) : 10;
        //     pagesms = (typeof req.body.startpage != 'undefined') ? (req.body.startpage == 0) ? 1 : parseInt(req.body.startpage) || 1 : 1;
        //     skipsms = (perPagesms * pagesms) - perPagesms;
            
        //     removetimes = setInterval(() => {
        //         if (typeof sess.user != 'undefined') {
                    
        //             db.collection('marketing').find({}).skip(skipsms).limit(perPagesms).toArray((err, smsNo) => {
        //                 db.collection('marketing').countDocuments((err, numCount) => {
        //                     var smsNumber = []
        //                     for (var i = 0; i < smsNo.length; i++) {
        //                         smsNumber.push(smsNo[i].mobileNo)
        //                     }
        //                     if (smsNo.length == 0) {
        //                         perPagesms = (typeof sess.smsPerPage != 'undefined') ? parseInt(sess.smsPerPage) : 10;
        //                         pagesms = (typeof req.body.startpage != 'undefined') ? (req.body.startpage == 0) ? 1 : parseInt(req.body.startpage) || 1 : 1;
        //                         return clearTimeout(removetimes)
        //                     }
        //                     if(((typeof req.body.lastpage != 'undefined') ? parseInt(req.body.lastpage) : 10000000000000000) == pagesms) {
        //                         perPagesms = (typeof sess.smsPerPage != 'undefined') ? parseInt(sess.smsPerPage) : 10;
        //                         pagesms = (typeof req.body.startpage != 'undefined') ? (req.body.startpage == 0) ? 1 : parseInt(req.body.startpage) || 1 : 1;
        //                         clearTimeout(removetimes)
        //                     }
        //                     link = `http://198.15.103.106/API/pushsms.aspx?loginID=ssvltech1&password=123456&mobile=${smsNumber}&text=${req.body.text}&senderid=SSVLTE&route_id=1&Unicode=0`
        //                     _req({
        //                         "url": link,
        //                         "json": true,
        //                         "method": "get"
        //                     }, (err, httpResponse, body) => {
        //                         console.log(link)
        //                         pagesms = pagesms + 1;
        //                         skipsms = (perPagesms * pagesms) - perPagesms;
        //                         return
        //                     })

        //                 })
        //             })
        //         } else {
        //             return res.render('/')
        //         }
        //     }, parseInt(req.body.second) * 1000)
        // }

        // function callbeforeTime(req, res) {
        //     sess = req.session;
        //     sess.active = 'marketing';

        //     var perPage = (typeof sess.smsPerPage != 'undefined') ? parseInt(sess.smsPerPage) : 2;
        //     var page = (typeof req.body.page != 'undefined') ? (req.body.page == 0) ? 1 : parseInt(req.body.page) || 1 : 1;
        //     var skip = (perPage * page) - perPage;
        //     removetimes = setInterval(() => {
        //         // if (typeof sess.user != 'undefined') {
        //             console.log(skip, perPage)
        //             db.collection('cate').find({}).skip(skip).limit(perPage).toArray((err, smsNo) => {
        //                 db.collection('cate').countDocuments((err, numCount) => {

        //                     var smsNumber = []
        //                     for (var i = 0; i < smsNo.length; i++) {
        //                         smsNumber.push(smsNo[i].name)
        //                     }
        //                     console.log(smsNumber)

        //                     if (smsNo.length == 0) {
        //                         console.log('s')
        //                         clearTimeout(removetimes)
        //                     }

        //                     // console.log(smsNo)

        //                     link = `http://198.15.103.106/API/pushsms.aspx?loginID=ssvltech1&password=123456&mobile=${smsNumber}&text=${req.body.text}&senderid=SSVLTE&route_id=1&Unicode=0`
        //                     link = 'pratik'
        //                     _req({
        //                         "url": link,
        //                         "json": true,
        //                         "method": "get"
        //                     }, (err, httpResponse, body) => {
        //                         return
        //                     })

        //                     page = page + 1;
        //                     skip = (perPage * page) - perPage;
        //                 })
        //             })
        //         // } else {
        //         //     return res.render('/')
        //         // }
        //     }, parseInt(req.body.second)*1000)
        // }

        // app.post('/autoSMS', (req, res) => {
        //     callbeforeTime(req, res)
        //     return res.send({error: 'N'})
        //     // return res.redirect('/marketing')
        // })

        // function stopLiveSMS() {
        //     clearTimeout(removetimes)
        // }

        // app.post('/stopSMS', (req, res) => {
        //     stopLiveSMS()
        //     var smsstoppages = {
        //         page: pagesms,
        //         skip: skipsms
        //     }
        //     responseData('marketing.html', {
        //         data1: '',
        //         data: '',
        //         msgs: '',
        //         msg: '',
        //         msg3: '',
        //         smsdata: smsstoppages
        //     }, res)
        //     perPagesms = 1; pagesms = 1; skipsms = (perPagesms * pagesms) - perPagesms;
        // })

    }

}