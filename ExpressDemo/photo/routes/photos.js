var Photo = require('../models/Photo');
var path = require('path');
var fs = require('fs');
const { dir } = require('console');
var join = path.join;

let photos = []
photos.push({
    name:"node.js Logo",
    path:"https://nodejs.org/static/images/logo.svg"
})
photos.push({
    name:"Ryan Speaking",
    path:"https://nodejs.org/static/images/logo.svg"
})
exports.submit = function(dir){
    return function(req,res,next){
        var img = req.files.Photo.image;
        var name = req.body.Photo.name || img.name;
        var path = join(dir,img.name)
        fs.rename(img.path,path,function(err){
            if(err) return next(err)
        })
        Photo.create({
            name:name,
            path:img.name
        },function(err){
            if(err) return next(err);
            res.redirect('/')
        })
    }
}

exports.list = function(req,res,next){
    Photo.find({},function(err,photos){
        if(err) return next(err);
    })
    res.render('photos',{
        title:"Photos",
        photos:photos
    })
}

exports.form = function(req,res){
    res.render('photos/upload',{
        title:"Photo upload",
    })
}
exports.download =function(dir){
    return  function(req,res,next){
        var id = req.params.id;
        Photo.findById(id,function(err,photo){
            if(err) return next(err);
            var path = join(dir,photo.path);
            res.sendfile(path)
        })
    }
}