const Joi = require('joi');

const supplierSchema = Joi.object().keys({
    id: Joi.string().hex().length(24).optional().allow(''),
    name: Joi.string().min(3).max(200).required(),
    slug: Joi.string().optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    mobile: Joi.string().min(10).max(12).required(),
    address: Joi.string().min(3).max(200).required(),
    fax: Joi.string().optional().allow(''),
    note: Joi.string().optional().allow(''),
});

const supplierValidate = (value) => {
    return supplierSchema.validate(value);
};

export default supplierValidate;
