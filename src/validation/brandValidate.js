import Joi from 'joi';

const brandSchema = Joi.object().keys({
    id: Joi.string().hex().length(24).optional().allow(''),
    name: Joi.string().min(3).max(100).required(),
    origin: Joi.string().min(1).max(100).optional().allow(''),
    note: Joi.string().optional().allow(''),
});

const brandValidate = (value) => {
    return brandSchema.validate(value);
};

export default brandValidate;
