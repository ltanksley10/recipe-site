const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
    style: String,
    title: String,
    image: String,
    ingredients: [],
    duration: Number,
    keto_friendly: String, 
    instructions: String,
    reviews: [
        {
            type: Schema.Types.ObjectId, 
            ref: 'Review'
        }    
    ]
});

module.exports = mongoose.model('Recipe', RecipeSchema);