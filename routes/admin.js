const express = require('express');
const router = express.Router();

require('../models/Post');
const {ensureAuthenticated, check}=require('../helpers/auth');


const layout = 'admin';


router.get('/dashboard', ensureAuthenticated, async(req, res)=>{
    const page = parseInt(req.query.page)||1
    const limit = parseInt(req.query.limit)||2
    var next = (page+1)
    const previous = (page-1)
    const count = await Post.countDocuments()
    const pages = Math.ceil(count/limit)
    
     if(next>pages){
         next=false;
     }
    const posts = await Post.find({}).sort({date:-1}).skip((limit*page)-limit)
    .limit(limit)
    res.render('dashboard', {layout, posts, page, count, limit, pages, next, previous})
})

module.exports = router;