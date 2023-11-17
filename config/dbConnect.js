import mongoose from 'mongoose';

const dbConnect = () => {
    try {
        const db_url = process.env.MONGODB_URL || 'mongodb://localhost:27017/FishStore';
        const conn = mongoose.connect(db_url);
        console.log('Connected to database !');
    } catch (error) {
        console.log('Error connecting to database');
    }
};

export default dbConnect;
