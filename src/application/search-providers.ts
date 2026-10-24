import type { Provider } from "../domain/providers.js";

export interface SearchProvidersCriteria {
  service?: string;
  city?: string;
  includeUnverified?: boolean;
}

export function searchProviders(
  providers: Provider[],
  criteria: SearchProvidersCriteria,
): Provider[] {
  const { service, city = "Bondoukou", includeUnverified = false } = criteria;

  return providers.filter((provider) => {
    const matchesService =
      !service ||
      provider.category.toLowerCase().includes(service.toLowerCase());

    const matchesCity = provider.city.toLowerCase() === city.toLowerCase();

    const matchesVerification =
      includeUnverified || provider.verificationStatus === "verified";

    return matchesService && matchesCity && matchesVerification;
  });
}
