import { RoutineItem, AppState } from '../types';

export interface UserAccount {
  phoneNumber: string; // e.g. "01712345678"
  fullName?: string;
  department?: string;
  semester?: string;
  shift?: string;
  biometricCredentialId?: string;
  biometricRegistered: boolean;
  createdAt: string;
  lastLoginAt: string;
  routines: RoutineItem[];
  settings?: {
    theme?: AppState['theme'];
    notifications?: AppState['notifications'];
  };
}

const STORAGE_ACCOUNTS_KEY = 'bteb_accounts_database_v1';
const STORAGE_CURRENT_USER_KEY = 'bteb_auth_current_phone_v1';

/**
 * Format phone number to clean uniform string (e.g. 01712345678)
 */
export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880')) {
    return '0' + digits.slice(3);
  }
  return digits;
}

/**
 * Load all registered accounts from local persistent database
 */
export function getAllAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load accounts database:', err);
    return [];
  }
}

/**
 * Retrieve a specific account by phone number
 */
export function getAccountByPhone(phoneNumber: string): UserAccount | null {
  const cleanPhone = normalizePhoneNumber(phoneNumber);
  const accounts = getAllAccounts();
  return accounts.find((a) => a.phoneNumber === cleanPhone) || null;
}

/**
 * Save or update an account in the database
 */
export function saveAccount(account: UserAccount): void {
  try {
    const cleanPhone = normalizePhoneNumber(account.phoneNumber);
    const updatedAccount = { ...account, phoneNumber: cleanPhone };
    const accounts = getAllAccounts();
    const existingIndex = accounts.findIndex((a) => a.phoneNumber === cleanPhone);

    if (existingIndex >= 0) {
      accounts[existingIndex] = updatedAccount;
    } else {
      accounts.push(updatedAccount);
    }

    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save account:', err);
  }
}

/**
 * Get current active logged-in phone number
 */
export function getCurrentUserPhone(): string | null {
  try {
    return localStorage.getItem(STORAGE_CURRENT_USER_KEY);
  } catch {
    return null;
  }
}

/**
 * Set or clear current active logged-in user
 */
export function setCurrentUserPhone(phoneNumber: string | null): void {
  try {
    if (phoneNumber) {
      const clean = normalizePhoneNumber(phoneNumber);
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, clean);
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to set current user phone:', err);
  }
}

/**
 * Get the currently logged-in user account
 */
export function getCurrentUser(): UserAccount | null {
  const currentPhone = getCurrentUserPhone();
  if (!currentPhone) return null;
  return getAccountByPhone(currentPhone);
}

/**
 * Sync active routines and app settings into the current user's database profile
 */
export function syncCurrentAccount(routines: RoutineItem[], appState?: Partial<AppState>): void {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const updated: UserAccount = {
    ...currentUser,
    routines: [...routines],
    department: appState?.departmentName || currentUser.department,
    semester: appState?.semesterName || currentUser.semester,
    shift: appState?.shift || currentUser.shift,
    settings: {
      theme: appState?.theme || currentUser.settings?.theme,
      notifications: appState?.notifications || currentUser.settings?.notifications,
    },
    lastLoginAt: new Date().toISOString(),
  };

  saveAccount(updated);
}

/**
 * Logout current user
 */
export function logoutUser(): void {
  setCurrentUserPhone(null);
}
