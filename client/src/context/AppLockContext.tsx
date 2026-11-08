import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppLockContextType {
  isLocked: boolean;
  isPinEnabled: boolean;
  isBiometricsEnabled: boolean;
  hasBiometricHardware: boolean;
  autoLockTimeout: number; // in minutes: 0 = immediate, 5, 15, -1 = disabled
  verifyPin: (enteredPin: string) => boolean;
  unlockWithBiometrics: () => Promise<boolean>;
  enablePinLock: (newPin: string, enableBiometrics?: boolean) => Promise<boolean>;
  disablePinLock: (currentPin: string) => boolean;
  lockApp: () => void;
  unlockApp: () => void;
  setAutoLockTimeout: (minutes: number) => void;
}

const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

const STORAGE_PIN_KEY = 'collabflow_app_pin';
const STORAGE_BIOMETRIC_KEY = 'collabflow_biometric_enabled';
const STORAGE_TIMEOUT_KEY = 'collabflow_autolock_timeout';
const STORAGE_LAST_ACTIVE_KEY = 'collabflow_last_active';

export const AppLockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasPin, setHasPin] = useState<boolean>(() => !!localStorage.getItem(STORAGE_PIN_KEY));
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(
    () => localStorage.getItem(STORAGE_BIOMETRIC_KEY) === 'true'
  );
  const [hasBiometricHardware, setHasBiometricHardware] = useState<boolean>(false);
  const [autoLockTimeout, setAutoLockTimeoutState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_TIMEOUT_KEY);
    return saved !== null ? parseInt(saved, 10) : 5; // default 5 min
  });

  // Start locked if PIN is configured
  const [isLocked, setIsLocked] = useState<boolean>(() => !!localStorage.getItem(STORAGE_PIN_KEY));

  // Check hardware biometric availability (Touch ID, Face ID, Android Fingerprint, Windows Hello)
  useEffect(() => {
    if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          setHasBiometricHardware(available);
        })
        .catch(() => {
          setHasBiometricHardware(false);
        });
    }
  }, []);

  // Handle visibility change / backgrounding
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, Date.now().toString());
      } else if (document.visibilityState === 'visible' && hasPin) {
        const lastActive = localStorage.getItem(STORAGE_LAST_ACTIVE_KEY);
        if (lastActive && autoLockTimeout >= 0) {
          const elapsedMinutes = (Date.now() - parseInt(lastActive, 10)) / (1000 * 60);
          if (elapsedMinutes >= autoLockTimeout) {
            setIsLocked(true);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasPin, autoLockTimeout]);

  // Simple PIN verification
  const verifyPin = (enteredPin: string): boolean => {
    const savedPin = localStorage.getItem(STORAGE_PIN_KEY);
    if (!savedPin) return true;
    if (enteredPin === savedPin) {
      setIsLocked(false);
      localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, Date.now().toString());
      return true;
    }
    return false;
  };

  // WebAuthn Biometric verification
  const unlockWithBiometrics = async (): Promise<boolean> => {
    if (!isBiometricsEnabled || !window.PublicKeyCredential) {
      return false;
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'preferred',
          rpId: window.location.hostname || undefined,
        }
      });

      if (credential) {
        setIsLocked(false);
        localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, Date.now().toString());
        return true;
      }
      return false;
    } catch (err: any) {
      console.warn('Biometric auth prompt failed or was cancelled:', err);
      return false;
    }
  };

  // Enable PIN lock & optional WebAuthn registration
  const enablePinLock = async (newPin: string, enableBio: boolean = false): Promise<boolean> => {
    if (!newPin || newPin.length !== 4) return false;
    localStorage.setItem(STORAGE_PIN_KEY, newPin);
    setHasPin(true);

    if (enableBio && window.PublicKeyCredential) {
      try {
        const challenge = new Uint8Array(32);
        const userId = new Uint8Array(16);
        window.crypto.getRandomValues(challenge);
        window.crypto.getRandomValues(userId);

        await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: 'Collabio', id: window.location.hostname || undefined },
            user: {
              id: userId,
              name: 'creator@collabflow',
              displayName: 'Collabio Creator'
            },
            pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              userVerification: 'preferred'
            },
            timeout: 60000
          }
        });

        localStorage.setItem(STORAGE_BIOMETRIC_KEY, 'true');
        setIsBiometricsEnabled(true);
      } catch (err) {
        console.warn('WebAuthn biometric registration skipped/cancelled:', err);
        // Fallback: still keep biometric toggle active if preferred
        localStorage.setItem(STORAGE_BIOMETRIC_KEY, 'true');
        setIsBiometricsEnabled(true);
      }
    } else {
      localStorage.removeItem(STORAGE_BIOMETRIC_KEY);
      setIsBiometricsEnabled(false);
    }

    return true;
  };

  // Disable PIN
  const disablePinLock = (currentPin: string): boolean => {
    const savedPin = localStorage.getItem(STORAGE_PIN_KEY);
    if (!savedPin || savedPin === currentPin) {
      localStorage.removeItem(STORAGE_PIN_KEY);
      localStorage.removeItem(STORAGE_BIOMETRIC_KEY);
      setHasPin(false);
      setIsBiometricsEnabled(false);
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const setAutoLockTimeout = (minutes: number) => {
    setAutoLockTimeoutState(minutes);
    localStorage.setItem(STORAGE_TIMEOUT_KEY, minutes.toString());
  };

  const lockApp = () => {
    if (hasPin) {
      setIsLocked(true);
    }
  };

  const unlockApp = () => {
    setIsLocked(false);
    localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, Date.now().toString());
  };

  return (
    <AppLockContext.Provider
      value={{
        isLocked,
        isPinEnabled: hasPin,
        isBiometricsEnabled,
        hasBiometricHardware,
        autoLockTimeout,
        verifyPin,
        unlockWithBiometrics,
        enablePinLock,
        disablePinLock,
        lockApp,
        unlockApp,
        setAutoLockTimeout,
      }}
    >
      {children}
    </AppLockContext.Provider>
  );
};

export const useAppLock = () => {
  const ctx = useContext(AppLockContext);
  if (!ctx) {
    throw new Error('useAppLock must be used within an AppLockProvider');
  }
  return ctx;
};
