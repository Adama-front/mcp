import { describe, expect, it } from "vitest";

import { ProviderSchema } from "../src/domain/providers.js";
import { searchProviders } from "../src/application/search-providers.js";

const providers = [
  ProviderSchema.parse({
    id: "test-001",
    name: "Prestataire de test",
    category: "Électricien",
    city: "Bondoukou",
    source: "imported_file",
    verificationStatus: "verified",
    updatedAt: "2026-10-23T10:00:00.000Z",
  }),
  ProviderSchema.parse({
    id: "test-002",
    name: "Autre prestataire de test",
    category: "Plombier",
    city: "Bondoukou",
    source: "imported_file",
    verificationStatus: "pending",
    updatedAt: "2026-10-23T10:00:00.000Z",
  }),
];

describe("searchProviders", () => {
  it("trouve un prestataire correspondant au métier et à la ville", () => {
    const results = searchProviders(providers, {
      service: "Électricien",
      city: "Bondoukou",
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("test-001");
  });

  it("ne retourne rien si le métier ne correspond pas", () => {
    const results = searchProviders(providers, {
      service: "Mécanicien",
      city: "Bondoukou",
    });

    expect(results).toHaveLength(0);
  });

  it("ne retourne rien si la ville ne correspond pas", () => {
    const results = searchProviders(providers, {
      service: "Électricien",
      city: "Abidjan",
    });

    expect(results).toHaveLength(0);
  });

  it("exclut les prestataires non vérifiés par défaut", () => {
    const results = searchProviders(providers, {
      city: "Bondoukou",
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.verificationStatus).toBe("verified");
  });

  it("inclut les prestataires non vérifiés si demandé", () => {
    const results = searchProviders(providers, {
      city: "Bondoukou",
      includeUnverified: true,
    });

    expect(results).toHaveLength(2);
  });
});
