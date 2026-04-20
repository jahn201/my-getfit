import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'my_getfit_users_v1';

export interface StoredUser {
  name: string;
  email: string;
  password: string;
}

/** Retrieve all registered users from storage */
export async function getUsers(): Promise<StoredUser[]> {
  console.log(`[Auth] Fetching users from: ${USERS_KEY}`);
  try {
    const json = await AsyncStorage.getItem(USERS_KEY);
    const users = json ? JSON.parse(json) : [];
    
    // Ensure the result is an array to prevent crashes if storage is corrupted
    if (!Array.isArray(users)) {
      console.error('Auth: Storage is not an array. Resetting.');
      return [];
    }
    return users;
  } catch (err) {
    console.error('Auth: Failed to retrieve users:', err);
    return [];
  }
}

/** Register a new user. Returns an error message string on failure, or null on success. */
export async function registerUser(name: string, email: string, password: string): Promise<string | null> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedName) return 'Please enter your full name.';
  if (!trimmedEmail) return 'Please enter your email.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return 'Please enter a valid email address.';
  if (password.length < 8) return 'Password must be at least 8 characters.';

  const users = await getUsers();
  if (users.some((u) => u.email === trimmedEmail)) {
    return 'An account with this email already exists.';
  }

  users.push({ name: trimmedName, email: trimmedEmail, password });
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  console.log(`[Auth] User registered successfully: ${trimmedEmail}. Total users: ${users.length}`);
  return null;
}

/** Validate login credentials. Returns the user on success, or an error message string on failure. */
export async function loginUser(email: string, password: string): Promise<{ user: StoredUser } | { error: string }> {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail) return { error: 'Please enter your email.' };
  if (!password) return { error: 'Please enter your password.' };

  const users = await getUsers();
  const match = users.find((u) => u.email === trimmedEmail && u.password === password);

  if (!match) return { error: 'Invalid email or password.' };
  return { user: match };
}
