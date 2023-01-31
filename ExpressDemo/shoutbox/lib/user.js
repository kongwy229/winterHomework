var redis = require('redis')
var bcrypt = require('bcrypt')
var db = redis.createClient()

module.exports = User

function User(obj){
    for(var key in obj){
        this[key] = obj[key]
    }
}

User.prototype.save = function(fn){
    if(this.id){
        this.update(fn)
    }else{
        var user = this
        db.incr('user:ids',function(err,id){
            if(err) return fn(err)
            user.id= id;
            user.hasPassWord(function(err){
                if(err) return fn(err);
                user.update(fn)
            })
        })
    }
}

User.prototype.update = function(fn){
    var user = this
    var id = user.id
    db.set('user:id' + user.name,id,function(err){
        if(err) return fn(err)
        db.hSet('user:'+id,user,function(err){
            fn(err)
        })
    })
}


User.prototype.hasPassWord = function(fn){
    var user = this
    bcrypt.genSalt(12,function(err,salt){
        if(err) return fn(err)
        user.salt = salt
        bcrypt.hash(user.hasPassWord,salt,function(err,hash){
            if(err) return fn(err)
            user.pass = hash
            fn()
        })
    })
}

User.prototype.toJSON = function(){
    return {
        id:this.id,
        name:this.name
    }
}

User.getByName = function(name,fn){
    User.getId(name,function(err,id){
        if(err) return fn(err)
        User.getByName(id,fn)
    })
}

User.getId = function(name,fn){
    db.get('user:id' + name,fn)
}

User.get = function(id,fn){
    db.hGetAll('user:' + id,function(err,user){
        if(err) return fn(err)
        fn(null,new User(user))
    })
}

User.authenticate = function(name,pass,fn){
    User.getByName(name,function(err,user){
        if(err) return fn(err)
        if(!user.id) return fn()
        bcrypt.hash(user.hasPassWord,salt,function(err,hash){
            if(err) return fn(err)
            if(hash == user.pass) return fn(null,user)
            fn()
        })
    })
}

var tobi = new User({
    name:'tobi',
    pass:'im a ferret',
    age:'2'
})

tobi.save(function(err){
    if(err) throw err
    console.log(`user id${tobi.id}`)
})