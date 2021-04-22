const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
   email: {
       type: String,
       required: true,
       unique: true
   } 
});

//plugin will addon username and password field to schema
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);