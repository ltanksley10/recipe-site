const mongoose = require('mongoose');
const Review = require('./review');
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

//delete reviews when deleting recipe post
RecipeSchema.post('findOneAndDelete', async function(doc) {
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        }); 
    }
});

module.exports = mongoose.model('Recipe', RecipeSchema);