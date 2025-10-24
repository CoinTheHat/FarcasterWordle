// This file is no longer used - database operations are handled in server/db.ts
// Keeping this file for backwards compatibility

export interface IStorage {
  // Empty interface - no longer in use
}

export class MemStorage implements IStorage {
  constructor() {
    // Empty - no longer in use
  }
}

export const storage = new MemStorage();
