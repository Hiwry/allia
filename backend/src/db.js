import mongoose from 'mongoose';

console.log('MONGODB_URI:', process.env.MONGODB_URI); 

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB', err);
    process.exit(1);
  }
};

export default connectDB;
