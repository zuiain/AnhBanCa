import mongoose from 'mongoose';

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            require: true,
            unique: true,
            lowercase: true,
        },
        codeProd: {
            type: String,
            unique: true,
        },
        category: {
            type: String,
            required: true,
        },
        brand: {
            type: String,
        },
        supplier: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 0,
        },
        imPrice: {
            type: Number,
            require: true,
        },
        exPrice: {
            type: Number,
            require: true,
        },
        description: {
            type: String,
        },
        sold: {
            type: Number,
            default: 0,
            select: false,
        },
        imgUrl: {
            type: String,
            require: true,
        },
        ratings: [
            {
                star: Number,
                comment: String,
                postedby: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            },
        ],
        totalRating: {
            type: Number,
            default: 5,
        },
        preOrder: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

//Export the model
export default mongoose.model('Product', productSchema);
