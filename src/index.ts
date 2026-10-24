import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

import { searchProviders } from "./application/search-providers.js";
import { getProviders } from "./infrastructure/provider-store.js";

function createServer() {
  const server = new McpServer({
    name: "bondoukou-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "search_providers",
    {
      description:
        "Recherche des prestataires par métier et ville à Bondoukou.",
      inputSchema: z.object({
        service: z.string().optional().describe("Métier recherché"),
        city: z.string().default("Bondoukou").describe("Ville recherchée"),
        includeUnverified: z
          .boolean()
          .default(false)
          .describe("Inclure les prestataires non vérifiés"),
      }),
    },
    async ({ service, city, includeUnverified }) => {
      const providers = await getProviders();

      const results = searchProviders(providers, {
        service,
        city,
        includeUnverified,
      });

      return {
        content: [
          {
            type: "text",
            text:
              results.length > 0
                ? JSON.stringify(results, null, 2)
                : "Aucun prestataire correspondant dans les données locales.",
          },
        ],
      };
    },
  );

  return server;
}

void serveStdio(createServer);
