import { readFile } from "node:fs/promises";

import { importProvidersCsv } from "../src/application/import/import-providers-csv.js";

const filePath = "imports/incoming/demo-providers.csv";

async function main(): Promise<void> {
  const content = await readFile(filePath, "utf8");

  const result = importProvidersCsv(content, "2026-10-23T12:00:00.000Z");

  console.log("=== PRESTATAIRES VALIDES ===");
  console.log(JSON.stringify(result.providers, null, 2));

  console.log("\n=== ERREURS ===");
  console.log(JSON.stringify(result.errors, null, 2));

  console.log("\n=== RÉSUMÉ ===");
  console.log(`Prestataires valides : ${result.providers.length}`);
  console.log(`Lignes en erreur : ${result.errors.length}`);
}

main().catch((error: unknown) => {
  console.error("Échec du test CSV :", error);
  process.exitCode = 1;
});
