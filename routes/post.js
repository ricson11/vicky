
const express= require('express');

const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary');
const nodemailer = require('nodemailer');
const env = require('dotenv');
const fs = require('fs');

require('../models/Post');

env.config({path: '../.env'});

const upload = require('../middleware/multer');
const uploadMethod = require('../middleware/uploadMethod');

router.get('/', async(req, res)=>{
    const posts = await Post.find({}).sort({date:-1}).limit(1)
    const posts1 = await Post.find({}).sort({date:-1}).skip(1).limit(1)
    const posts2 = await Post.find({}).sort({date:-1}).skip(2).limit(1)

    res.render('index',{posts, posts1, posts2});
});


router.get('/about', async(req, res)=>{
    const posts = await Post.find({}).sort({date:-1}).limit(1)
    const posts1 = await Post.find({}).sort({date:-1}).skip(1).limit(1)
    const posts2 = await Post.find({}).sort({date:-1}).skip(2).limit(1)
    res.render('about', {posts, posts1, posts2})
})

router.get('/services', async(req, res)=>{
    const posts = await Post.find({}).sort({date:-1}).limit(1)
    const posts1 = await Post.find({}).sort({date:-1}).skip(1).limit(1)
    const posts2 = await Post.find({}).sort({date:-1}).skip(2).limit(1)
    res.render('services', {posts, posts1, posts2})
})
router.get('/testimonies', async(req, res)=>{
    const posts = await Post.find({}).sort({date:-1}).limit(1)
    const posts1 = await Post.find({}).sort({date:-1}).skip(1).limit(1)
    const posts2 = await Post.find({}).sort({date:-1}).skip(2).limit(1)
    res.render('testimonies', {posts, posts1, posts2})
})
router.get('/blog', async(req, res)=>{
    const posts = await Post.find({}).sort({date:-1}).limit(1);
    const post1 = await Post.find({}).sort({date:-1}).skip(1).limit(1);
    const post2 = await Post.find({}).sort({date:-1}).skip(2).limit(1);

    const recent = await Post.find({}).sort({date:-1}).skip(3).limit(1);
    const recent1 = await Post.find({}).sort({date:-1}).skip(4).limit(1);
    const recent2 = await Post.find({}).sort({date:-1}).skip(5).limit(1);
    res.render('blog', {posts, post1, post2, recent, recent1, recent2})
})


router.get('/add', (req, res)=>{
    res.render('posts/add')
})

router.post('/post', upload.array('image'), async(req, res)=>{
  
    try{
    if(req.files){
    if(req.method === 'POST'){
        const urls = [];
        const files = req.files;
        for(const file of files){
            const {path} = file;
            const newPath = await uploadMethod(path)
            urls.push(newPath)
            fs.unlinkSync(path)
        } 
      
           const newPost={
               title: req.body.title,
               details: req.body.details,
               image:urls.map(url=>url.result),
               cloudinary_id: urls.map(url=>url.id),
           }
           Post.create(newPost)
           console.log(newPost)
           req.flash('success_msg', 'Post successfully added')
           res.redirect('/');
    }
}else{
    const newPost={
        title: req.body.title,
        details: req.body.details,
      
    }
    Post.create(newPost)
    console.log(newPost)
    req.flash('success_msg', 'Post successfully added')
    res.redirect('/');
}
}
catch(err){
    console.log(err.message)
}
 
})

router.get('/post/:id', async(req, res)=>{

    try{
        const post = await Post.findOne({_id:req.params.id})
       
        post.views++;
        post.save();
        const recent = await Post.find({}).sort({date:-1}).skip(3).limit(3);
        const popular = await Post.find({}).sort({views:-1}).limit(3);
        let q = new RegExp(post.title, 'i');
        const similar = await Post.find({title:q}).sort({date:-1}).limit(3);
       
      
        res.render('posts/show', {post, recent, popular, similar})
    }
    catch(err){
        console.log(err.message)
    }

})

router.get('/post/edit/:id', async(req, res)=>{
    try{
    const post = await Post.findOne({_id:req.params.id})
    
    res.render('posts/edit', {post})
    }
    catch(err){
        console.log(err.message)
    }
})


router.put('/post/:id', upload.array('image'), async(req, res)=>{
  
    try{
    if(req.files){
    const post = await Post.findOne({_id:req.params.id})
    if(!post){
     res.redirect('/dashboard')
    } 
    cloudinary.v2.uploader.destroy(post.cloudinary_id)   
    if(req.method === 'PUT'){
        const urls = [];
        const files = req.files;
        for(const file of files){
            const {path} = file;
            const newPath = await uploadMethod(path)
            urls.push(newPath)
    
        } 
      
         Post.findOne({_id: req.params.id})
         .then(post=>{
             post.title = req.body.title,
             post.details = req.body.details,
             post.image = urls.map(url=>url.result),
             cloudinary_id = urls.map(url=>url.id),
             console.log(post)
             post.save()
         })
         .then(post=>{
            req.flash('success_msg', 'Post successfully updated')
            res.redirect('/');
         })
           
    }
}else{
    Post.findOne({_id: req.params.id})
         .then(post=>{
             post.title = req.body.title,
             post.details = req.body.details,
             console.log(post)
             post.save()
         })
         .then(post=>{
            
            req.flash('success_msg', 'Post successfully updated')
            res.redirect('/');
      })
}
}
catch(err){
    console.log(err.message)
}
 
})






router.get('/post/delete/:id',async (req, res)=>{
    try{
        const post = await Post.findOne({_id: req.params.id})
        if(!post){
            res.redirect('/dashboard')
        } 
      cloudinary.api.delete_resources(post.cloudinary_id)   

     Post.deleteOne({_id:req.params.id})
     .then(()=>{
         req.flash('success_msg', 'Post deleted successfully')
         res.redirect('/dashboard')
     })
    }
    catch(err){
        console.log(err.message)
    } 
})
/*router.put('/post/:id', upload.single('image'),(req, res)=>{
  
       if(req.file){
        cloudinary.v2.uploader.upload(req.file.path, {folder: 'zenith'}, function(err, result){
            if(err){
                 console.log(err)
             }else{
          
      Post.findOne({_id:req.params.id})
      .then(post=>{
          post.image=result.secure_url,
          post.title=req.body.title,
          post.details=req.body.details,
          post.save()
          .then(post=>{
              console.log(post)
              res.redirect('/')
          })
      })
    }
})
    }else{
        Post.findOne({_id:req.params.id})
        .then(post=>{
            post.title=req.body.title,
            post.details=req.body.details,
            post.save()
            .then(post=>{
                console.log(post)
                res.redirect('/')
            })
        })
    }
})*/

router.post('/comment/post/:id', (req, res)=>{
    Post.findOne({_id:req.params.id})
    .then(post=>{
        const newComment={
            commentBody: req.body.commentBody
        }
        post.comments.unshift(newComment);
        post.save()
        .then(post=>{
            console.log(post)
            res.redirect('/post/'+ post._id)
        })
    })
})


router.get('/comment/post/:id', (req, res)=>{
    Post.findOne({_id:req.params.id})
    .then(post=>{
        res.render('posts/show', {post})
    })
})


router.post('/contact', (req, res)=>{

    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        }
    });
    var mailOptions={
        from: process.env.GMAIL_EMAIL,
        to:   process.env.GMAIL_EMAIL,
        subject: 'Message from vicky interior design site',
        text: req.body.message,
        replyTo: req.body.email,
    };
     
     transporter.sendMail(mailOptions, function(err, info){
         if(err){
             console.log(err.message)
           // req.flash('error_msg', 'An error occur, please try again')
           return res.redirect('back')
            
         }else{
             console.log('message sent successfully')
            req.flash('success_msg', 'Your message has been delivered successfully!')
            
            res.redirect('/')
         }
     });
})


router.get('/search', async(req, res)=>{
    const {query} = req.query;
    let q = new RegExp(query, 'i')
    const searches = await Post.find({$or: [{title:q}, {details:q}]})
    .sort({date:-1})
    res.render('search_results', {searches, query})
});


module.exports=router;
