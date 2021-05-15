const Recipe = require('../models/recipe');
const { cloudinary } = require('../cloudinary');

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports.index = async(req, res) => {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Recipe.find({$or:[{title: regex}, {style: regex}]}, 
        function(err, searchResults) {
            if (err) {
                req.flash('error', 'Something went wrong.');
            } else if (searchResults.length === 0) {
                req.flash('error', 'Sorry, no recipes match your query. Please try again.');
                return res.redirect('/recipes');
            }
            res.render('recipes/index', {recipes: searchResults, page: 'recipes'});
        });
    } else {
        const recipes = await Recipe.find({});
        res.render('recipes/index', {recipes});
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render('recipes/new');
};

module.exports.createRecipe = async (req, res, next) => {
    const recipe = new Recipe(req.body.recipe);
    recipe.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    recipe.creator = req.user._id;
    await recipe.save();
    req.flash('success', 'Successfully made a new recipe!!');
    res.redirect(`/recipes/${recipe._id}`);
};

module.exports.showRecipe = async (req, res) => {
    const recipe = await Recipe.findById(req.params.id).populate({path: 'reviews', populate: { path: 'creator'}}).populate('creator');
    if(!recipe) {
        req.flash('error', 'Cannot find that recipe');
        return res.redirect('/recipes');
    }
    res.render('recipes/show', { recipe }); 
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    if (!recipe) {
        req.flash('error', 'Cannot find that recipe!');
        return res.redirect('/recipes');
    }
    res.render('recipes/edit', { recipe }); 
};

module.exports.updateRecipe = async (req, res) => {
    const { id } = req.params;
    const recipe = await Recipe.findByIdAndUpdate(id, {...req.body.recipe});
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    recipe.images.push(...imgs);
    await recipe.save();
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await recipe.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages }}}});
    }
    req.flash('success', 'Successfully updated recipe!');
    res.redirect(`/recipes/${recipe._id}`);
};

module.exports.deleteRecipe = async (req, res) => {
    const {id} = req.params;
    await Recipe.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted recipe');
    res.redirect('/recipes');
};