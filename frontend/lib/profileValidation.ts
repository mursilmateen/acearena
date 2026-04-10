// Username validation utility
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 20) {
    return { valid: false, error: 'Username must not exceed 20 characters' };
  }

  if (username.includes(' ')) {
    return { valid: false, error: 'Username cannot contain spaces' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  // Simulate checking if username is taken
  const takenUsernames = ['admin', 'root', 'moderator', 'test'];
  if (takenUsernames.includes(username.toLowerCase())) {
    return { valid: false, error: 'Username already taken' };
  }

  return { valid: true };
};

// Email validation
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
};

// URL validation (basic)
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Bio validation
export const validateBio = (bio: string): { valid: boolean; error?: string } => {
  if (bio.length > 150) {
    return { valid: false, error: 'Bio must not exceed 150 characters' };
  }
  return { valid: true };
};
