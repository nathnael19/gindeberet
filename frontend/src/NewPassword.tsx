import { useEffect } from 'react';

/** Legacy route — OTP reset lives on /forgot-password */
export default function NewPassword({ isDarkTheme }: { isDarkTheme: boolean }) {
  useEffect(() => {
    window.location.replace('/forgot-password');
  }, []);

  return (
    <div className={`admin-login-wrapper ${isDarkTheme ? 'dark-mode' : ''}`}>
      <div className="admin-login-container">
        <p style={{ textAlign: 'center' }}>Redirecting to password reset…</p>
      </div>
    </div>
  );
}
