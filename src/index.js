import 'dotenv/config';
import express from 'express';
import dbConnect from './config/dbConnect.js';
import test from '~controller/testController.js';

const app = express();
console.log(test);

// Connect to database
dbConnect();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Port & Host name
const port = process.env.PORT || 3333;
const hostName = process.env.HOST_NAME || 'localhost';

app.listen(port, () => console.log(`App ruuning at ${hostName}:${port}`));
