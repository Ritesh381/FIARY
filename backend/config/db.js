const mongoose = require("mongoose")
mongoose.set('toJSON', { getters: true });
mongoose.set('toObject', { getters: true });


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully! 🚀');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB