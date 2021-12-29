const {
    Model,
    DataTypes,
    Sequelize,
    TINYINT
} = require('sequelize');


const sequelize = new Sequelize('nodeproject', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3307
});

class User extends Model {};
class Category extends Model {};
class Product extends Model {};
class Card extends Model {};
class Friend extends Model {};
class Product_photo extends Model {};
class User_photo extends Model {};
class Liked_product extends Model {};

//User table
User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    age: DataTypes.INTEGER,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    picUrl: {
        type: DataTypes.STRING,
        defaultValue: '1.png',
    }
}, {
    modelName: 'user',
    sequelize
});
User.sync();


//User Photo table
User_photo.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    picUrl: DataTypes.STRING
}, {
    modelName: 'user_photo',
    sequelize
});
User_photo.belongsTo(User);
User.hasMany(User_photo);
User_photo.sync();




//Category Table
Category.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: DataTypes.STRING
}, {
    modelName: 'category',
    sequelize
});
Category.sync()



//Product table
//status 0(pending), 1(approved), 2(need Edit),
Product.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    count: DataTypes.INTEGER,
    status: TINYINT
}, {
    modelName: 'product',
    sequelize
});
Product.belongsTo(User);
Product.belongsTo(Category);
Category.hasMany(Product)
User.hasMany(Product);
Product.sync();


//Prod_img table
Product_photo.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    picUrl: {
        type: DataTypes.STRING,
    }
}, {
    modelName: 'product_photo',
    sequelize
})
Product_photo.belongsTo(Product);
Product.hasMany(Product_photo)
Product_photo.sync()


//Card table
Card.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    modelName: 'card',
    sequelize
});
Card.belongsTo(User);
Card.belongsTo(Product);
Product.hasMany(Card);
User.hasMany(Card);
Card.sync();


//Friend table
//status 0(requested), 1(accepted), 2(rejected) 
Friend.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status: DataTypes.TINYINT,
}, {
    modelName: 'friend',
    sequelize
})
Friend.belongsTo(User, {
    foreignKey: "fromId",
    targetKey: "id",
});
Friend.belongsTo(User, {
    foreignKey: "toId",
    targetKey: "id"
});
User.hasMany(Friend, {
    foreignKey: "fromId",
    targetKey: "id"
});
User.hasMany(Friend, {
    foreignKey: "toId",
    targetKey: "id"
});
Friend.sync();




//Liked_product table
Liked_product.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
},{
    modelName:'liked_product',
    sequelize
})
Liked_product.belongsTo(Product)
Liked_product.belongsTo(User)
User.hasMany(Liked_product)
Product.hasMany(Liked_product)
Liked_product.sync()





module.exports = {
    User,
    Category,
    Product,
    Card,
    Friend,
    Product_photo,
    User_photo,
    Liked_product,
    sequelize
};