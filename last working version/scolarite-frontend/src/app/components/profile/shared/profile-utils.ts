// Utilitaires partagés pour les profils
export function getInitials(firstName?: string, lastName?: string, username?: string): string {
  if (firstName && lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase();
  } else if (lastName) {
    return lastName.charAt(0).toUpperCase();
  } else if (username) {
    return username.charAt(0).toUpperCase();
  }
  return '?';
}

export function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    success: '✓',
    danger: '⚠',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type] || 'ℹ';
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' | '' {
  if (!password || password.length < 6) return '';
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (strength <= 2) return 'weak';
  if (strength === 3) return 'medium';
  return 'strong';
}

export interface Notification {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
}

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}