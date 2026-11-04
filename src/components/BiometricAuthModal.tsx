import React, { useState, useEffect } from 'react';
import {
  X,
  Fingerprint,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogIn,
  Users,
} from 'lucide-react';
import {
  getAllAccounts,
  getAccountByPhone,
  saveAccount,
  setCurrentUserPhone,
  normalizePhoneNumber,
  UserAccount,
} from '../utils/authDatabase';
import {
  registerBiometricCredential,
  verifyBiometricCredential,
} from '../utils/biometricService';
import { RoutineItem, AppState } from '../types';

interface BiometricAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (account: UserAccount) => void;
  currentRoutines: RoutineItem[];
  appState: AppState;
  initialMode?: 'login' | 'register';
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentRoutines,
  appState,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [savedAccounts, setSavedAccounts] = useState<UserAccount[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsScanning(false);
      const accounts = getAllAccounts();
      setSavedAccounts(accounts);
      if (accounts.length > 0 && !phoneNumber) {
        setPhoneNumber(accounts[0].phoneNumber);
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const cleanPhone = normalizePhoneNumber(phoneNumber);

  const handleQuickSelectAccount = (account: UserAccount) => {
    setPhoneNumber(account.phoneNumber);
    setMode('login');
    setErrorMsg(null);
  };

  const handleBiometricAction = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate phone number
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid phone number (e.g. 017XXXXXXXX)');
      return;
    }

    setIsScanning(true);

    try {
      const existingAccount = getAccountByPhone(cleanPhone);

      if (mode === 'register' || !existingAccount) {
        // Register or Auto-Register Flow
        const bioResult = await registerBiometricCredential(cleanPhone);

        const newAccount: UserAccount = {
          phoneNumber: cleanPhone,
          fullName: fullName.trim() || (existingAccount?.fullName) || `Student ${cleanPhone.slice(-4)}`,
          department: appState.departmentName,
          semester: appState.semesterName,
          shift: appState.shift,
          biometricCredentialId: bioResult.credentialId,
          biometricRegistered: true,
          createdAt: existingAccount ? existingAccount.createdAt : new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          routines: existingAccount ? existingAccount.routines : [...currentRoutines],
          settings: {
            theme: appState.theme,
            notifications: appState.notifications,
          },
        };

        saveAccount(newAccount);
        setCurrentUserPhone(cleanPhone);

        setSuccessMsg('Fingerprint registered and logged in successfully! 🛡️');
        setTimeout(() => {
          setIsScanning(false);
          onLoginSuccess(newAccount);
          onClose();
        }, 600);
      } else {
        // Login Flow for existing account
        await verifyBiometricCredential(existingAccount.biometricCredentialId);

        const updated: UserAccount = {
          ...existingAccount,
          lastLoginAt: new Date().toISOString(),
        };
        saveAccount(updated);
        setCurrentUserPhone(cleanPhone);

        setSuccessMsg('Fingerprint verified! Logged in successfully! 🚀');
        setTimeout(() => {
          setIsScanning(false);
          onLoginSuccess(updated);
          onClose();
        }, 600);
      }
    } catch {
      setIsScanning(false);
      setErrorMsg('Sensor timeout. Please tap the fingerprint icon to retry.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-tight">
              {mode === 'login' ? 'Fingerprint Login' : 'Fingerprint Register'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="p-3 bg-zinc-100/60 dark:bg-zinc-900 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div className="grid grid-cols-2 gap-1 bg-zinc-200/60 dark:bg-zinc-800/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Phone Number Input */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Mobile Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="017XXXXXXXX"
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono font-medium focus:outline-emerald-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Optional Name (Register Mode) */}
          {mode === 'register' && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Full Name (Optional)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sajid Islam"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium focus:outline-emerald-500 shadow-2xs"
              />
            </div>
          )}

          {/* Quick Select Saved Accounts */}
          {savedAccounts.length > 0 && mode === 'login' && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-zinc-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Saved Accounts on this Device:</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {savedAccounts.map((acc) => (
                  <button
                    key={acc.phoneNumber}
                    type="button"
                    onClick={() => handleQuickSelectAccount(acc)}
                    className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg shrink-0 border transition cursor-pointer ${
                      cleanPhone === acc.phoneNumber
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {acc.phoneNumber}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fingerprint Sensor Trigger Zone */}
          <div className="pt-2 flex flex-col items-center justify-center">
            <button
              type="button"
              disabled={isScanning}
              onClick={handleBiometricAction}
              className={`relative group w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer ${
                isScanning
                  ? 'bg-emerald-600 ring-8 ring-emerald-500/30 scale-105'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500/40 hover:border-emerald-500 hover:scale-105 active:scale-95'
              }`}
            >
              {isScanning && (
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                  <div className="w-full h-1 bg-emerald-300 shadow-[0_0_12px_#34d399] animate-bounce" />
                </div>
              )}

              <Fingerprint
                className={`w-12 h-12 stroke-[1.8] transition-transform duration-300 ${
                  isScanning ? 'text-white animate-pulse' : 'text-emerald-600 dark:text-emerald-400 group-hover:scale-110'
                }`}
              />
            </button>

            <div className="text-center mt-3">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                {isScanning
                  ? 'Scanning Fingerprint...'
                  : mode === 'register'
                  ? 'Tap Sensor to Register'
                  : 'Tap Sensor to Login'}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                Direct phone hardware biometric verification
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="button"
            disabled={isScanning}
            onClick={handleBiometricAction}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            <span>
              {isScanning
                ? 'Verifying...'
                : mode === 'register'
                ? 'Complete Fingerprint Registration 👆'
                : 'Login with Fingerprint Sensor 👆'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
