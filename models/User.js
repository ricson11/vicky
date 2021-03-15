const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
      
    username:{
        type: String,
        require: true,
    },

    email:{
        type: String,
        require: true,
    },

    photo: {
        type: String,
        
    },

    password: {
        type: String,
        require: true
    },
    posts:{
        type: mongoose.Schema.Types,
        ref: 'post'
    },
    date:{
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});



module.exports = User = mongoose.model('user', UserSchema)