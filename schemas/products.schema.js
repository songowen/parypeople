const mongoose = require("mongoose");

const productsSchema = new mongoose.Schema({
    title: {
    type: String,
    required: true,
    unique: true
  },
  author: {
    type: String,
    required: true,
    
  },
  content: {
    type: String
  },
  password: {
    type: String
  }
});

module.exports = mongoose.model("products", productsSchema);




// //   title,
//       content,
//       author,
//       password,