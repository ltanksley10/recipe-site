const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

// const ImageSchema = new Schema({
//     url: String,
//     filename: String
// });

// ImageSchema.virtual('thumbnail').get(function() {
//     return this.url.replace('/upload', '/upload/w_200');
// });

const UserSchema = new Schema({
   username: String,
   password: String,
   // image: [ImageSchema],
   firstName: String,
   lastName: String,
   email: {
       type: String,
       required: true,
       unique: true
   },
   resetPasswordToken: String,
   resetPasswordExpires: Date
});

//plugin will addon username and password field to schema
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);