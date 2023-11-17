const mongoose = require("mongoose"); // Erase if already required
const validator = require("validator");

// Declare the Schema of the Mongo model
var supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
      minlength: 3,
      maxlength: 200,
    },
    slug: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
    },
    address: {
      type: String,
      require: true,
      minlength: 3,
      maxlength: 200,
    },
    mobile: {
      type: String,
      require: true,
      minlength: 10,
      maxlength: 12,
    },
    email: {
      type: String,
      unique: true,
    },
    fax: {
      type: String,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Supplier", supplierSchema);
