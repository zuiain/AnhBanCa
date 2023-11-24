import mongoose from 'mongoose';

const validateMongoDBId = function (id) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
        throw new Error('ID is not valid');
    }
};

export default validateMongoDBId;
