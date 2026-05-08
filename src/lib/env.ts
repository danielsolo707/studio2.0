export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment variable ${name} is required in production`);
    }
    
    console.warn(`⚠️  Environment variable ${name} not set, using development defaults`);
    return '';
  }
  
  return value;
}

export function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  
  return value;
}

// Environment configuration
export const config = {
  // Database
  mongodbUri: getEnvVar('MONGODB_URI', 'mongodb://127.0.0.1:27017/portfolio'),
  mongodbDb: getEnvVar('MONGODB_DB', 'portfolio'),
  
  // Authentication
  adminSessionSecret: getEnvVar('ADMIN_SESSION_SECRET', 'dev-secret-change-me'),
  
  // Email
  resendApiKey: getEnvVar('RESEND_API_KEY', ''),
  resendFrom: getEnvVar('RESEND_FROM', ''),
  resendTo: getEnvVar('RESEND_TO', ''),
  
  // 2FA
  totpSecret: getEnvVar('TOTP_SECRET', ''),

  // CAPTCHA (Cloudflare Turnstile)
  turnstileSiteKey: getEnvVar('TURNSTILE_SITE_KEY', ''),
  turnstileSecretKey: getEnvVar('TURNSTILE_SECRET_KEY', ''),
};

// Validate critical environment variables in production
export function validateEnvironment(): void {
  if (process.env.NODE_ENV === 'production') {
    const requiredVars = [
      'MONGODB_URI',
      'ADMIN_SESSION_SECRET'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}
