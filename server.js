require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const DataSchema = require("./data");
const formidable = require("formidable");
var cookieParser = require("cookie-parser");
let Data;
const API_PORT = process.env.PORT || 8000;
const app = express();
app.use(cookieParser());
app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", function(req, res) {
  // Cookies that have not been signed
  console.log("Cookies: ", req.cookies);
  // // Cookies that have been signed
  console.log("Signed Cookies: ", req.signedCookies);
  return res.json("Up and running!");
});

// // this is our MongoDB database
const dbRoute = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.CLUSTER}/images?retryWrites=true&w=majority`;
// // connects our back end code with the database
mongoose.connect(dbRoute, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  keepAlive: true
});

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));

// // checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//  GET #####
app.get("/getImageUrl", (req, res) => {
  const data = req.query;
  if (Data) {
    Data.find(data, (err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
  }
});

app.post("/setCollection", (req, res) => {
  console.log("Setting Collection");
  const collection = /.*@/.exec(req.body.email)[0].slice(0, -1);
  console.log("collection:", collection);
  Data = mongoose.model(collection, DataSchema);
});

//  POST #####
app.post("/postData", (req, res) => {
  let data = new Data();
  const { peg, imageURL, pegName } = req.body;

  //TODO: check that info comes in correctly
  // if ((!id && id !== 0) || !message) {
  //   return res.json({
  //     success: false,
  //     error: 'INVALID INPUTS',
  //   });
  // }
  data.imageURL = imageURL;
  data.peg = peg;
  data.pegName = pegName;
  console.log("Data:\n", data);

  data.save(err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

//  PUT #####
app.put("/updateData", (req, res) => {
  const { peg, pegName, imageURL } = req.body;
  const query = { peg: peg };
  async function getDoc() {
    let doc = await Data.findOne(query);
    if (!doc) {
      doc = await Data.create({ peg: peg });
    }
    doc.pegName = pegName;
    doc.imageURL = imageURL ? imageURL : doc.imageURL;
    doc.save();
  }

  getDoc();

  return res.json("hello friend");
});

//  DELETE #####
app.delete("/deleteData", (req, res) => {
  const { id } = req.body;
  Data.findByIdAndRemove(id, err => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

const router = express.Router();

app.use("/", router);

app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
