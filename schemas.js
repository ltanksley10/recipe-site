const Joi = require('joi');

module.exports.recipeSchema = Joi.object({
   recipe: Joi.object({
       image: Joi.string().required(),
       title: Joi.string().required(),
       style: Joi.string().required(),
       duration: Joi.number().required(),
       keto_friendly: Joi.string().required(),
       ingredients: Joi.array().required(),
       instructions: Joi.string().required()
   }).required() 
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
});