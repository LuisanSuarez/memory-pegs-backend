require('dotenv').config()
const mongoose = require('mongoose');
const express = require('express');
let cors = require('cors');
const bodyParser = require('body-parser');
const Data = require('./data');


const API_PORT = process.env.API_PORT || 8000;
const app = express();
app.use(cors());
const router = express.Router();

const collection = "buenas-noches-test";

// // this is our MongoDB database
const dbRoute =
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@memory-pegs-image-database-uorex.mongodb.net/${collection}?retryWrites=true&w=majority`
// // connects our back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true, useUnifiedTopology: true });

let db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));

// // checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//  GET #####
app.get('/getImageUrl', (req, res) => {
    const data = req.query;
  Data.find(data, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    console.log(data)
    return res.json({ success: true, data: data });
  });
});


//  POST #####
app.post('/postData', (req, res) => {
    let data = new Data();
    const { peg, imageURL, pegName } = req.body;

    //TODO: check that info comes in correctly
    // if ((!id && id !== 0) || !message) {
    //   return res.json({
    //     success: false,
    //     error: 'INVALID INPUTS',
    //   });
    // }
    data.imageURL =  imageURL;
    data.peg =  peg;
    data.pegName =  pegName;
    console.log("Data:\n", data);

    data.save((err) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true });
    });
  });


//  PUT #####
app.put('/updateData', (req, res) => {
  const { peg, pegName, imageURL } = req.body;
  console.log("req.body:", req.body);
  const query = { peg: peg }
  // const data = { pegName: pegName }
  async function getDoc() {
    let doc = await Data.findOne(query);
    if (!doc) {
      doc = await Data.create({peg: peg})
      console.log('AHORA SI DOC:', doc);
    }
    doc.pegName = pegName;
    doc.imageURL = imageURL ? imageURL : doc.imageURL;
    doc.save();
  }
  getDoc();
  console.log("DONE, WE'VE UPDATED");

  // Data.find(query, null, (res) => {
  //   // res.send("Ninjas are in");
  //   // console.log("DATA:", data);
  //   console.log("res:", res );
  // })

  // Data.find(query)
  //   .then(response => console.log("RESPONSE:", response));
  // console.log(doc, '\n\n');
  // console.log(doc.schema, '\n\n');
  // console.log(typeof doc);


  // doc.pegName = pegName;
  // doc.save()
  // Data.findOneAndUpdate(query, data, res => {console.log("updated or at least ran:", res); return res})
  // Data.find(id, update, (err) => {
  //   if (err) return res.json({ success: false, error: err });
  //   return res.json({ success: true });
  // });
});


//  DELETE #####
app.delete('/deleteData', (req, res) => {
  const { id } = req.body;
  Data.findByIdAndRemove(id, (err) => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});


// append /api for our http requests
app.use('/', router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
