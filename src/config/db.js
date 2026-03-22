const mongoose = require('mongoose');


const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'sportecommerce';

    // Construct full connection URL with database name
    const fullURI = `${mongoURI}${dbName}`;

    const connection = await mongoose.connect(fullURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected successfully`);
    console.log(` Database: ${dbName}`);
    console.log(` Host: ${connection.connection.host}`);

    return connection;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
