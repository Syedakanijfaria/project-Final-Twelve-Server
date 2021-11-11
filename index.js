const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;

require('dotenv').config();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`final server for assign, port: ${port}`)
})