const express = require('express');
const router = express.Router();
const GetController = require('../controllers/GetController');
const PostController = require('../controllers/PostController');
const passport = require('passport');
const Local = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const {
    Op,
    where
} = require('sequelize');
const {
    User,
    Product,
    Card,
    Product_photo,
    Liked_product,
    sequelize
} = require('../model/db');
const len = 10
let arr = []
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/photo/')
    },
    filename: function (req, file, cb) {
        let picName = Date.now() + '-' + file.originalname
        req.session.picUrl = picName
        arr.push(picName)

        cb(null, picName)
    }
})
const upload = multer({
    storage: storage
})



function isLogined(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
};

function isLoginAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role == 1) {
        return next()
    }
    res.redirect('/login')
}

function isLoginUser(req, res, next) {
    if (req.isAuthenticated() && req.user.role == 0) {
        return next()
    }
    res.redirect('/login')
}


//GET query
router.get('/', GetController.home);
router.get('/login', GetController.log)
router.get('/register', GetController.register);
router.get('/admin/home', isLoginAdmin, GetController.admin);
router.get('/admin/users', isLoginAdmin, GetController.adminUsers);
router.get('/admin/product', isLoginAdmin, GetController.adminProduct)
router.get('/logout', isLogined, GetController.logout);
router.get('/search', isLogined, GetController.search)
router.get('/profile/home', isLoginUser, GetController.homeAllProducts);
router.get('/profile/users', isLoginUser, GetController.seeAllUsers);
router.get('/showUs', isLogined, GetController.showUs);
router.get('/profile/myProduct', isLoginUser, GetController.getMyProduct);
router.get('/profile/friendRequest', isLoginUser, GetController.getMyRequest)
router.get('/profile/myFriends', isLoginUser, GetController.getMyFriends)
router.get('/profile/myCard', isLoginUser, GetController.myCard);
router.get('/user_photos',isLogined,GetController.seeAllPhotos);
router.get('/aboutProduct',isLoginUser,GetController.aboutProduct);
router.get('/profile/Favorite',isLoginUser,GetController.myFavorite)



//POST query
router.post('/addNewUser', isLogined, PostController.addNewUser);
router.post('/searchUs', isLogined, PostController.searchUs)
router.post('/addNewProduct', isLoginUser, upload.array("picUrl"), async (req, res) => {
    let prod = await Product.create({
        ...req.body,
        userId: req.session.usId,
        status: 0
    })
    if(!arr.length){
        arr=['pr.png']
        for (let i of arr) {
            await Product_photo.create({
                productId: prod.id,
                picUrl: i
            })
        }
    }else{
        for (let i of arr) {
            await Product_photo.create({
                productId: prod.id,
                picUrl: i
            })
        }
    }
    
    arr = [];
    res.redirect('/profile/myProduct')
});
router.post('/addToCard', isLogined, PostController.addToCard);
router.post('/removeFromCard', isLoginUser, PostController.removeFromCard);
router.post('/addFriend', isLoginUser, PostController.addFriend);
router.post('/cancelRequest', isLoginUser, PostController.cancelRequest);
router.post('/acceptFriend', isLoginUser, PostController.acceptFriend);
router.post('/rejectFriend', isLoginUser, PostController.rejectFriend);
router.post('/deleteFriend', isLoginUser, PostController.deleteFriend);
router.post('/approve', isLoginAdmin, PostController.approveProd);
router.post('/reject', isLoginAdmin, PostController.rejectProd);
router.post('/uploadPicUrl', upload.single('picUrl'), isLogined, PostController.uploadPicUrl)
router.post('/addNewPhoto',upload.single('picUrl'),isLoginUser,PostController.addNewPhoto);
router.post('/uploadAdminPicUrl',upload.single('picUrl'),isLoginAdmin,PostController.uploadAdminPicUrl);
router.post('/plus',isLoginUser, PostController.plusProd)
router.post('/minus',isLoginUser, PostController.minusProd)
router.post('/setMain',isLoginUser,PostController.setMain);
router.post('/deletePhoto',isLoginUser,PostController.deletePhoto);
router.post('/addToFavorite',isLoginUser,PostController.addToFavorite);
router.post('/removeFromFavorite',isLoginUser,PostController.removeFromFavorite)



router.post('/loginUs',
    passport.authenticate("local", {
        failureRedirect: '/'
    }), (req, res) => {
        let comp = bcrypt.compareSync(req.body.password, req.user.password)
        if (comp) {
            req.session.usId = req.user.dataValues.id
            if (req.user.role == 0) {
                res.redirect('/profile/home')
            } else {
                res.redirect('/admin/home')

            }
        } else {
            res.redirect('/')
        }
    });

passport.use("local", new Local(
    async function (username, password, done) {
        let user = await User.findOne({
            where: {
                email: username,
            }
        })
        if (user) {
            done(null, user)
        } else {
            done(null, false)
        }
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
    let us = await User.findOne({
        where: {
            id: id
        }
    })
    done(null, us);
});

module.exports = router