// Test setup helper for browser checks: run SQL against the e2e database (like the service tests' direct inserts).
import { DatabaseSync } from "node:sqlite";
const [file, ...statements] = process.argv.slice(2);
const db = new DatabaseSync(file);
for (const sql of statements) db.exec(sql);
db.close();
