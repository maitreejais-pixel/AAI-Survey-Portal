import { openDatabaseSync } from "expo-sqlite";

export const db = openDatabaseSync("offline.db");

export const initDB = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT,
      synced INTEGER
    );
  `);
};
