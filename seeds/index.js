// const mongoose = require('mongoose');
// const recipes = require('./recipes');
// const { foods, descriptors } = require('./seedHelpers');
// const Recipe = require('../models/recipe');

// mongoose.connect('mongodb://localhost:27017/foodstagram', {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true
// });

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });

// const sample = array => array[Math.floor(Math.random() * array.length)];

// const seedDB = async() => {
//     await Recipe.deleteMany({});
//     for(let i = 0; i < 8; i++) {
//         const random9 = Math.floor(Math.random() * 9);
//         const rec = new Recipe ({
//             style: `${recipes[random9].type}`,
//             title: `${sample(descriptors)} ${sample(foods)}`,
//             image: 'https://source.unsplash.com/collection/169536',
//             duration: `${recipes[random9].duration}`,
//             keto_friendly: `${recipes[random9].keto_friendly}`
//         });
//         await rec.save();
//     }
// }

// seedDB().then(() => {
//     mongoose.connection.close();
// });