const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Brand = require('../models/brandModel');

//ktra user co ton tai hay khong
const getData = asyncHandler(async (req, res, next) => {
    res.locals.userExist = false;
    if (req.cookies.refreshToken) {
        const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
        if (user) {
            res.locals.userExist = true;
        }
    }
    const brands = await Brand.find();
    const categories = await Category.find();
    res.locals.brands = brands;
    res.locals.categories = categories;
    next();
});

export default getData;
