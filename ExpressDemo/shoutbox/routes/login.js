exports.form = function(req,res){
    res.render('login',{title:'Login'})
}

var User = require('../lib/user')
exports.submit = function(req,res,next){
    var data = req.body.user;
    User.authenticate(data.name,data.pass,function(err,user){
        if(err) return next(err)

        if(user){
            req.session.uid = user.id
            res.redirect('/')

        }else{
            res.error("soory invalid credentials!")
            res.redirect('back')
        }
    })
}

exports.logout = function(req,res){
    req.session.destory(function(err){
        if(err) throw err
        res.redirect('/')
    })
}