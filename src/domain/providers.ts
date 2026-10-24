import * as z from "zod/v4";

export const ProviderSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  category: z.string().min(2),
  city: z.string().default("Bondoukou"),
  neighborhood: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  source: z.enum([
    "business_owner",
    "field_visit",
    "public_directory",
    "imported_file",
  ]),
  verificationStatus: z.enum(["pending", "verified", "rejected"]),
  updatedAt: z.string().datetime(),
});

export type Provider = z.infer<typeof ProviderSchema>;
