import React, { useState, useEffect } from 'react';
import { Lock, Fingerprint, Delete, ShieldCheck, LogOut } from 'lucide-react';
import { useAppLock } from '../context/AppLockContext';

interface SecurityLockModalProps {
  onLogoutFallback: () => void;
}

export const SecurityLockModal: React.FC<SecurityLockModalProps> = ({ onLogoutFallback }) => {
  const { isLocked, isBiometricsEnabled, hasBiometricHardware, verifyPin, unlockWithBiometrics } = useAppLock();
  const [pin, setPin] = useState<string>('');
  const [errorShake, setErrorShake] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Auto-prompt biometrics on initial load if enabled
  useEffect(() => {
    if (isLocked && isBiometricsEnabled) {
      const timer = setTimeout(() => {
        unlockWithBiometrics();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLocked, isBiometricsEnabled]);

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length >= 4) return;
    setErrorMsg('');
    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 4) {
      setTimeout(() => {
        const success = verifyPin(newPin);
        if (!success) {
          setErrorShake(true);
          setErrorMsg('Incorrect PIN. Try again.');
          setTimeout(() => {
            setErrorShake(false);
            setPin('');
          }, 600);
        } else {
          setPin('');
        }
      }, 100);
    }
  };

  const handleDelete = () => {
    setErrorMsg('');
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-between p-6 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="w-full flex justify-between items-center max-w-sm pt-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <span className="font-extrabold text-xs bg-gradient-to-br from-indigo-500 via-pink-500 to-amber-400 bg-clip-text text-transparent">
              CF
            </span>
          </div>
          <span className="text-xs font-bold text-zinc-400 tracking-wider">COLLABFLOW OS</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <ShieldCheck size={13} />
          <span>Encrypted</span>
        </div>
      </div>

      {/* Center Lock Info & PIN Dots */}
      <div className="flex flex-col items-center max-w-xs text-center space-y-4 my-auto">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
          <Lock size={26} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Creator Security Lock</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Enter your 4-digit PIN to access private deals & payout rates
          </p>
        </div>

        {/* 4 PIN Dots */}
        <div className={`flex items-center gap-4 py-3 ${errorShake ? 'animate-bounce text-red-400' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-indigo-500 scale-110 shadow-sm shadow-indigo-500/50'
                    : 'bg-zinc-800 border border-zinc-700'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-xs text-red-400 font-medium animate-in fade-in">
            {errorMsg}
          </p>
        )}
      </div>

      {/* Numeric Touch Keypad */}
      <div className="w-full max-w-xs space-y-3 pb-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-14 rounded-2xl bg-zinc-900/90 active:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-lg font-semibold text-white transition-all active:scale-95 flex items-center justify-center shadow-xs"
            >
              {digit}
            </button>
          ))}

          {/* Biometrics Button */}
          <button
            type="button"
            onClick={unlockWithBiometrics}
            disabled={!isBiometricsEnabled}
            className={`h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 border transition-all active:scale-95 ${
              isBiometricsEnabled
                ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400 hover:bg-indigo-900/50'
                : 'opacity-20 cursor-not-allowed border-transparent text-zinc-600'
            }`}
            title="Biometric Face ID / Fingerprint Unlock"
          >
            <Fingerprint size={20} />
            <span className="text-[9px] font-bold">Touch ID</span>
          </button>

          {/* Zero */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-zinc-900/90 active:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-lg font-semibold text-white transition-all active:scale-95 flex items-center justify-center shadow-xs"
          >
            0
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-zinc-900/90 active:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 active:text-white transition-all active:scale-95 flex items-center justify-center shadow-xs"
            title="Delete"
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Emergency Logout Fallback */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onLogoutFallback}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5"
          >
            <LogOut size={12} />
            <span>Forgot PIN? Log out & sign in with password</span>
          </button>
        </div>
      </div>
    </div>
  );
};
