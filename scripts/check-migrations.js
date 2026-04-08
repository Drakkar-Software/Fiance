#!/usr/bin/env node
/**
 * Validates migration SQL files for common errors:
 *   - Duplicate ALTER TABLE … ADD COLUMN (same table+column applied twice)
 *   - CREATE TABLE without IF NOT EXISTS for a table already created earlier
 *
 * Usage: node scripts/check-migrations.js
 *        pnpm check:migrations
 */

const fs = require("fs");
const path = require("path");

const MIGRATIONS_DIR = path.join(__dirname, "..", "db", "migrations");

// Only .sql files in the root migrations dir, sorted by name
const files = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql") && !f.includes("anglicize"))
  .sort();

/** @type {Map<string, {file: string, line: number}>} key = "table:column" */
const addedColumns = new Map();
/** @type {Map<string, {file: string, line: number}>} key = table name */
const createdTables = new Map();

let errors = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
  const lines = content.split("\n");

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    const lineNo = idx + 1;

    // ALTER TABLE `t` ADD COLUMN `col` …
    const alterMatch = line.match(
      /^ALTER\s+TABLE\s+[`"']?(\w+)[`"']?\s+ADD\s+COLUMN\s+[`"']?(\w+)[`"']?/i,
    );
    if (alterMatch) {
      const key = `${alterMatch[1]}:${alterMatch[2]}`;
      if (addedColumns.has(key)) {
        const prev = addedColumns.get(key);
        console.error(
          `ERROR  ${file}:${lineNo} — duplicate ALTER TABLE ${alterMatch[1]} ADD COLUMN ${alterMatch[2]}` +
            ` (first seen in ${prev.file}:${prev.line})`,
        );
        errors++;
      } else {
        addedColumns.set(key, { file, line: lineNo });
      }
    }

    // CREATE TABLE (without IF NOT EXISTS)
    const createMatch = line.match(
      /^CREATE\s+TABLE\s+(?!IF\s+NOT\s+EXISTS)[`"']?(\w+)[`"']?/i,
    );
    if (createMatch) {
      const table = createMatch[1];
      if (createdTables.has(table)) {
        const prev = createdTables.get(table);
        console.error(
          `ERROR  ${file}:${lineNo} — CREATE TABLE ${table} without IF NOT EXISTS` +
            ` (table first created in ${prev.file}:${prev.line})`,
        );
        errors++;
      } else {
        createdTables.set(table, { file, line: lineNo });
      }
    }

    // CREATE TABLE IF NOT EXISTS — just record first occurrence
    const createIfMatch = line.match(
      /^CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+[`"']?(\w+)[`"']?/i,
    );
    if (createIfMatch) {
      const table = createIfMatch[1];
      if (!createdTables.has(table)) {
        createdTables.set(table, { file, line: lineNo });
      }
    }
  });
}

if (errors === 0) {
  console.log(`✓ All ${files.length} migration files look clean.`);
  process.exit(0);
} else {
  console.error(`\nFound ${errors} error(s) across ${files.length} migration files.`);
  process.exit(1);
}
