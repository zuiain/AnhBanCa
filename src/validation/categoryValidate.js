import Joi from 'joi';

const categorySchema = Joi.object().keys({
    id: Joi.string().hex().length(24).optional().allow(''),
    name: Joi.string().min(2).max(30).required(),
    slug: Joi.string().min(2).max(30).allow(''),
    note: Joi.string().optional().allow(''),
});

const categoryValidate = (value) => {
    return categorySchema.validate(value);
};

export default categoryValidate;
