// Lỗi 404
const notFound = (req, res, next) => {
    const error = new Error(`Not found : ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Logger lỗi
const errorHandler = (err, req, res, next) => {
    console.log('ERROR LOG ', new Date().toLocaleString());
    console.log('Request:', req.method, req.originalUrl);
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    console.log('Query:', req.query);
    console.log('Error: ', err);
    console.log('Error stack: ', err.stack);
    console.log('--------------------------------------------------------------------------------------');

    const messageError = err.messageObject || err.message;

    const error = {
        status: 'Error',
        error: messageError,
    };

    const status = err.status || 400;

    return res.status(status).json(error);
};

export { errorHandler, notFound };
