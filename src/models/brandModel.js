import mongoose from 'mongoose'; // Erase if already required

// Declare the Schema of the Mongo model
var brandSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        slug: {
            type: String,
            require: true,
            unique: true,
            lowercase: true,
        },
        origin: {
            type: String,
        },
        note: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

//Export the model
export const Brand = mongoose.model('Brand', brandSchema);
