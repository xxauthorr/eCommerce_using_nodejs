var db = require('../config/connection')

module.exports = {
    adminLoggedIn:(LoginData) => {
        return new Promise(async(resolve,reject)=>{
            let response ={}
            let admin = await db.get().collection('admins').findOne({staff_id:LoginData.staff_id})
            if(admin){
            if(admin.password==LoginData.password)
            {
                // console.log('success')
                response.adminData = admin
                response.admin=true
                resolve(response)
            }
            else{
                console.log('wrong Password')
                response.adminData = {msg:"Wrong Password"}
                response.admin= false 
                resolve(response)
            }
        }
        else{
            console.log('wrong id')
            response.adminData = {msg:"Invalid staff id "}
            response.admin = false
            resolve(response)        }
        })
        
    },

    adminSignup: (staffData) => {
        return new Promise((resolve, reject) => {
            db.get().collection('admins').insertOne(staffData).then()
                resolve(staffData)                
            
        })

    }

}       