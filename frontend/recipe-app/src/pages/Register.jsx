import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(username, email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="row justify-content-center align-items-center mt-5">
      <div className="col-md-5">
        <div className="card glass-panel p-4 animate-fade-in">
          <div className="text-center mb-4">
            <i className="fa-solid fa-user-plus text-gradient" style={{ fontSize: '2.5rem' }}></i>
            <h2 className="mt-2 text-gradient">Create Account</h2>
            <p className="text-muted">Register to start managing your recipes and meal plans</p>
          </div>

          {error && (
            <div className="alert alert-danger border-0 text-white" style={{ background: 'rgba(220, 53, 69, 0.2)' }}>
              <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="text-muted small font-weight-bold">USERNAME</label>
              <input 
                type="text" 
                className="form-control form-control-glass" 
                placeholder="chef_user" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="text-muted small font-weight-bold">EMAIL ADDRESS</label>
              <input 
                type="email" 
                className="form-control form-control-glass" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-4">
              <label className="text-muted small font-weight-bold">PASSWORD</label>
              <input 
                type="password" 
                className="form-control form-control-glass" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-premium-primary btn-block py-2 mb-3"
              disabled={loading}
            >
              {loading ? (
                <span><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Registering...</span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="text-info font-weight-bold">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
