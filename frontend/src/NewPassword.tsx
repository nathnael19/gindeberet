import { useState, type FormEvent } from 'react';
import './AdminLogin.css';

export default function NewPassword({ isDarkTheme }: { isDarkTheme: boolean }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <div className={`admin-login-wrapper ${isDarkTheme ? 'dark-mode' : ''}`}>
      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="admin-logo">
            <img src="/logo.png" alt="Gindeberet Logo" />
            <span>GINDEBERET<span className="accent">.</span></span>
          </div>
          <h2>Set New Password</h2>
          <p>Please enter your new password below.</p>
        </div>

        {!isSuccess ? (
          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                required 
              />
            </div>
            
            {error && (
              <div style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center', fontWeight: '500' }}>
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              className={`btn-login ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? <span className="spinner"></span> : 'Update Password'}
            </button>
          </form>
        ) : (
          <div className="reset-success">
            <div className="success-icon">✓</div>
            <h3>Password Updated</h3>
            <p>Your password has been changed successfully.</p>
            <a href="/admin" className="btn-login" style={{ textDecoration: 'none', marginTop: '1.5rem', display: 'flex' }}>
              Proceed to Login
            </a>
          </div>
        )}
        
        {!isSuccess && (
          <div className="admin-login-footer">
            <a href="/admin" className="back-link">← Back to Login</a>
          </div>
        )}
      </div>
    </div>
  );
}
