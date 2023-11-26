import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';

import dbConnect from '~/config/dbConnect.js';
import { errorHandler, notFound } from '~/middlewares/errorHandler';

// Routes
import { productRoute, categoryRoute, brandRoute, supplierRoute } from '~/routes/';

// Connect to database
dbConnect();

// Application
const app = express();

// Config
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Route handlers
app.use('/api/product', productRoute);
app.use('/api/category', categoryRoute);
app.use('/api/brand', brandRoute);
app.use('/api/supplier', supplierRoute);

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Error handler
app.use(errorHandler);
app.use(notFound);

// Port & Host name
const port = process.env.PORT || 3333;
const hostName = process.env.HOST_NAME || 'localhost';

app.listen(port, () => console.log(`App running at ${hostName}:${port}`));
