import { useState } from 'react';
import './AdminLogin.css';

export default function AdminLogin({ isDarkTheme }: { isDarkTheme: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      alert('Login functionality to be implemented');
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
          <h2>Admin Portal</h2>
          <p>Secure access for authorized personnel only.</p>
        </div>

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
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          
          <div className="form-actions">
            <label className="remember-me">
              <input type="checkbox" className="custom-checkbox-input" />
              <span className="custom-checkbox"></span>
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="forgot-password">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            className={`btn-login ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? <span className="spinner"></span> : 'Sign In'}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <a href="/" className="back-link">← Back to Main Site</a>
        </div>
      </div>
    </div>
  );
}
