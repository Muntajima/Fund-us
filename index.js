const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middlewear
app.use(cors());
app.use(express.json());

const user = process.env.DB_USER;
const password = process.env.DB_PASS;

const uri = `mongodb+srv://${user}:${password}@cluster0.oi99s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri)

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
    //await client.connect();

    const campaignCollection = client.db('campaignDB').collection('campaign');
    const userCollection = client.db('campaignDB').collection('users');

    app.get('/campaign', async(req, res) =>{
      const cursor = campaignCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/campaign', async(req, res) =>{
      const newCampaign = req.body;
      console.log(newCampaign);
      const result = await campaignCollection.insertOne(newCampaign);
      res.send(result);
    })


    //users db

    app.get('/users', async(req, res) =>{
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/users', async(req, res) =>{
      const newUser = req.body;
      console.log("new user created:", newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    })

    app.delete('/campaign/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await campaignCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send("Fund me server is running well");
})

app.listen(port, () =>{
    console.log(`Fund me server is running on port: ${port}`)
})