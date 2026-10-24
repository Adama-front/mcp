import { describe, expect, it } from "vitest";

import { filterExistingProviders } from "../src/application/import/filter-existing-providers.js";
import { ProviderSchema } from "../src/domain/providers.js";

const existingProvider = ProviderSchema.parse({
  id: "provider-001",
  name: "Adama",
  category: "Électricien",
  city: "Bondoukou",
  source: "business_owner",
  verificationStatus: "verified",
  updatedAt: "2026-10-23T10:00:00.000Z",
});

const importedProvider = ProviderSchema.parse({
  id: "provider-001",
  name: "Mariam",
  category: "Plombier",
  city: "Bondoukou",
  source: "imported_file",
  verificationStatus: "pending",
  updatedAt: "2026-10-23T10:00:00.000Z",
});

const newProvider = ProviderSchema.parse({
  id: "provider-002",
  name: "Koffi",
  category: "Mécanicien",
  city: "Bondoukou",
  source: "imported_file",
  verificationStatus: "pending",
  updatedAt: "2026-10-23T10:00:00.000Z",
});

describe("filterExistingProviders", () => {
  it("rejette un identifiant déjà enregistré", () => {
    const result = filterExistingProviders(
      [importedProvider],
      [existingProvider],
    );

    expect(result.providers).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.message).toContain("provider-001");
  });

  it("accepte un nouvel identifiant", () => {
    const result = filterExistingProviders([newProvider], [existingProvider]);

    expect(result.providers).toHaveLength(1);
    expect(result.providers[0]?.id).toBe("provider-002");
    expect(result.errors).toHaveLength(0);
  });

  it("ne conserve qu'une occurrence d'un même identifiant importé", () => {
    const result = filterExistingProviders([newProvider, newProvider], []);

    expect(result.providers).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
  });
});
