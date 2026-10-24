import { describe, expect, it } from "vitest";

import { importProvidersCsv } from "../src/application/import/import-providers-csv.js";

const NOW = "2026-10-23T10:00:00.000Z";

describe("importProvidersCsv", () => {
  it("importe un prestataire valide", () => {
    const csv = [
      "id,name,category,city",
      "p-001,Adama,Électricien,Bondoukou",
    ].join("\n");

    const result = importProvidersCsv(csv, NOW);

    expect(result.providers).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(result.providers[0]?.name).toBe("Adama");
  });

  it("utilise Bondoukou comme ville par défaut", () => {
    const csv = ["id,name,category", "p-001,Adama,Électricien"].join("\n");

    const result = importProvidersCsv(csv, NOW);

    expect(result.providers[0]?.city).toBe("Bondoukou");
  });

  it("laisse les prestataires importés en attente de vérification", () => {
    const csv = ["id,name,category", "p-001,Adama,Électricien"].join("\n");

    const result = importProvidersCsv(csv, NOW);

    expect(result.providers[0]?.source).toBe("imported_file");
    expect(result.providers[0]?.verificationStatus).toBe("pending");
  });

  it("rejette une ligne sans nom valide", () => {
    const csv = ["id,name,category", "p-001,A,Électricien"].join("\n");

    const result = importProvidersCsv(csv, NOW);

    expect(result.providers).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.line).toBe(2);
  });

  it("continue à importer les lignes valides si une ligne est invalide", () => {
    const csv = [
      "id,name,category",
      "p-001,Adama,Électricien",
      "p-002,A,Plombier",
      "p-003,Mariam,Mécanicien",
    ].join("\n");

    const result = importProvidersCsv(csv, NOW);

    expect(result.providers).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.line).toBe(3);
  });

  it("retourne une erreur pour un CSV mal formé", () => {
    const csv = '"id,name,category\np-001,Adama,Électricien';

    const result = importProvidersCsv(csv, NOW);

    expect(result.providers).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
  });

  it("rejette un identifiant présent deux fois dans le CSV", () => {
    const csv = [
      "id,name,category",
      "p-001,Adama,Électricien",
      "p-001,Mariam,Plombier",
    ].join("\n");

    const result = importProvidersCsv(csv, NOW);

    expect(result.providers).toHaveLength(1);
    expect(result.providers[0]?.name).toBe("Adama");
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.line).toBe(3);
  });
});
