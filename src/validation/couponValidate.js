import Joi from 'joi';

const couponSchema = Joi.object().keys({
    id: Joi.string().hex().length(24).optional().allow(''),
    name: Joi.string().min(3).max(100).required(),
    code: Joi.string().min(3).max(20).required(),
    startDay: Joi.date().required(),
    endDay: Joi.date().required(),
    discount: Joi.number().min(5).max(100).required(),
    description: Joi.string().optional().allow(''),
});

const couponValidate = (value) => {
    return couponSchema.validate(value);
};

export default couponValidate;
