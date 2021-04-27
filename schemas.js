const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if (clean !== value) return helpers.error('string.escapeHTML', {value});
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.recipeSchema = Joi.object({
   recipe: Joi.object({
    //   image: Joi.string().required(),
       title: Joi.string().required().escapeHTML(),
       style: Joi.string().required().escapeHTML(),
       duration: Joi.number().required(),
       keto_friendly: Joi.string().required().escapeHTML(),
       ingredients: Joi.array().required(),
       instructions: Joi.string().required().escapeHTML()
   }).required(),
   deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});