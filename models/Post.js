const mongoose = require('mongoose');

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
        
    }]
})


module.exports = Post = mongoose.model('post', PostSchema)