import type { Provider } from "../../domain/providers.js";
import type { CsvImportError } from "./import-providers-csv.js";

export interface FilterExistingProvidersResult {
  providers: Provider[];
  errors: CsvImportError[];
}

export function filterExistingProviders(
  importedProviders: Provider[],
  existingProviders: Provider[],
): FilterExistingProvidersResult {
  const existingIds = new Set(existingProviders.map((provider) => provider.id));

  const accepted: Provider[] = [];
  const errors: CsvImportError[] = [];

  importedProviders.forEach((provider, index) => {
    if (existingIds.has(provider.id)) {
      errors.push({
        line: index + 2,
        message: `Identifiant déjà enregistré : ${provider.id}`,
      });
      return;
    }

    existingIds.add(provider.id);
    accepted.push(provider);
  });

  return { providers: accepted, errors };
}
