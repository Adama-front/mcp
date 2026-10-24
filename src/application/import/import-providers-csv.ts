import { parse } from "csv-parse/sync";

import { ProviderSchema, type Provider } from "../../domain/providers.js";

export interface CsvImportError {
  line: number;
  message: string;
}

export interface CsvImportResult {
  providers: Provider[];
  errors: CsvImportError[];
}

export function importProvidersCsv(
  content: string,
  now: string = new Date().toISOString(),
): CsvImportResult {
  const providers: Provider[] = [];
  const errors: CsvImportError[] = [];

  let rows: Record<string, string>[];

  try {
    rows = parse(content, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
      relax_column_count: false,
    }) as Record<string, string>[];
  } catch (error: unknown) {
    return {
      providers,
      errors: [
        {
          line: 1,
          message:
            error instanceof Error ? error.message : "Fichier CSV invalide.",
        },
      ],
    };
  }

  const seenIds = new Set<string>();

  rows.forEach((row, index) => {
    const line = index + 2;
    const id = row.id?.trim();

    if (id && seenIds.has(id)) {
      errors.push({
        line,
        message: `Identifiant dupliqué : ${id}`,
      });
      return;
    }

    if (id) {
      seenIds.add(id);
    }

    const provider = ProviderSchema.safeParse({
      id,
      name: row.name,
      category: row.category,
      city: row.city || "Bondoukou",
      neighborhood: row.neighborhood || undefined,
      phone: row.phone || undefined,
      address: row.address || undefined,
      source: "imported_file",
      verificationStatus: "pending",
      updatedAt: now,
    });

    if (!provider.success) {
      errors.push({
        line,
        message: provider.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; "),
      });
      return;
    }

    providers.push(provider.data);
  });

  return { providers, errors };
}
