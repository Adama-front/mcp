import { randomUUID } from "node:crypto";
import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

import { filterExistingProviders } from "../application/import/filter-existing-providers.js";
import { ProviderSchema, type Provider } from "../domain/providers.js";

const DATA_FILE = resolve(process.cwd(), "data", "providers.json");

export async function getProviders(
  filePath: string = DATA_FILE,
): Promise<Provider[]> {
  const content = await readFile(filePath, "utf8");
  const data: unknown = JSON.parse(content);

  return ProviderSchema.array().parse(data);
}

export async function saveNewProviders(
  importedProviders: Provider[],
  filePath: string = DATA_FILE,
): Promise<{
  added: Provider[];
  errors: { line: number; message: string }[];
}> {
  const existingProviders = await getProviders(filePath);

  const filtered = filterExistingProviders(
    importedProviders,
    existingProviders,
  );

  if (filtered.providers.length === 0) {
    return {
      added: [],
      errors: filtered.errors,
    };
  }

  const updatedProviders = [...existingProviders, ...filtered.providers];

  const temporaryFile = resolve(
    dirname(filePath),
    `.${basename(filePath)}.${randomUUID()}.tmp`,
  );

  try {
    await writeFile(
      temporaryFile,
      `${JSON.stringify(updatedProviders, null, 2)}\n`,
      { encoding: "utf8", flag: "wx" },
    );

    await rename(temporaryFile, filePath);
  } catch (error: unknown) {
    await unlink(temporaryFile).catch(() => undefined);
    throw error;
  }

  return {
    added: filtered.providers,
    errors: filtered.errors,
  };
}
