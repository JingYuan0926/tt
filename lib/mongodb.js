import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so the connection
  // is not repeatedly created during hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Export the database connection function
export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db('TeaTime');
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

// Export collections for easy access
export async function getUsersCollection() {
  const { db } = await connectToDatabase();
  return db.collection('users');
}

export async function getNewsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('news');
}

export default clientPromise; 