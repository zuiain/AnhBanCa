import mongoose from 'mongoose';

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
    {
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                },
                price: Number,
                count: Number,
            },
        ],
        paymentIntent: {},
        priceTotal: Number,
        priceAfterDiscount: Number,
        discount: Number,
        userDiscount: Number,
        priceAfterUserDiscount: Number,
        orderStatus: {
            type: String,
            default: 'Chưa xử lý',
            enum: ['Chưa xử lý', 'Cash on Delivery', 'Đang xử lý', 'Đã hủy', 'Đã xử lý'],
        },
        orderBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        userName: {
            type: String,
        },
        userMobile: {
            type: String,
        },
        shippingAddress: {
            type: String,
        },
        shippingStatus: {
            type: String,
            default: 'Chưa giao hàng',
            enum: ['Chưa giao hàng', 'Đã giao hàng'],
        },
    },
    {
        timestamps: true,
    },
);

//Export the model
export default mongoose.model('Order', orderSchema);
