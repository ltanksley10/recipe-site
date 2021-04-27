const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const RecipeSchema = new Schema({
    style: String,
    title: String,
    images: [ImageSchema],
    ingredients: [],
    duration: Number,
    keto_friendly: String, 
    instructions: String,
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
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