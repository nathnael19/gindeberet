import { useEffect, useState, type FormEvent } from 'react';
import { authApi } from './api';
import './AdminLogin.css';

type Step = 'email' | 'otp' | 'done';

const RESEND_COOLDOWN_SEC = 60;

export default function ForgotPassword({ isDarkTheme }: { isDarkTheme: boolean }) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const requestOtp = async (targetEmail: string) => {
    const res = await authApi.forgotPassword(targetEmail.trim());
    setInfo(res.message || 'If that email is registered, a reset code has been sent.');
    setResendCooldown(RESEND_COOLDOWN_SEC);
  };

  const sendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsLoading(true);
    try {
      await requestOtp(email);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0 || !email.trim()) return;
    setError('');
    setIsResending(true);
    try {
      await requestOtp(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setIsResending(false);
    }
  };

  const submitNewPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Enter the 6-digit code from your email');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(email.trim(), otp.trim(), password);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`admin-login-wrapper ${isDarkTheme ? 'dark-mode' : ''}`}>
      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="admin-logo">
            <img src="/logo.png" alt="Gindeberet General Construction PLC" />
            <span>Gindeberet General Construction PLC</span>
          </div>
          <h2>Reset Password</h2>
          <p>
            {step === 'email' && 'Enter your admin email to receive a one-time code (OTP).'}
            {step === 'otp' && 'Enter the 6-digit code from your email and choose a new password.'}
            {step === 'done' && 'Your password has been updated.'}
          </p>
        </div>

        {step === 'email' && (
          <form className="admin-login-form" onSubmit={sendOtp}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="gindeberetconstruction278@gmail.com or gindeberetconstructionplc@gmail.com"
                autoComplete="email"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className={`btn-login ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? <span className="spinner" /> : 'Send OTP to Email'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form className="admin-login-form" onSubmit={submitNewPassword}>
            {info && <p className="forgot-info">{info}</p>}
            <p className="forgot-email-hint">
              Code sent to <strong>{email}</strong>
            </p>

            <div className="form-group">
              <label htmlFor="otp">OTP Code</label>
              <input
                type="text"
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className={`btn-login ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? <span className="spinner" /> : 'Verify OTP & Update Password'}
            </button>

            <button
              type="button"
              className="forgot-resend-btn"
              disabled={resendCooldown > 0 || isResending}
              onClick={() => void resendOtp()}
            >
              {isResending
                ? 'Sending…'
                : resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : 'Resend OTP to email'}
            </button>

            <button
              type="button"
              className="back-link forgot-back-btn"
              onClick={() => {
                setStep('email');
                setOtp('');
                setPassword('');
                setConfirmPassword('');
                setError('');
                setInfo('');
                setResendCooldown(0);
              }}
            >
              ← Use a different email
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="reset-success">
            <div className="success-icon">✓</div>
            <h3>Password Updated</h3>
            <p>You can now sign in with your new password.</p>
            <a href="/admin" className="btn-login forgot-done-btn">
              Proceed to Login
            </a>
          </div>
        )}

        {step !== 'done' && (
          <div className="admin-login-footer">
            <a href="/admin" className="back-link">
              ← Back to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
