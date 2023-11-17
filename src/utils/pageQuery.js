// Lọc chuỗi query
const fillterQuery = (req, res) => {
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'limit', 'sort', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]); //xoa cac truong page, sort, limit, fields khoi queryObj
    let queryStr = JSON.stringify(queryObj); //bien thanh chuoi JSON
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    return queryStr;
};

// Sắp xếp
const sortQuery = (req, res, query) => {
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }
    return query;
};

// Giới hạn trường được chọn
const limitQuery = (req, res, query) => {
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    } else {
        query = query.select('-__v');
    }
    return query;
};

// query là dữ liệu tìm được
//  Model là đối tượng dữ liệu
const pageQuery = (req, query, model) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
        numProduct = model.countDocuments();
        if (skip >= numProduct) throw new Error('Trang này không tồn tại');
    }
    return query;
};

export { fillterQuery, sortQuery, limitQuery, pageQuery };
