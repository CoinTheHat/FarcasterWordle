export const WORD_SALT = process.env.WORD_SALT || "";
export const DB_PATH = process.env.DB_PATH || "./data/app.db";
export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || "development";

if (!WORD_SALT) {
  console.warn("WARNING: WORD_SALT is not set. Using default value.");
}
