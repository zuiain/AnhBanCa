import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
            //required: [true, 'Name is required']
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Invalid Email !');
                }
            },
        },
        mobile: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 12,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            maxlength: 30,
            validate(value) {
                if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                    throw new Error('Password must contain at least one letter and one number');
                }
            },
        },
        role: {
            type: String,
            default: 'user',
        },
        address: {
            type: String,
        },
        cart: {
            type: Array,
            default: [],
        },
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        refreshToken: {
            type: String,
        },
        vip: {
            type: Number,
            default: 0,
        },
        moneySpend: {
            type: Number,
            default: 0,
        },
    },

    {
        timestamps: true,
    },
);

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//Export the model
export default mongoose.model('User', userSchema);
