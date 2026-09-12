import mongoose from 'mongoose';

let cached = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('[DB] MONGODB_URI environment variable is not set. Add it to your .env file.');
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    }).then((m) => m);
  }

  cached.conn = await cached.promise;
  global.mongoose = cached;

  // Strict Production Topology Certification Enforcement:
  // Production MUST run on a MongoDB Replica Set to guarantee multi-document ACID transactions.
  if (process.env.NODE_ENV === 'production') {
    try {
      const adminDb = cached.conn.connection.db.admin();
      const status = await adminDb.command({ replSetGetStatus: 1 }).catch(() => null);
      if (!status || !status.ok) {
        throw new Error(
          '[FATAL] Production topology violation: MongoDB is not running as a Replica Set. ' +
          'Zulu-Jewels production deployment strictly requires MongoDB replica-set transaction support ' +
          'to prevent inventory and financial inconsistency across multi-document writes.'
        );
      }
    } catch (topoErr) {
      if (topoErr.message.includes('Production topology violation')) {
        throw topoErr;
      }
      // If replSetGetStatus is disallowed by user privileges or standalone, enforce fail-safe check
      console.warn('[DB] Replica set status check warning:', topoErr.message);
    }
  }

  return cached.conn;
}
