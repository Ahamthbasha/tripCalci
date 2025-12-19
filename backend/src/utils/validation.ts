export class ValidationHelper {
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  private static readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]{8,}$/;

  static validateEmail(email: string): { isValid: boolean; message?: string } {
    if (!email || typeof email !== "string") {
      return { isValid: false, message: "Email is required" };
    }

    const trimmedEmail = email.trim();

    if (trimmedEmail.length === 0) {
      return { isValid: false, message: "Email cannot be empty" };
    }

    if (trimmedEmail.length > 254) {
      return { isValid: false, message: "Email is too long" };
    }

    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      return { isValid: false, message: "Please enter a valid email address" };
    }

    // Check for consecutive dots
    if (trimmedEmail.includes("..")) {
      return { isValid: false, message: "Email cannot contain consecutive dots" };
    }

    return { isValid: true };
  }

  static validatePassword(password: string): { isValid: boolean; message?: string } {
    if (!password || typeof password !== "string") {
      return { isValid: false, message: "Password is required" };
    }

    if (password.length < 8) {
      return {
        isValid: false,
        message: "Password must be at least 8 characters long",
      };
    }

    if (password.length > 128) {
      return {
        isValid: false,
        message: "Password is too long (maximum 128 characters)",
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }

    if (!/\d/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one number",
      };
    }

    if (!/[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one special character (@$!%*?&#^()_+-=[]{};':\"\\|,.<>/)",
      };
    }

    // Check for common weak passwords
    const weakPasswords = [
      "password",
      "12345678",
      "qwerty123",
      "abc123456",
      "password1",
      "password123",
    ];

    if (weakPasswords.some((weak) => password.toLowerCase().includes(weak))) {
      return {
        isValid: false,
        message: "Password is too common. Please choose a stronger password",
      };
    }

    return { isValid: true };
  }

  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}