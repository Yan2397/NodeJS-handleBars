const {
    Op
} = require('sequelize')
const {
    User,
    Product,
    Card,
    sequelize,
    Friend,
    Category,
    User_photo,
    Liked_product,
} = require('../model/db');
const bcrypt = require('bcrypt')
const len = 10

class PostController {

    async addNewUser(req, res) {
        await User.findAll({
            where: {
                email: req.body.email
            }
        }).then(r => {
            if (r.length > 0) {
                console.log('This Username Already registered!!!')
            } else {
                User.create({
                    ...req.body,
                    password: bcrypt.hashSync(req.body.password, len)
                })
            }
        })

        res.redirect('/')
    }

    async searchUs(req, res) {
        const searchResult = await User.findAll({
            where: {
                name: req.body.name
            }
        });
        const temp = []
        for (let i = 0; i < searchResult.length; i++) {
            temp.push(searchResult[i].dataValues)
        }
        req.session.search = await temp
        res.redirect('/search')
    }

    async addToCard(req, res) {
        await Card.findOne({
            where: {
                userId: req.session.usId,
                productId: req.query.id
            }
        }).then(r => {
            if (r == null) {
                Card.create({
                    userId: req.session.usId,
                    productId: req.query.id
                })
                res.redirect('/profile/home')
            } else {
                res.redirect('/profile/myCard')
            }
        })
    }

    removeFromCard(req, res) {
        console.log(req.query)
        console.log(req.session.usId)
        Card.destroy({
            where: {
                userId: req.session.usId,
                productId: req.query.id
            }
        })
        res.redirect('/profile/myCard')
    }

    async addFriend(req, res) {
        const obj = await {
            fromId: req.session.usId,
            toId: req.query.id
        };
        const x = await Friend.findAll({
            where: {
                [Op.or]: [{
                    fromId: req.session.usId,
                    toId: req.query.id
                }, {
                    toId: req.session.usId,
                    fromId: req.query.id
                }]
            }
        })
        if (!x.length) {
            Friend.create({
                ...obj,
                status: 0
            })
        }
        res.redirect('/profile/users')
    }

    cancelRequest(req, res) {
        Friend.destroy({
            where: {
                fromId: req.session.usId,
                toId: req.query.id
            }
        })
        res.redirect('/profile/users')
    }

    acceptFriend(req, res) {
        Friend.update({
            status: 1
        }, {
            where: {
                fromId: req.query.id,
                toId: req.session.usId
            }
        })
        res.redirect('/profile/friendRequest')
    }


    rejectFriend(req, res) {
        Friend.update({
            status: 2
        }, {
            where: {
                fromId: req.query.id,
                toId: req.session.usId
            }
        })
        res.redirect('/profile/friendRequest')
    }

    deleteFriend(req, res) {
        Friend.destroy({
            where: {
                [Op.or]: [{
                    fromId: req.query.id,
                    toId: req.session.usId
                }, {
                    fromId: req.session.usId,
                    toId: req.query.id
                }]
            }
        });
        res.redirect('/profile/myFriends')
    }

    approveProd(req, res) {
        Product.update({
            status: 1
        }, {
            where: {
                id: req.query.id
            }
        })
        res.redirect('/admin/product')
    }

    rejectProd(req, res) {
        Product.update({
            status: 2
        }, {
            where: {
                id: req.query.id
            }
        });
        res.redirect('/admin/product')

    }

    uploadPicUrl(req, res) {
        console.log(req.body)
        User.update({
            picUrl: req.session.picUrl
        }, {
            where: {
                id: req.session.usId
            }
        })
        res.redirect('/profile/home')
    }

    uploadAdminPicUrl(req, res) {
        User.update({
            picUrl: req.session.picUrl
        }, {
            where: {
                id: req.session.usId
            }
        })
        res.redirect('/admin/home')
    }

    addNewPhoto(req, res) {
        console.log('req,user=>', req.session.usId)
        User_photo.create({
            picUrl: req.session.picUrl,
            userId: req.session.usId
        })
        res.redirect('/user_photos')
    }

    setMain(req, res) {
        User.update({
            picUrl: req.query.url
        }, {
            where: {
                id: req.session.usId
            }
        })
        res.redirect('/user_photos')
    }

    deletePhoto(req, res) {
        User_photo.destroy({
            where: {
                id: req.query.id
            }
        })
        res.redirect('/user_photos')
    }

    async plusProd(req, res) {
        await Card.findOne({
            where: {
                id: req.query.id
            },
            include: Product
        }).then(r => {
            if (r.dataValues.product.dataValues.count > r.dataValues.quantity) {
                Card.update({
                    quantity: r.dataValues.quantity + 1
                }, {
                    where: {
                        id: req.query.id
                    }
                })
            }


        })
        res.redirect('/profile/myCard')
    }

    async minusProd(req, res) {
        await Card.findOne({
            where: {
                id: req.query.id
            },
            include: Product
        }).then(r => {
            if (r.dataValues.quantity < 2) {
                Card.destroy({
                    where: {
                        id: req.query.id
                    }
                })
            } else {
                Card.update({
                    quantity: r.dataValues.quantity - 1
                }, {
                    where: {
                        id: req.query.id
                    }
                })
            }
        })
        res.redirect('/profile/myCard')
    }


    async addToFavorite(req, res) {
        await Liked_product.findAll({
            where: {
                userId: req.session.usId,
                productId: req.query.id
            }
        }).then(r => {
            if (!r.length) {
                Liked_product.create({
                    userId: req.session.usId,
                    productId: req.query.id
                })
            } else {
                console.log('prodict already  exist')
            }
        })
        res.redirect('/profile/home')
    }


    removeFromFavorite(req, res) {
        console.log('mtaaa')
        console.log('queri',req.query.id)
        Liked_product.destroy({
            where: {
                userId: req.session.usId,
                productId: req.query.id
            }
        })
        res.redirect('/profile/home')
    }

}

module.exports = new PostController