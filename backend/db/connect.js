import mongoose from "mongoose";

export const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Connected to DB!");
  } catch (err) {
    console.log(err);
  }
};
