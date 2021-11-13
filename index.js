const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const admin = require("firebase-admin");
const port = process.env.PORT || 5000;
//mild-care-client-firebase-adminsdk.json


const serviceAccount = require('./mild-care-client-firebase-adminsdk.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


app.use(cors());
app.use(express.json());
const bodyParser = require('express');
app.use(bodyParser.urlencoded({ extended: true }));
const { MongoClient } = require('mongodb');
const { urlencoded } = require('express');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nzkru.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch {
        }
    }
    next();
}

async function run() {
    try {
        await client.connect();
        console.log('database connected successfully');
        const database = client.db('kids_shop');
        const productsCollection = database.collection('products');
        const userOrderCollection = database.collection('user_Order');
        const usersCollection = database.collection('users');

        //save user information into database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            //console.log(result);
            res.json(result);
        });
        // get all products
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            //console.log(products);
            res.send(products);
        });
        // get single products by clicking Buy botton
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
            //console.log(product);
        });
        //post new products by admin
        app.post('/products', async (req, res) => {
            const user = req.body;
            const product = await productsCollection.insertOne(user);
            res.send(product);
        })
        // post userOrder to the server by user for purchasing single product
        app.post('/userOrder', async (req, res) => {
            const user = req.body;
            //console.log('hit the post api', user);
            const result = await userOrderCollection.insertOne(user);
            //console.log(result);
            res.send(result);
        });
        // get all person userOrder
        app.get('/userOrder', async (req, res) => {
            const cursor = userOrderCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        });
        // get single person UserOrder
        app.get('/userOrder/:email', async (req, res) => {
            const query = { email: req.params.email };
            const user = await userOrderCollection.find(query).toArray();
            res.json(user);
        });
        // make admin from a user
        app.put('/users/admin', verifyToken, async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    //console.log('put', user);
                    const filter = { email: user.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'you do not have access to make admin' })
            }
        });
        //
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
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