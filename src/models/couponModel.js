import mongoose from 'mongoose'; // Erase if already required

// Declare the Schema of the Mongo model
var couponSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        slug: {
            type: String,
            require: true,
            unique: true,
            lowercase: true,
        },
        code: {
            type: String,
            require: true,
            unique: true,
            min: 3,
            max: 20,
        },
        startDay: {
            type: Date,
            required: true,
        },
        endDay: {
            type: Date,
            required: true,
        },
        discount: {
            type: Number,
            required: true,
        },
        discription: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

//Export the model
export default mongoose.model('Coupon', couponSchema);
