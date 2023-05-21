const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.frc6p9l.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db('toysDB').collection('toys');

    // search by toy name

    // const indexKeys = { toyName: 1 };
    // const indexOptions = { name: "toyName" };
    // const result = await toysCollection.createIndex(indexKeys, indexOptions);
    // console.log(result)


    app.get('/getToysByText/:text', async (req, res) => {
      const text = req.params.text;
      const result = await toysCollection.find({ toyName: { $regex: text, $options: 'i' } }).toArray();
      res.send(result)
    })



    // my toys data

    app.get('/toys', async (req, res) => {
      console.log(req.query.email)
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await toysCollection.find(query).limit(20).sort().toArray();
      res.send(result)
    })

    


    // specific data

    app.get('/toysById/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query)
      res.send(result)
    })



    // category data

    app.get('/toysByCategory/:text', async (req, res) => {
      console.log(req.params.text)
      if (req.params.text == 'RegularCar' || req.params.text == 'PuliceCar' || req.params.text == 'Truck') {
        const result = await toysCollection.find({ category: req.params.text }).toArray()
        console.log(result)
        return res.send(result)
      }
    })


    app.get('/sortByPrice', async(req,res)=>{
      const user = req.query.user;
      const sort= parseInt(req.query.sort);

      const result= await toysCollection.find().sort({price: sort}).toArray()
      res.send(result);
    })



    // post

    app.post('/toys', async (req, res) => {
      const newToys = req.body;
      console.log(newToys)
      const result = await toysCollection.insertOne(newToys)
      res.send(result)
    })



    // update 

    app.put('/toys/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true }
      const updatedToy = req.body;
      const newToys = {
        $set: {
          toyName: updatedToy.toyName,
          image: updatedToy.image,
          sellerName: updatedToy.sellerName,
          email: updatedToy.email,
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          rating: updatedToy.rating,
          description: updatedToy.description,
          category: updatedToy.category
        }
      };
      const result = await toysCollection.updateOne(filter, newToys, options)
      res.send(result)
    })


    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query)
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('baby is crying')
})

app.listen(port, () => {
  console.log(`baby crying on port ${port}`)
})