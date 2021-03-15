const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary');
const passport = require('passport');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const env = require('dotenv');
require('../models/User');
require('../models/Post');

const upload = require('../middleware/multer');

env.config({path: '../.env'});

const {ensureAuthenticated}=require('../helpers/auth');

router.get('/login', (req, res)=>{
    res.render('users/login')
})




router.get('/signup', (req, res)=>{
    res.render('users/signup')
})


router.post('/signup', upload.single('photo'), (req, res)=>{
    if(req.file){
 cloudinary.v2.uploader.upload(req.file.path, {folder: 'zenith'}, function(err, result){
     if(err){
         console.log(err)
     }
 
 let errors = [ ];

 if(req.body.password.length < 4){
     errors.push({text: 'Password lenth too small'})
 }
 if(errors.length > 0){
     res.render('users/signup',{
         errors: errors,
         username: req.body.username,
         email: req.body.email,
         password: req.body.password,
         photo: req.body.photo,
     });
 }else{
     User.findOne({username:req.body.username})
     .then(user=>{
         if(user){
             req.flash('error_msg', 'User already exist, please login')
             res.redirect('/admin/login')
         }else{
             const newUser={
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                photo: result.secure_url
             }
             console.log(newUser)
             bcrypt.genSalt(10, (err, salt)=>{
                 bcrypt.hash(newUser.password, salt, (err, hash)=>{
                     if(err) throw err;
                     newUser.password=hash;
                     User.create(newUser, function(err){
                         if(err){
                             console.log(err)
                         }else{
                             console.log(newUser)
                             req.flash( 'success_msg', 'Your admin account created successfully!')
                              res.redirect('/admin/login')
                      }
                     })
                 })
             })
         }
     })
 }
})
 }
  
})


router.post('/login', (req, res, next)=>{
    passport.authenticate('local', function(err, user, info){
        if(err) return next (err)
        if(!user){
        req.flash('error_msg', 'Incorrect username or password')
      return res.redirect('/admin/login')
        }
        req.logIn(user, function(err){
            if(err) return next(err);
            
            req.flash('success_msg', 'Welcome admin');
            res.redirect('/dashboard');
        })
    })(req, res, next);
})

router.get('/logout', (req, res, next)=>{
    req.logout();
    req.flash('success_msg', 'You logged out');
    res.redirect('/admin/login');
})



//getting rest password route

router.get('/reset', (req, res)=>{
    res.render('users/reset')
})

//getting forgot password route

router.get('/forgot', (req, res)=>{
    res.render('users/forgot')
})





router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error_msg', 'No account with that email address exists.');
            return res.redirect('back');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        let transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASS,
             
          },
          tls:{
            rejectUnauthorized:false,
          }
      });
        var mailOptions = {
          to: user.email,
          from: 'Vicky interior designs <noreply.elizaofficial5@gmail.com>',
          subject: 'Vicky interior designs Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.hostname + '/admin/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        transporter.sendMail(mailOptions, function(err) {
          req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/admin/forgot');
    });
  });

  //end of forget post

//Gettin the reset token


router.get('/reset/:token', function(req, res) {
User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
  if (!user) {
    req.flash('error_msg', 'Password reset token is invalid or has expired.');
    return res.redirect('/admin/forgot');
  }
  res.render('users/reset',{token: req.params.token});
});
});









router.post('/reset/:token', function(req, res) {
async.waterfall([
  function(done) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error_msg', 'Password reset token is invalid or has expired.');
        return res.redirect('back');
      }
        if(req.body.password.length < 4){
           req.flash('error_msg', 'Password must be atleast 4 character.')
           return res.redirect('back')
        }
       if(req.body.password === req.body.password2){

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
            
       bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(user.password, salt, (err,hash)=>{
         if(err) throw err;
        user.password = hash;
        console.log(user.password)
      user.save(function(err) {
        req.logIn(user, function(err) {
          done(err, user);
        });
      });
    });
    });
  } else{
    req.flash('error_msg', 'Passwords do not match.');
     return res.redirect('back');
  }
  })
  },
  function(user, done) {
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_EMAIL,
         pass: process.env.GMAIL_PASS,
         
      },
      tls:{
        rejectUnauthorized:false,
      }
  });
    var mailOptions = {
      to: user.email,
      from: 'Vicky interior designs admin password reset<noreply.elizaofficial5@gmail.com>',
      subject: 'Your password has been changed',
      text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
    };
    transporter.sendMail(mailOptions, function(err) {
     
      req.flash('success_msg', 'Success! Your password has been changed.');
      done(err);
    });
  }
], function(err) {
  res.redirect('/dashboard');
});
});

module.exports = router;

