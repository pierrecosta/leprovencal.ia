// ===== URL Validation =====

/**
 * Validates if a string is a valid URL
 * @param url - URL to validate
 * @param required - If true, empty string is invalid
 * @returns true if valid URL or empty (when not required)
 */
export function isValidUrl(url: string, required = false): boolean {
  if (!url) return !required; // Empty is valid only if not required
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if URL protocol is allowed (http/https only)
 * @param url - URL to validate
 * @returns true if protocol is http or https
 */
export function isValidUrlProtocol(url: string): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validates iframe URL against whitelist (localhost only in dev)
 * @param url - URL to validate
 * @returns true if allowed
 */
export function isAllowedIframeUrl(url: string): boolean {
  if (!url) return true; // Empty is allowed (optional field)
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    // Allow only localhost with ports 3000, 5173, 4173, or 8000 (dev environment)
    if (parsed.hostname === 'localhost' && ['3000', '5173', '4173', '8000'].includes(parsed.port)) {
      return true;
    }
    // In production, add more allowed domains here
    return false;
  } catch {
    return false;
  }
}

// ===== File Validation =====

/**
 * Validates image file size and type
 * @param file - File to validate
 * @param maxBytes - Maximum file size in bytes (default 2MB)
 * @returns Object with isValid boolean and error message
 */
export function validateImageFile(
  file: File | null,
  maxBytes: number = 2 * 1024 * 1024
): { isValid: boolean; error: string | null } {
  if (!file) {
    return { isValid: true, error: null }; // No file is valid (optional)
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Type de fichier non supporté. Types acceptés: ${validTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > maxBytes) {
    const maxMB = (maxBytes / (1024 * 1024)).toFixed(1);
    const fileMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Fichier trop volumineux (${fileMB}MB). Taille maximale: ${maxMB}MB`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates if image file is valid
 * @param file - File to validate
 * @param maxBytes - Maximum file size in bytes
 * @returns true if valid
 */
export function isValidImageFile(file: File | null, maxBytes: number = 2 * 1024 * 1024): boolean {
  return validateImageFile(file, maxBytes).isValid;
}

// ===== Text Validation =====

/**
 * Validates if a string is not empty after trimming
 * @param value - String to validate
 * @param fieldName - Name of field for error message
 * @returns Error message or null if valid
 */
export function validateRequired(value: string | undefined | null, fieldName = 'Ce champ'): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} est obligatoire.`;
  }
  return null;
}

/**
 * Validates string length
 * @param value - String to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @param fieldName - Name of field for error message
 * @returns Error message or null if valid
 */
export function validateLength(
  value: string | undefined | null,
  minLength: number,
  maxLength: number,
  fieldName = 'Ce champ'
): string | null {
  if (!value) return null; // Skip if empty (use validateRequired for that)
  
  if (value.length < minLength) {
    return `${fieldName} doit contenir au moins ${minLength} caractères.`;
  }
  
  if (value.length > maxLength) {
    return `${fieldName} ne peut pas dépasser ${maxLength} caractères.`;
  }
  
  return null;
}

// ===== Formatting =====

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Formats file size in human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
