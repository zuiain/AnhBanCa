// Lọc chuỗi query
const filterQuery = (req) => {
    const queryObj = { ...req.query };

    const excludeFields = ['page', 'limit', 'sort', 'fields'];

    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    return JSON.parse(queryStr);
};

// Sắp xếp
const sortQuery = (req, query) => {
    const strQuery = req.query.sort;

    if (strQuery) {
        const sortBy = strQuery.split('*');
        let sortName = [];
        let sortOrder = [];
        const sortObj = {};

        sortBy.forEach((sortItem) => {
            const _sortItem = sortItem.split('-');
            sortName.push(_sortItem[0]);
            if (_sortItem[1] === undefined || _sortItem[1] === 'asc') {
                sortOrder.push(1);
            } else {
                sortOrder.push(-1);
            }
        });

        for (const i in sortName) {
            sortObj[sortName[i]] = sortOrder[i];
        }

        query = query.sort(sortObj);
    } else {
        query = query.sort('-createdAt');
    }
    return query;
};

// Giới hạn trường được chọn
const limitQuery = (req, query) => {
    const _fields = req.query.fields;
    if (_fields) {
        const fields = _fields.split('+').join(' ');
        query = query.select(fields);
    } else {
        query = query.select('-__v');
    }
    return query;
};

//  Phân trang
const pagination = async (req, query, numberDocs, _limit = 10) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || _limit;
    const skip = (page - 1) * limit;
    const pages = Math.ceil(numberDocs / limit);

    if (req.query.page) {
        if (skip >= numberDocs) throw new Error('Page is out of range');
    }

    const data = await query.skip(skip).limit(limit);

    return { data, pages };
};

export default { filterQuery, sortQuery, limitQuery, pagination };
