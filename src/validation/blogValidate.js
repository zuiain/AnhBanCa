import Joi from 'joi';

const blogSchema = Joi.object().keys({
    id: Joi.string().length(24).optional().allow(''),
    title: Joi.string().min(2).max(100).required(),
    category: Joi.string().required(),
    content: Joi.string().required(),
    body: Joi.string().required(),
    numViews: Joi.number().optional().allow(''),
});

const blogValidate = (value) => {
    return blogSchema.validate(value);
};

export default blogValidate;
