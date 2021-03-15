require('../models/User');

module.exports={
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }else{
           req.flash('error_msg', 'Unauthorized access')
           return res.redirect('/admin/login')
        }
    },
  
}