import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { importProvidersCsv } from "../src/application/import/import-providers-csv.js";
import { saveNewProviders } from "../src/infrastructure/provider-store.js";

function getArgumentValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const writeEnabled = process.argv.includes("--write");
  const confirmed = process.argv.includes("--confirm-real-data");
  const requestedFile =
    getArgumentValue("--file") ?? "imports/incoming/demo-providers.csv";
  const csvFile = resolve(process.cwd(), requestedFile);

  if (writeEnabled && !confirmed) {
    throw new Error(
      "Écriture refusée : ajoutez --confirm-real-data après avoir vérifié le CSV.",
    );
  }

  if (
    writeEnabled &&
    basename(csvFile).toLowerCase() === "demo-providers.csv"
  ) {
    throw new Error(
      "Écriture refusée : demo-providers.csv est réservé aux tests.",
    );
  }

  const content = await readFile(csvFile, "utf8");
  const importResult = importProvidersCsv(content);

  console.log("=== RAPPORT D'IMPORT ===");
  console.log(`Fichier : ${csvFile}`);
  console.log(`Prestataires valides : ${importResult.providers.length}`);
  console.log(`Erreurs de validation : ${importResult.errors.length}`);

  if (importResult.errors.length > 0) {
    console.log("\n=== ERREURS DE VALIDATION ===");
    console.log(JSON.stringify(importResult.errors, null, 2));
  }

  if (!writeEnabled) {
    console.log("\nMODE SIMULATION : aucune donnée enregistrée.");
    return;
  }

  if (importResult.providers.length === 0) {
    console.log("\nAucun prestataire valide à enregistrer.");
    return;
  }

  const result = await saveNewProviders(importResult.providers);

  console.log("\n=== RÉSULTAT DE LA SAUVEGARDE ===");
  console.log(`Prestataires ajoutés : ${result.added.length}`);
  console.log(`Doublons refusés : ${result.errors.length}`);
}

main().catch((error: unknown) => {
  console.error("Échec de l'import CSV :", error);
  process.exitCode = 1;
});
