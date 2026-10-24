import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { ProviderSchema, type Provider } from "../domain/providers.js";

const DATA_FILE = resolve(process.cwd(), "data", "providers.json");

export async function getProviders(): Promise<Provider[]> {
  const content = await readFile(DATA_FILE, "utf8");
  const data: unknown = JSON.parse(content);

  return ProviderSchema.array().parse(data);
}
