import { type User, type InsertUser } from "@shared/schema";
import { db } from "./firebase";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class FirebaseStorage implements IStorage {
  constructor() {}

  async getUser(id: number): Promise<User | undefined> {
    try {
      const userDoc = await db.collection('users').doc(id.toString()).get();
      if (!userDoc.exists) {
        return undefined;
      }
      return { id, ...userDoc.data() } as User;
    } catch (error) {
      console.error("Error getting user from Firestore:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('username', '==', username).limit(1).get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const doc = snapshot.docs[0];
      return { id: parseInt(doc.id), ...doc.data() } as User;
    } catch (error) {
      console.error("Error getting user by username from Firestore:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Get a new ID
      const counterDoc = await db.collection('counters').doc('users').get();
      let nextId = 1;
      
      if (counterDoc.exists) {
        nextId = (counterDoc.data()?.value || 0) + 1;
      }
      
      // Update counter
      await db.collection('counters').doc('users').set({ value: nextId });
      
      // Create user with the ID
      const userRef = db.collection('users').doc(nextId.toString());
      await userRef.set({
        ...insertUser,
        createdAt: new Date().toISOString()
      });
      
      // Return the created user
      const user: User = { ...insertUser, id: nextId };
      return user;
    } catch (error) {
      console.error("Error creating user in Firestore:", error);
      throw error;
    }
  }
}

export const storage = new FirebaseStorage();
