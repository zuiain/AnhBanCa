import 'dotenv/config';
import express from 'express';
import dbConnect from './config/dbConnect.js';

const app = express();

// Connect to database
dbConnect();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Port number
const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`App listening on port ${port} !`));
