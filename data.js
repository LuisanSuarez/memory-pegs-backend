// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const DataSchema = new Schema(
  {
    peg: { type: Number, unique: true, required: true, dropDups: true },
    imageURL: String,
    pegName: String
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
// module.exports = mongoose.model("Data", DataSchema);
module.exports = DataSchema;
