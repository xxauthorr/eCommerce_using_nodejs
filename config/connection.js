const MongoClient = require('mongodb').MongoClient
const state= {
    db:null
}

module.exports.connect= function db(done){          //done is a callback function from app.js (connect function
    
    const url = 'mongodb://localhost:27017'
    const dbName = 'shopping'
    
    MongoClient.connect(url,function(err,data){  //err and data the callback arguments of a function inside another function 
        if(err) return done(err)
        else state.db=data.db(dbName)
        done()
    })
}


module.exports.get=function(){
    return state.db 
    
}

