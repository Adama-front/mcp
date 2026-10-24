import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { importProvidersCsv } from "../src/application/import/import-providers-csv.js";
import { saveNewProviders } from "../src/infrastructure/provider-store.js";

describe("Import CSV et sauvegarde intégrée", () => {
  it("valide les prestataires, ignore les doublons et préserve les données", async () => {
    const directory = await mkdtemp(join(tmpdir(), "bondoukou-integration-"));
    const filePath = join(directory, "providers.json");

    try {
      await writeFile(
        filePath,
        JSON.stringify([
          {
            id: "existing-001",
            name: "Électricien existant",
            category: "Électricien",
            city: "Bondoukou",
            source: "business_owner",
            verificationStatus: "verified",
            updatedAt: "2026-10-23T10:00:00.000Z",
          },
        ]),
        "utf8",
      );

      const csv = [
        "id,name,category,city",
        "existing-001,Électricien existant,Électricien,Bondoukou",
        "new-001,Nouveau plombier,Plombier,Bondoukou",
      ].join("\n");

      const importResult = importProvidersCsv(csv, "2026-10-24T10:00:00.000Z");

      expect(importResult.providers).toHaveLength(2);
      expect(importResult.errors).toHaveLength(0);

      const saveResult = await saveNewProviders(
        importResult.providers,
        filePath,
      );

      const saved = JSON.parse(await readFile(filePath, "utf8")) as Array<{
        id: string;
        verificationStatus: string;
      }>;

      expect(saveResult.added.map((provider) => provider.id)).toEqual([
        "new-001",
      ]);
      expect(saveResult.errors).toHaveLength(1);
      expect(saved).toHaveLength(2);
      expect(saved[0].verificationStatus).toBe("verified");
      expect(saved[1].verificationStatus).toBe("pending");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
