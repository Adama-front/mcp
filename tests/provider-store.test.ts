import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { saveNewProviders } from "../src/infrastructure/provider-store.js";
import type { Provider } from "../src/domain/providers.js";

describe("saveNewProviders", () => {
  let directory: string;
  let filePath: string;

  const existingProvider: Provider = {
    id: "existing-001",
    name: "Électricien existant",
    category: "Électricien",
    city: "Bondoukou",
    source: "business_owner",
    verificationStatus: "verified",
    updatedAt: "2026-10-23T10:00:00.000Z",
  };

  const newProvider: Provider = {
    id: "new-001",
    name: "Nouveau plombier",
    category: "Plombier",
    city: "Bondoukou",
    source: "imported_file",
    verificationStatus: "pending",
    updatedAt: "2026-10-24T10:00:00.000Z",
  };

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "bondoukou-test-"));
    filePath = join(directory, "providers.json");

    await writeFile(
      filePath,
      JSON.stringify([existingProvider], null, 2),
      "utf8",
    );
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it("ajoute un nouveau prestataire sans perdre les anciens", async () => {
    const result = await saveNewProviders([newProvider], filePath);
    const saved = JSON.parse(await readFile(filePath, "utf8")) as Provider[];

    expect(result.added).toHaveLength(1);
    expect(saved).toHaveLength(2);
    expect(saved.map((provider) => provider.id)).toEqual([
      "existing-001",
      "new-001",
    ]);
  });

  it("refuse un identifiant déjà enregistré", async () => {
    const result = await saveNewProviders([existingProvider], filePath);
    const saved = JSON.parse(await readFile(filePath, "utf8")) as Provider[];

    expect(result.added).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(saved).toHaveLength(1);
  });

  it("ne modifie pas le fichier si le JSON existant est invalide", async () => {
    const invalidContent = "{ JSON invalide";
    await writeFile(filePath, invalidContent, "utf8");

    await expect(saveNewProviders([newProvider], filePath)).rejects.toThrow();

    expect(await readFile(filePath, "utf8")).toBe(invalidContent);
  });
});
