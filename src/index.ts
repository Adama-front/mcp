import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

import { providers } from "./providers.js";

const server = new McpServer({
  name: "bondoukou-providers",
  version: "1.0.0",
});

server.registerTool(
  "search_providers",
  {
    description:
      "Recherche des prestataires par métier et ville. Peut filtrer les prestataires disponibles.",
    inputSchema: z.object({
      service: z
        .string()
        .optional()
        .describe("Métier recherché, par exemple electricien ou plombier"),
      city: z
        .string()
        .default("Bondoukou")
        .describe("Ville dans laquelle rechercher"),
      availableOnly: z
        .boolean()
        .default(true)
        .describe("Ne retourner que les prestataires disponibles"),
    }),
  },
  async ({ service, city, availableOnly }) => {
    const results = providers.filter((provider) => {
      const matchesService =
        !service || provider.service.toLowerCase() === service.toLowerCase();

      const matchesCity = provider.city.toLowerCase() === city.toLowerCase();

      const matchesAvailability = !availableOnly || provider.available;

      return matchesService && matchesCity && matchesAvailability;
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  },
);

await serveStdio(() => server);
