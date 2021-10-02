var controller = module.exports = require('../controller/adminHandler.js');

module.exports = {

    responseData: (file, data, res) => {
        data['BaseUrl'] = BaseUrl;
        data['active']  = typeof sess.active != 'undefined' ? sess.active : 'dashboard';
        data['cImgUrl'] = cImgUrl;
        data['pImgUrl'] = pImgUrl;
        data['bImgUrl'] = bImgUrl;
        res.render(file, data);
    },

    adminApi: () => {

        //get api
        app.get('/',                               controller.loginpage)
        app.get('/login',                          controller.get_login)
        app.get('/register',                       controller.get_register)
        app.get('/dashboard',                      controller.dashboard)
        app.get('/productList/:page',              controller.get_productList)
        app.get('/bankdetailverify_list/:page',    controller.bankdetailverify_list)
        app.get('/businessdetailverify_list/:page',controller.businessdetailverify_list)
        app.get('/DocumentImage_list/:page',       controller.DocumentImage_list)
        app.get('/bannerAndDelevery',              controller.bannerAndDelevery)
        app.get('/deleteBanner',                   controller.deleteBanner)
        app.get('/deleteDelevery',                 controller.deleteDelevery)
        app.get('/buyerList/:page',                controller.buyerList_get)
        app.get('/resellerList/:page',             controller.resellerList_get)
        app.get('/category',                       controller.category)
        app.get('/getsubcategory/:_id',            controller.getsubcategory)
        app.get('/getpetacategory/:_id/:cate',     controller.getpetacategory)
        app.get('/logout',                         controller.logout)


        // post api
        app.post('/login',                         controller.post_login)
        app.post('/productList/:page',             controller.post_productList)
        app.post('/ApporveProduct/:_id',           controller.ApporveProduct)
        app.post('/RejectProduct/:_id',            controller.RejectProduct)
        app.post('/ApporveBankDetail/:_id',        controller.ApporveBankDetail)
        app.post('/RejectBankDetail/:_id',         controller.RejectBankDetail)
        app.post('/ApporveBusinessDetail/:_id',    controller.ApporveBusinessDetail)
        app.post('/RejectBusinessDetail/:_id',     controller.RejectBusinessDetail)
        app.post('/ApporveDocumentImage/:_id',     controller.ApporveDocumentImage)
        app.post('/RejectDocumentImage/:_id',      controller.RejectDocumentImage)
        app.post('/buyerList/:page',               controller.buyerList_post)
        app.post('/resellerList/:page',            controller.resellerList_post)
        app.post('/insertDeleveryCharges',         controller.insertDeleveryCharges)
        app.post('/uploadBanner',                  controller.uploadBanner)
        // app.post('/insertimage',                   controller.insertimage)
        app.post('/addcategory',                   controller.addcategory)
        app.post('/addsubcategory',                controller.addsubcategory)
        app.post('/addpetacategory',               controller.addpetacategory)
    }

}