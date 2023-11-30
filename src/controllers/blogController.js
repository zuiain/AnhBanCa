import asyncHandler from 'express-async-handler';
import slugify from 'slugify';

import { Blog } from '~/models';
import { validateMongoDBId } from '~/utils/';
import { pageQuery } from '~/utils/';
import { blogValidate } from '~/validation/';
import { cloudinaryUploadImg } from '~/utils/';

// get list of blogs
const getList = asyncHandler(async (req, res) => {
    try {
        const queryString = pageQuery.filterQuery(req, res);

        let _query = Blog.find(queryString);

        _query = pageQuery.sortQuery(req, _query);

        _query = pageQuery.limitQuery(req, _query);

        const numDocs = await Blog.countDocuments(); //tong so san pham

        const query = await pageQuery.pagination(req, _query, numDocs, 5);

        if (query) {
            res.json({ data: query.data, pages: query.pages });
        } else {
            throw new Error('Error while getting brand list');
        }
    } catch (err) {
        throw new Error(err);
    }
});

// get detail of blog
const getDetail = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    try {
        const query = await Blog.findOne({ slug });
        if (query) {
            res.json({ data: query });
        } else {
            throw new Error('Blog not found');
        }
    } catch (err) {
        throw new Error(err);
    }
});

const createPost = asyncHandler(async (req, res) => {
    try {
        const resultValidate = blogValidate(req.body);

        if (resultValidate.error) {
            throw new Error(resultValidate.error);
        }

        if (!req.file) {
            throw new Error('Image file not found');
        } else {
            const result = await cloudinaryUploadImg(req.file.path);
            req.body.imgUrl = result.url;
        }

        req.body.slug = slugify(req.body.title);

        const query = await Blog.create(req.body);

        if (query) {
            res.json(query);
        } else {
            throw new Error('Error while creating new blog');
        }
    } catch (err) {
        throw new Error(err);
    }
});

const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.body;
    console.log(id);
    validateMongoDBId(id);
    try {
        const result = blogSchema.validate(req.body);
        if (result.error) {
            console.log(result.error);
            req.flash('err', 'Thông tin vừa nhập không đúng định dạng !');
            res.redirect('back');
            return;
        }
        if (req.body.name) {
            req.body.slug = slugify(req.body.name);
        }
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        req.flash('msg', 'Sửa bài viết thành công');
        res.redirect('/blog');
    } catch (err) {
        req.flash('err', 'Có lỗi xảy ra !');
        res.redirect('back');
        throw new Error(err);
    }
});

const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let page = req.query.page || 1;
    validateMongoDBId(id);
    try {
        const deleteBlog = await Blog.findByIdAndDelete(id);
        req.flash('msg', 'Xóa bài viết thành công');
        res.redirect('/blog');
        //res.render('admin/blog/list', { page, err: req.flash('err'), msg: req.flash('msg') });
    } catch (err) {
        req.flash('err', 'Có lỗi xảy ra !');
        res.redirect('back');
        throw new Error(err);
    }
});

const searchBLog = asyncHandler(async (req, res) => {
    const { key, category } = req.query;
    let searchBlog;
    try {
        if (key == '') {
            if (category != '') {
                searchBlog = await Blog.find({
                    category: req.query.category,
                });
            } else {
                req.flash('err', 'Chưa nhập giá trị vào thanh tìm kiếm !');
                res.redirect('/blog');
                return;
            }
        } else {
            if (req.query.category != '') {
                searchBlog = await Blog.find({
                    category: category,
                    $or: [
                        { name: { $regex: key, $options: 'i' } },
                        { slug: { $regex: key, $options: 'i' } },
                        { note: { $regex: key, $options: 'i' } },
                    ],
                });
            } else {
                searchBlog = await Blog.find({
                    $or: [
                        { name: { $regex: key, $options: 'i' } },
                        { slug: { $regex: key, $options: 'i' } },
                        { note: { $regex: key, $options: 'i' } },
                    ],
                });
            }
        }
        if (searchBlog.length > 0) {
            req.flash('msg', 'Tìm thấy ' + searchBlog.length + ' bài viết phù hợp');
        } else {
            req.flash('err', 'Không tìm thấy bài viết phù hợp');
        }
        res.render('admin/blog/list', {
            blogs: searchBlog,
            key: key,
            category: category,
            pages: 0,
            err: req.flash('err'),
            msg: req.flash('msg'),
        });
    } catch (err) {
        req.flash('err', 'Có lỗi xảy ra !');
        res.redirect('back');
        throw new Error(err);
    }
});

//sua anh
const getUpdateImg = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDBId(id);
    {
        try {
            const blog = await Blog.findById(id);
            res.render('admin/blog/updateImg', {
                blog,
                msg: req.flash('msg'),
                err: req.flash('err'),
            });
        } catch (err) {
            req.flash('err', 'Có lỗi xảy ra!');
            res.redirect('back');
            throw new Error(err);
        }
    }
});

//sua anh
const updateImg = asyncHandler(async (req, res) => {
    const { id } = req.body;
    let imgUrl;
    try {
        if (!req.file) {
            req.flash('err', 'Chưa chọn file ảnh !');
            res.redirect('back');
            return;
        } else {
            const result = await cloudinaryUploadImg(req.file.path);
            imgUrl = result.url;
            console.log(imgUrl);
        }
        const blog = await Blog.findByIdAndUpdate(
            id,
            { imgUrl: imgUrl },
            {
                new: true,
            },
        );
        if (blog !== null) {
            req.flash('msg', 'Sửa ảnh thành công ');
            res.redirect('/blog');
        } else {
            req.flash('msg', 'Có lỗi xảy ra !');
            res.redirect('back');
        }
    } catch (err) {
        throw new Error(err);
    }
});

export const blogController = {
    getList,
    getDetail,
};
