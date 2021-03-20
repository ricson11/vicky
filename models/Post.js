const mongoose = require('mongoose');
const slugify = require('slugify');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title:{
        type: String,
        require: true
    }, 
    image:[{
        type: String,
    }],

    cloudinary_id:[{
        type: String
    }],

    details:{
        type: String,
    },
    views:{
         type: Number,
         default: 0
    },
    date:{
        type: Date,
        default: Date.now,
    },
    comments:[{
        commentBody:{
            type: String
        },
        commentDate:{
            type: Date,
            default: Date.now
        },
        
    }],

    slug:{
        type: String,
        required: true,
        unique: true
    }
})

PostSchema.pre('validate', function(){
    if(this.title){
        this.slug = slugify(this.title, {lower: true, strict: true})
    }
})

module.exports = Post = mongoose.model('post', PostSchema)