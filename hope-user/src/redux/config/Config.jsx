/**
 * @file Config.utility.js
 * @module Core/Configuration
 * @description
 * Single source of truth for environment-specific application configuration.
 *
 * Centralizes critical settings such as:
 * - Backend API base URL (switches between local development and production environments)
 * - Future extensibility for other service endpoints, feature flags, or app constants
 *
 * Usage pattern:
 * - Import and use CONFIG.BACKEND_API_URL in all API service layers
 * - Easily toggle between local dev server and deployed production backend
 *   by commenting/uncommenting the appropriate line
 */

const CONFIG = {

  /** 
  1- open cmd or powershell  
  2- type ipconfig
  3- navigate below and copy ipv4 address
  4- paste your ipv4 address in place of 192.168.1.8 below
  */

  /** For localhost Backend API Url */
  BACKEND_API_URL: 'http://192.168.1.8:8000/api',
  
  /** For Live Production Backend API Url */
  // BACKEND_API_URL: 'https://the-hope-backend.vercel.app/api',
};

export default CONFIG;
