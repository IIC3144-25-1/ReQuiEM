import mongoose from "mongoose";

const connection: {isConnected?: number } = {}

const MONGODB_URI = process.env.MONGODB_URI || "";

async function dbConnect() {
    if(connection.isConnected) {
        return;
    }

    const db = await mongoose.connect(MONGODB_URI);

    connection.isConnected = db.connections[0].readyState;
}

export default dbConnect;
