import type { ClientConfig } from './types';

// Import all client configs statically for Next.js compatibility
// This ensures configs are bundled and available at runtime
import wedsgaardConfig from '../clients/wedsgaard.json';
import moerupConfig from '../clients/moerup.json';

// Registry of all client configs
const clientConfigs: Record<string, ClientConfig> = {
  wedsgaard: wedsgaardConfig as ClientConfig,
  moerup: moerupConfig as ClientConfig,
};

/**
 * Get client configuration by ID
 * @param clientId - The unique client identifier
 * @returns ClientConfig if found, null otherwise
 */
export function getClientConfig(clientId: string): ClientConfig | null {
  return clientConfigs[clientId] || null;
}

/**
 * Get all available client IDs
 * @returns Array of client IDs
 */
export function getAllClientIds(): string[] {
  return Object.keys(clientConfigs);
}

/**
 * Check if an origin/domain is allowed for a specific client
 * @param config - The client configuration
 * @param origin - The origin URL to check
 * @returns true if the origin is allowed
 */
export function isAllowedDomain(config: ClientConfig, origin: string): boolean {
  if (!origin) return false;
  
  return config.allowedDomains.some(domain => {
    // Handle both full URLs and domain-only checks
    const normalizedOrigin = origin.toLowerCase();
    const normalizedDomain = domain.toLowerCase();
    
    return normalizedOrigin.includes(normalizedDomain);
  });
}

/**
 * Find client config by checking if origin matches any client's allowed domains
 * @param origin - The origin URL to match
 * @returns ClientConfig if found, null otherwise
 */
export function getClientByOrigin(origin: string): ClientConfig | null {
  for (const config of Object.values(clientConfigs)) {
    if (isAllowedDomain(config, origin)) {
      return config;
    }
  }
  return null;
}
