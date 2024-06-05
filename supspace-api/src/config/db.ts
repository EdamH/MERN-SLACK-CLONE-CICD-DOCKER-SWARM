import mongoose from 'mongoose'

export default async function connectDB() {
  // try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME,
    })
    // console.log(`MongoDB connected: ${conn.connection.name}`)
  // } catch (error) {
  //   console.error(`Error: ${(error as Error).message}`)
  //   process.exit(1)
  }
// }
