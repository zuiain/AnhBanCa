import mongoose from 'mongoose'; // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        category: {
            type: String,
            required: true,
        },
        imgUrl: {
            type: String,
            require: true,
        },
        body: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        numViews: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

//Export the model
export default mongoose.model('Blog', blogSchema);
