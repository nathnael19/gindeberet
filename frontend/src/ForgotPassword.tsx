import { useState, type FormEvent } from 'react';
import './AdminLogin.css';

export default function ForgotPassword({ isDarkTheme }: { isDarkTheme: boolean }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
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
          <h2>Reset Password</h2>
          <p>Enter your email to receive a password reset link.</p>
        </div>

        {!isSent ? (
          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gindeberet.com"
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className={`btn-login ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? <span className="spinner"></span> : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="reset-success">
            <div className="success-icon">✓</div>
            <h3>Check your email</h3>
            <p>We've sent password reset instructions to <strong>{email}</strong>.</p>
          </div>
        )}
        
        <div className="admin-login-footer">
          <a href="/admin" className="back-link">← Back to Login</a>
        </div>
      </div>
    </div>
  );
}
