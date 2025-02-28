// src/utils/formatters.ts
/**
 * Utility functions for formatting data
 */

type DateFormat = 'short' | 'long' | 'relative' | 'datetime';

/**
 * Format a date string
 * @param dateString - ISO date string
 * @param format - desired format ('short', 'long', 'relative')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, format: DateFormat = 'short'): string => {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    switch (format) {
      case 'short':
        return date.toLocaleDateString();
      case 'long':
        return date.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'relative':
        return getRelativeTimeString(date);
      case 'datetime':
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      default:
        return date.toLocaleDateString();
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param date - Date object
 * @returns Relative time string
 */
export const getRelativeTimeString = (date: Date): string => {
  try {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Unknown time';
  }
};

/**
 * Format a file size
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  try {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  } catch (error) {
    console.error('Error formatting file size:', error);
    return 'Unknown size';
  }
};

/**
 * Truncate a string to a specified length
 * @param str - String to truncate
 * @param length - Maximum length
 * @returns Truncated string
 */
export const truncateString = (str?: string, length: number = 50): string => {
  try {
    if (!str) return '';
    
    if (str.length <= length) return str;
    
    return `${str.substring(0, length)}...`;
  } catch (error) {
    console.error('Error truncating string:', error);
    return str || '';
  }
};

/**
 * Format a URL for display
 * @param url - URL to format
 * @returns Formatted URL
 */
export const formatUrl = (url?: string): string => {
  try {
    if (!url) return '';
    
    // Remove protocol and www
    let formatted = url.replace(/^(https?:\/\/)?(www\.)?/i, '');
    
    // Remove trailing slashes
    formatted = formatted.replace(/\/+$/, '');
    
    // Truncate if too long
    return truncateString(formatted, 40);
  } catch (error) {
    console.error('Error formatting URL:', error);
    return url || '';
  }
};

/**
 * Format a truth score (add + or - prefix)
 * @param score - Truth score
 * @returns Formatted score
 */
export const formatScore = (score?: number): string => {
  try {
    if (typeof score !== 'number') return 'N/A';
    
    // Round to one decimal place
    const rounded = Math.round(score * 10) / 10;
    
    return `${rounded}`;
  } catch (error) {
    console.error('Error formatting score:', error);
    return 'N/A';
  }
};

// src/utils/validators.ts
/**
 * Validation utility functions
 */

/**
 * Validate a URL
 * @param url - URL to validate
 * @returns Whether URL is valid
 */
export const isValidUrl = (url?: string): boolean => {
  try {
    if (!url) return false;
    
    // Simple regex for URL validation
    const pattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
    
    return pattern.test(url);
  } catch (error) {
    console.error('Error validating URL:', error);
    return false;
  }
};

/**
 * Validate an email address
 * @param email - Email to validate
 * @returns Whether email is valid
 */
export const isValidEmail = (email?: string): boolean => {
  try {
    if (!email) return false;
    
    // Simple regex for email validation
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return pattern.test(email);
  } catch (error) {
    console.error('Error validating email:', error);
    return false;
  }
};

/**
 * Validate a file type
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns Whether file type is valid
 */
export const isValidFileType = (file: File | undefined, allowedTypes: string[]): boolean => {
  try {
    if (!file || !allowedTypes || !allowedTypes.length) return false;
    
    return allowedTypes.includes(file.type);
  } catch (error) {
    console.error('Error validating file type:', error);
    return false;
  }
};

/**
 * Validate a file size
 * @param file - File to validate
 * @param maxSize - Maximum size in bytes
 * @returns Whether file size is valid
 */
export const isValidFileSize = (file: File | undefined, maxSize: number): boolean => {
  try {
    if (!file || !maxSize) return false;
    
    return file.size <= maxSize;
  } catch (error) {
    console.error('Error validating file size:', error);
    return false;
  }
};

interface PasswordValidationOptions {
  minLength?: number;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
}

/**
 * Validate a password
 * @param password - Password to validate
 * @param options - Validation options
 * @returns Whether password is valid
 */
export const isValidPassword = (
  password?: string,
  options: PasswordValidationOptions = {}
): boolean => {
  try {
    if (!password) return false;
    
    const { minLength = 8, requireNumbers = true, requireSpecialChars = true } = options;
    
    // Check minimum length
    if (password.length < minLength) return false;
    
    // Check for numbers
    if (requireNumbers && !/\d/.test(password)) return false;
    
    // Check for special characters
    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    
    return true;
  } catch (error) {
    console.error('Error validating password:', error);
    return false;
  }
};

/**
 * Check if a string is empty or whitespace only
 * @param str - String to check
 * @returns Whether string is empty
 */
export const isEmpty = (str?: string): boolean => {
  try {
    return !str || /^\s*$/.test(str);
  } catch (error) {
    console.error('Error checking if string is empty:', error);
    return true;
  }
};
