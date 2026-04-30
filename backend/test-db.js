const mongoose = require('mongoose');
const uri = 'mongodb+srv://stevemishra1414_db_user:random@cluster0.qubcgti.mongodb.net/?appName=Cluster0';

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Connection error:', err);
    process.exit(1);
  });
