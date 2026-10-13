#!/usr/bin/env node
// Fails when a namespace file under i18n/locales is missing in one language,
// or when a key path exists in one language and not the other (nested keys are
// compared as dotted paths, e.g. "tabs.home").
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LANGUAGES = ["fr", "en"];

// Intentional one-sided keys, written as "<namespace>:<dotted.key>" (for example
// "common:legacyLabel"). Empty on purpose: every key must exist in both
// languages. Add an entry only with a reason on the same line, and remove it as
// soon as the missing side is translated.
export const PARITY_EXCEPTIONS = new Set([]);

export function flattenKeys(value, prefix = "") {
  if (value !== null && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0) {
    return Object.entries(value).flatMap(([key, child]) => flattenKeys(child, prefix ? `${prefix}.${key}` : key));
  }
  return [prefix];
}

function listJsonFiles(dir) {
  return readdirSync(dir).filter((file) => file.endsWith(".json"));
}

export function checkLocaleParity(localesDir, exceptions = PARITY_EXCEPTIONS) {
  const problems = [];

  for (const lang of LANGUAGES) {
    if (!existsSync(join(localesDir, lang))) {
      problems.push(`locale directory ${lang}/ is missing`);
    }
  }
  if (problems.length > 0) {
    return { namespaces: 0, problems };
  }

  const namespaceFiles = [...new Set(LANGUAGES.flatMap((lang) => listJsonFiles(join(localesDir, lang))))].sort();

  for (const file of namespaceFiles) {
    const namespace = file.replace(/\.json$/, "");
    const keysByLang = new Map();

    for (const lang of LANGUAGES) {
      const path = join(localesDir, lang, file);
      if (!existsSync(path)) {
        problems.push(`${lang}/${file} is missing`);
        continue;
      }
      keysByLang.set(lang, new Set(flattenKeys(JSON.parse(readFileSync(path, "utf8")))));
    }

    if (keysByLang.size !== LANGUAGES.length) {
      continue;
    }

    for (const lang of LANGUAGES) {
      const other = LANGUAGES.find((candidate) => candidate !== lang);
      for (const key of keysByLang.get(other)) {
        if (!keysByLang.get(lang).has(key) && !exceptions.has(`${namespace}:${key}`)) {
          problems.push(`${namespace}:${key} is missing in ${lang}`);
        }
      }
    }
  }

  return { namespaces: namespaceFiles.length, problems };
}

const isEntrypoint = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const localesDir = resolve(process.argv[2] ?? join(scriptDir, "..", "i18n", "locales"));
  const { namespaces, problems } = checkLocaleParity(localesDir);

  if (problems.length > 0) {
    console.error(`i18n FR/EN key parity failed (${problems.length} problem(s)):`);
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    process.exit(1);
  }

  console.log(`i18n FR/EN key parity OK: ${namespaces} namespaces checked.`);
}
