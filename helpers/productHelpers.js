const { promise } = require('bcrypt/promises');
var db = require('../config/connection')
var objectId = require('mongodb').ObjectID 

module.exports={
     addProduct:(nwProduct,callback)=>{
        db.get().collection('product').insertOne(nwProduct).then((data)=>{
            callback(data.insertedId)
        });
    },

    showProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products= await db.get().collection('product').find().toArray()
            resolve(products)

        });
    },

    deleteProduct:(product)=>{
        return new Promise((resolve,reject)=>{
           db.get().collection('product').deleteOne({_id:objectId(product)}).then((data)=>{
               resolve(data)
           })  
        })
    },

    editProduct:(product)=>{
        return new Promise(async(resolve,reject)=>{
        let data= await db.get().collection('product').findOne({_id:objectId(product)})
        resolve(data)
    })
    },

    updateProduct:(productData,productId)=>{
        productData.price = parseInt(product.price)
        return new Promise((resolve,reject)=>{
        db.get().collection('product').updateOne({_id:objectId(productId)},{
            $set:{
            product_id:productData.Product_id,
            product_name:productData.product_name,
            category:productData.category,
            price:productData.price,
            quantity:productData.quantity
            }
        }).then((data)=>{
            resolve(true)
        })
        })        
    },

    showProduct:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(proId)
            let proDetails= await db.get().collection('product').findOne({_id:objectId(proId)})
            console.log(proDetails)
            resolve(proDetails)
        })
    }
    

    
}
