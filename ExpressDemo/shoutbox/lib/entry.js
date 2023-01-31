var redis = require('redis')
var db = redis.createClient()

module.exports = FileSystemEntry
function Entry(obj){
    for(let key in obj){
        this[key] = obj[key]
    }
}

Entry.prototype.save = function(fn){
    var entryJSON = JSON.stringify(this)

    db.lPush('entries',entryJSON,function(err){
        if(err) return fn(err)
        fn()
    })
}

Entry.getRange = function(from,to,fn){
    db.lRange('entries',from,to,function(err,items){
        if(err) return fn(err)
        var entries = []
        items.forEach(function(item){
            entries.push(JSON.parse(item))
        });
        fn(null,entries)
    })
}

Entry.count = function(fn){
    db.lLen('entries',fn)
}