const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
        require: true,
        unique: true,
        lowercase: true
    },
    note: {
        type: String
    }
},
    {
        timestamps: true,
    });

//Export the model
module.exports = mongoose.model('Category', categorySchema);