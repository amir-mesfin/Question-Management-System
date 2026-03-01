import mongoose from 'mongoose';
import Question from './src/models/Question.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/qms')
.then(async () => {
  try {
    const q = new Question({
      title: "Tell me about history",
      type: "Essay",
      difficulty: "Medium",
      category: "History",
      status: "Published",
      createdBy: new mongoose.Types.ObjectId()
    });
    await q.validate(); // triggers validation
    console.log("Validation Success!");
  } catch(e) {
    console.error("Validation Error:", e.message);
  } finally {
    mongoose.disconnect();
  }
});
