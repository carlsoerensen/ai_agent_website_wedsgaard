// Client configuration interface for multi-tenant widget system
export interface ClientConfig {
  // Unique client identifier (used in URL path)
  id: string;
  
  // Branding
  companyName: string;
  subtitle: string;
  logoUrl: string;
  
  // Theming
  primaryColor: string;
  
  // Messages
  welcomeMessage: string;
  popupMessage: string;
  
  // n8n Integration
  webhookUrl: string;
  
  // Security - domains where widget is allowed to run
  allowedDomains: string[];
}
