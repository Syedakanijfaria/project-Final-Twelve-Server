const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const bodyParser = require('express');
app.use(bodyParser.urlencoded({ extended: true }));
const { MongoClient } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nzkru.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        console.log('database connected successfully');
        const database = client.db('kids_shop');
        const productsCollection = database.collection('products');


        // get all products
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            //console.log(products);
            res.send(products);
        });

        // get single products by Buy botton
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
            //console.log(product);
        });

        // app.get('/products', async (req, res) => {
        //     const email = req.query.email;
        //     //const date = new Date(req.query.date).toLocaleDateString();

        //     const query = { email: email }

        //     const cursor = productsCollection.find(query);
        //     const products = await cursor.toArray();
        //     res.json(products);
        // });

        // app.post('/products', async (req, res) => {
        //     const product = req.body;
        //     const result = await productsCollection.insertOne(product);
        //     console.log(result);
        //     res.json(result)
        // });

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Baby shop!')
})

app.listen(port, () => {
    console.log(`listening at baby: ${port}`)
})