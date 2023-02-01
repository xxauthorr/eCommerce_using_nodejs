var db = require('../config/connection')
var bcrypt = require('bcrypt');
const { decorators } = require('handlebars');
const async = require('hbs/lib/async');
const { promise, use } = require('bcrypt/promises');
const objectId = require('mongodb').ObjectID

module.exports = {
    userSignup: (userData) => {
        return new Promise(async (resolve, reject) => {

            userData.password = await bcrypt.hash(userData.password, 10)

            db.get().collection('users').insertOne(userData).then((data) => {
                db.get().collection('users').findOne({ email_id: userData.email_id }).then((details) => {
                    resolve(details, data.insertOne)
                })
            })

        });
    },

    userLogin: (userData) => {

        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection('users').findOne({ email_id: userData.email_id })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("sucessfully logged in")
                        response.data = user
                        response.status = true
                        resolve(response)
                    }
                    else {
                        console.log("Wrong password")
                        response.status = false
                        resolve(response)
                    }
                })
            } else {
                console.log('Wrong Email id')
                response.status = false
                resolve(response)
            }
        })
    },

    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }

        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection('cart').findOne({ user: objectId(userId) })
            if (userCart) {
                // console.log('user have cart')
                let proExist = userCart.products.findIndex(product => product.item == proId) //here product is the item array that contains all the products, 
                //product.item is the each products in product array 
                //product.item==proId -> this checks and return the index of the array were the product stored 
                //and if the product is not presented it returns -1
                console.log('user product status:', proExist)
                if (proExist != -1) {
                    db.get().collection('cart').updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }  //$ is used for array object
                        }).then(() => {
                            resolve()
                        })

                    //     console.log('product ',proId,' incremented')
                } else {
                    db.get().collection('cart').updateOne({ user: objectId(userId) },
                        {
                            $push: { products: proObj }
                        }).then(() => {
                            resolve()
                        })

                    //     console.log('new product added')
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection('cart').insertOne(cartObj).then(() => {
                    resolve()
                })

                //  console.log('product added to new cart')
            }
        }
        )
    },

    cartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let cart = await db.get().collection('cart').findOne({ user: objectId(userId) })
            if (cart && cart.products[0]) {
                let cartItems = await db.get().collection('cart').aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            user: objectId(userId),
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: 'product',
                            localField: 'item',
                            foreignField: '_id',
                            as: 'products'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                        }
                    }

                ]).toArray()
               // console.log(cartItems)
                response.cart = cart
                response.cartItems = cartItems
                resolve(response)
            } else {
                response.cart = false
                resolve(response)

            }
        })
    },

    updateQnty: (cart, product, count, quantity) => {
        count = parseInt(count)
        quantity = parseInt(quantity)
        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get().collection('cart').updateOne({ _id: objectId(cart), 'products.item': objectId(product) },
                    {
                        $pull: { products: { item: objectId(product) } }
                    }).then(() => {
                        resolve({ removeItem: true })
                    })
            } else {
                db.get().collection('cart').updateOne({ _id: objectId(cart), 'products.item': objectId(product) },
                    {
                        $inc: { 'products.$.quantity': count }
                    }).then(() => {
                        resolve()
                    })
            }
        })



    },

    cartAmount: (user) => {
        return new Promise(async (resolve, reject) => {
            let amount = {}
            let cart = await db.get().collection('cart').findOne({ user: objectId(user) })
            if(cart) {
                let data = await db.get().collection('cart').aggregate([
                    {
                        $match: { _id: objectId(cart._id) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            user: objectId(cart.user),
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: 'product',
                            localField: 'item',
                            foreignField: '_id',
                            as: 'products'
                        }
                    },
                    {
                        $project: {
                            item:1,quantity:1, product: { $toInt :{ $arrayElemAt: ['$products.price',0] }}
                        }
                    },
                    {
                        $project: {
                            item:1,quantity:1, total : {$multiply:['$product','$quantity']}
                        }
                    }]).toArray()
                //console.log(data)
                amount.data = data
                amount.status = true
                resolve(amount)
            } else {
                amount.status = false
                resolve(amount)
            }

        })

    },

   

    showOrders:(userId)=>{
        let response={}
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection('orders').findOne({userId:objectId(userId)})
            if(user){
                let data = await db.get().collection('orders').aggregate([
                    {
                        $match: { userId: objectId(userId) }
                    },
                    {
                        $project: {
                            user: objectId(userId),
                            item: '$products'
                        }
                    },
                    {
                        $lookup: {
                            from: 'product',
                            localField: 'item',
                            foreignField: '_id',
                            as: 'items'
                        }
                    },
                    {
                        $unwind:'$items'
                    },
                    {
                        $project:{
                            items:1,user:1
                        }
                    }
                ]).toArray()
                response.data = data
                response.status = true
                resolve(response)
                
            }else{
                console.log('No orders')
                response.status = false
                resolve(response)
            }
            
        })
8
    },
    userAddOrder:(proId,userId)=>{
        let orderDetails = { userId:objectId(userId),products:[objectId(proId)]}
        console.log(orderDetails)
        return new Promise(async(resolve,reject)=>{
            order = await db.get().collection('orders').findOne({userId:objectId(userId)})
            if(order){
                db.get().collection('orders').updateOne({userId:objectId(userId)},
                    {
                        $push: { products: objectId(proId) }

                    }).then(()=>{
                        resolve()
                    })
            }else{
                db.get().collection('orders').insertOne(orderDetails).then(()=>{
                    resolve()
                })
            }
           
        })
    }

}       