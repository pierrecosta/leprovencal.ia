/**
 * Validation utilities
 * Centralized validation functions for forms and data
 */

export {
  isValidUrl,
  isValidUrlProtocol,
  isAllowedIframeUrl,
  validateImageFile,
  isValidImageFile,
  validateRequired,
  validateLength,
  formatDate,
  truncate,
  formatFileSize,
} from './helpers';

// Common validation constants
export const VALIDATION_CONSTANTS = {
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
} as const;

// Validation error messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: (fieldName: string) => `${fieldName} est obligatoire.`,
  INVALID_URL: "L'URL n'est pas valide.",
  INVALID_IMAGE_URL: "L'URL de l'image n'est pas valide.",
  INVALID_SOURCE_URL: "L'URL de la source n'est pas valide.",
  INVALID_IFRAME_URL: 'URL iframe non autorisée (localhost:3000/5173/4173/8000 uniquement).',
  IMAGE_TOO_LARGE: (maxMB: number) => `L'image ne peut pas dépasser ${maxMB}MB.`,
  INVALID_IMAGE_TYPE: 'Type de fichier non supporté. Formats acceptés: JPEG, PNG, GIF, WebP, SVG.',
  TITLE_TOO_LONG: (max: number) => `Le titre ne peut pas dépasser ${max} caractères.`,
  DESCRIPTION_TOO_LONG: (max: number) => `La description ne peut pas dépasser ${max} caractères.`,
  PASSWORD_TOO_SHORT: (min: number) => `Le mot de passe doit contenir au moins ${min} caractères.`,
} as const;
