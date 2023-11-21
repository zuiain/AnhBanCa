import Joi from 'joi';

const productSchema = Joi.object({
    id: Joi.string().hex().length(24).optional().allow(''),
    name: Joi.string().min(3).max(100).required(),
    slug: Joi.string().optional().allow(''),
    code: Joi.string().min(3).max(30).optional().allow(''),
    category: Joi.string().min(3).max(30).required(),
    brand: Joi.string().min(3).max(30).optional().allow(''),
    supplier: Joi.string().min(3).max(100).required(),
    quantity: Joi.number().default(0).required(),
    imPrice: Joi.number().required(),
    price: Joi.number().required(),
    description: Joi.string().optional().allow(''),
    sold: Joi.number().optional().allow(''),
    imgUrl: Joi.string().min(3).max(100).optional().allow(''),
    ratings: Joi.array().optional().allow(''),
    totalRating: Joi.number().optional().allow(''),
});

const productValidate = (value) => {
    const result = productSchema.validate(value);
    return result;
};

export default productValidate;
