require('dotenv').config()
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const port = process.env.PORT || 5000;

//middlewear
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const user = process.env.DB_USER;
const password = process.env.DB_PASS;

const uri = `mongodb+srv://${user}:${password}@cluster0.oi99s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    const campaignCollection = client.db('campaignDB').collection('campaign');
    const userCollection = client.db('campaignDB').collection('users');
    const donatedCollection = client.db('campaignDB').collection('donation');

    app.get('/campaign', async (req, res) => {
      const cursor = campaignCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/campaign', async (req, res) => {
      const newCampaign = req.body;
      console.log(newCampaign);
      const result = await campaignCollection.insertOne(newCampaign);
      res.send(result);
    })


    //users db

    app.get('/users', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const newUser = req.body;
      console.log("new user created:", newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    })

    //AUTH related apis
    app.post('/jwt', (req, res) =>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5h'});

      res.cookie('token', token, {
        httpOnly: true,
        secure: false
      })
      .send({ success: true })
    });

    app.post('/logout', (req, res) =>{
      res
        .clearCookie('token', {
            httpOnly: true,
            secure: false
          })
          .send({ success: true })
    });

    app.delete('/campaign/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campaignCollection.deleteOne(query);
      res.send(result);
    })

    // for update
    app.get('/campaign/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campaignCollection.findOne(query);
      res.send(result);
    })

    app.put('/campaign/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCampaign = req.body;
      const Campaign = {
        $set: {
          title: updatedCampaign.title,
          type: updatedCampaign.type,
          amount: updatedCampaign.amount,
          deadline: updatedCampaign.deadline,
          description: updatedCampaign.description,
          image: updatedCampaign.image
        }
      }

      const result = await campaignCollection.updateOne(filter, Campaign, options);
      res.send(result);
    })

    //donation
    app.get('/donated', async (req, res) => {
      const cursor = donatedCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/donated', async (req, res) => {
      const newCampaign = req.body;
      console.log(newCampaign);
      const result = await donatedCollection.insertOne(newCampaign);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    //console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run()



app.get('/', (req, res) => {
  res.send("Fund me server is running well");
})


app.listen(port, () => {
  console.log(`Fund me server is running on port: ${port}`)
})


