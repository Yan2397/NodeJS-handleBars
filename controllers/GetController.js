const {
    Op
} = require('sequelize');
const {
    User,
    Category,
    Product,
    Card,
    sequelize,
    Friend,
    Product_photo,
    User_photo,
    Liked_product
} = require('../model/db');


class GetController {

    register(req, res) {
        res.render('register')
    }

    log(req, res) {
        res.render('login')
    }

    async home(req, res) {
        let prod = await Product.findAll({
            include: [Product_photo]
        })

        let temp = []
        for (let i = 0; i < prod.length; i++) {
            temp.push(prod[i].dataValues)
        }
        res.render('allProduct', {
            temp
        })
    }

    async search(req, res) {
        let temp = await req.session.search
        const user = await User.findOne({
            where: {
                id: req.session.usId
            }
        })
        const us = await user.dataValues
        res.render('searchResult', {
            temp,
            us
        })
    }

    async profile(req, res) {
        const x = await req.user.dataValues
        res.render('profile', {
            x
        })
    }

    async admin(req, res) {
        const x = await req.user.dataValues.role==1?{...req.user.dataValues,picUrl:'a.png'}:req.user.dataValues
        const prod = await Product.findAll({
            where: {
                status: 1
            },
            include: Product_photo
        })
        let temp = []
        for (let i = 0; i < prod.length; i++) {
            temp.push(prod[i].dataValues)
        }
        res.render('adminHome', {
            x,
            temp
        })
    }

    async adminUsers(req, res) {
        const x = await req.user.dataValues.role==1?{...req.user.dataValues,picUrl:'a.png'}:req.user.dataValues
        const us = await User.findAll({
            where: {
                role: 0
            }
        })
        let temp = []
        for (let i = 0; i < us.length; i++) {
            temp.push(us[i].dataValues)
        }
        res.render('adminUsers', {
            temp,
            x
        })
    }

    async adminProduct(req, res) {
        const x = await req.user.dataValues.role==1?{...req.user.dataValues,picUrl:'a.png'}:req.user.dataValues
        const usProd1 = await Product.findAll({
            where: {
                status: 0
            },
            include: Product_photo
        });
        const usProd = []
        for (let i = 0; i < usProd1.length; i++) {
            usProd.push(usProd1[i].dataValues)
        }

        res.render('adminProduct', {
            usProd,
            x
        })
    }

    async homeAllProducts(req, res) {
        const x = await req.user.dataValues
        const prod1 = await Product.findAll({
            include: [Product_photo, {
                model: Liked_product,
                where: {
                    userId: req.user.id
                }
            }]
        })

        const prod = await Product.findAll({
            include: [Product_photo]
        })

        let temp = []
        for (let i = 0; i < prod.length; i++) {
            temp.push(prod[i].dataValues)
        }

        for (let i = 0; i < prod1.length; i++) {
            temp = temp.map(e => e.id == prod1[i].dataValues.id ? {
                ...e,
                liked: true
            } : e)
        }
        console.log("**************temp", temp)

        res.render('profileHome', {
            temp,
            x
        })
    }

    async getMyProduct(req, res) {
        const x = await req.user.dataValues
        const categs = await Category.findAll()
        const cats = []
        for (let i = 0; i < categs.length; i++) {
            cats.push(categs[i].dataValues)
        }

        const usProd1 = await Product.findAll({
            where: {
                userId: req.session.usId
            },
            include: Product_photo
        });

        const usProd = []
        for (let i = 0; i < usProd1.length; i++) {
            usProd.unshift({
                ...usProd1[i].dataValues,
                style: usProd1[i].dataValues.status == 0 ? 'Pending' : usProd1[i].dataValues.status == 1 ? 'Approved' : 'Edit'
            })
        }
        res.render('profileProduct', {
            x,
            usProd,
            cats,
        })
    }

    async getMyRequest(req, res) {
        const x = await req.user.dataValues
        const reqs = await Friend.findAll({
            where: {
                toId: req.session.usId,
                status: 0
            },
            include: User
        })
        let temp = []
        for (let i = 0; i < reqs.length; i++) {
            let e = reqs[i].dataValues.fromId
            let x = await User.findOne({
                where: {
                    id: e
                }
            })
            temp.push(x.dataValues)
        }
        res.render('profileRequest', {
            x,
            temp
        })
    }

    async getMyFriends(req, res) {
        const x = await req.user.dataValues
        const frList = await Friend.findAll({
            where: {
                status: 1,
                [Op.or]: [{
                        fromId: req.session.usId
                    },
                    {
                        toId: req.session.usId
                    }
                ]
            },
            include: User
        })
        let temp = []
        for (let i = 0; i < frList.length; i++) {
            let e = frList[i].dataValues;
            let x = req.session.usId == e.toId ? e.fromId : e.toId
            let usResult = await User.findOne({
                where: {
                    id: x
                }
            })
            await temp.push(usResult.dataValues)
        }
        res.render('profileFriends', {
            x,
            temp
        })
    }

    async myCard(req, res) {
        let total = 0
        let x = req.user.dataValues
        const card = await Card.findAll({
            include: [Product],
            where: {
                userId: req.session.usId
            }
        });
        for (let i = 0; i < card.length; i++) {
            let y = card[i].dataValues.product.dataValues
            total+=y.price*card[i].dataValues.quantity
        }
        console.log(total)
        res.render('profileCard', {
            x,
            card,
            total
        })
    }


    async seeAllUsers(req, res) {
        const allUser = await User.findAll({
            where: {
                role: 0
            }
        })
        const t = []
        for (let i = 0; i < allUser.length; i++) {
            if (allUser[i].dataValues.id == req.session.usId) {
                allUser.splice(i, 1)
            }
            t.push(allUser[i].dataValues)
        }
        const users = []
        for (let e in t) {
            let myFr = await Friend.findOne({
                where: {
                    status: 0,
                    fromId: t[e].id,
                    toId: req.user.dataValues.id
                }
            })

            let myReq = await Friend.findOne({
                where: {
                    status: 0,
                    toId: t[e].id,
                    fromId: req.user.dataValues.id
                }
            })

            let fr = await Friend.findOne({
                where: {
                    status: 1,
                    [Op.or]: [{
                            fromId: t[e].id,
                            toId: req.user.dataValues.id
                        },
                        {
                            toId: t[e].id,
                            fromId: req.user.dataValues.id
                        },
                    ]
                }
            })


            if (myFr) {
                users.push({
                    ...t[e],
                    myFr: true
                })
            } else if (myReq) {
                users.push({
                    ...t[e],
                    myReq: true
                })

            } else if (fr) {
                users.push({
                    ...t[e],
                    fr: true
                })

            } else {
                users.push({
                    ...t[e]
                })
            }
        }
        res.render('profileUsers', {
            temp: users,
            x: req.user.dataValues
        })
    }

    async showUs(req, res) {
        const x = await req.user.dataValues
        const us = await User.findOne({
            where: {
                id: req.query.id
            },
            include: User_photo
        });
        const user = us.dataValues;
        res.render('showUs', {
            x,
            user
        })
    }

    async seeAllPhotos(req, res) {
        const x = await req.user.dataValues
        const usPhotos = await User_photo.findAll({
            where: {
                userId: req.session.usId
            }
        })
        let pics = []

        for (let i = 0; i < usPhotos.length; i++) {
            pics.unshift(usPhotos[i].dataValues)
        }

        res.render('profilePhoto', {
            x,
            pics
        })
    }

    async aboutProduct(req, res) {
        const prodInfo = await Product.findOne({
            where: {
                id: req.query.id
            }
        })
        const prod = await prodInfo.dataValues

        const pics = await Product_photo.findAll({
            where: {
                productId: req.query.id
            }
        })
        const prodPhotos = []
        for (let i = 0; i < pics.length; i++) {
            prodPhotos.push(pics[i].dataValues)
        }

        res.render('productInfo', {
            prod,
            prodPhotos
        })
    }

    async myFavorite(req, res) {
        const x = await req.user.dataValues
        const pr = await Liked_product.findAll({
            where: {
                userId: req.user.id
            },
            include: [{
                model: Product,
                include: [Product_photo]
            }]
        })
        const temp = []
        for (let e in pr) {
            temp.push(pr[e].dataValues)
        }
        res.render('profileFavorite', {
            x,
            temp
        })
    }

    logout(req, res) {
        req.logout
        res.redirect('/')
    }

}

module.exports = new GetController