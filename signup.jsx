import { useState } from 'react';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'At least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Save token to localStorage
        localStorage.setItem('splitpay_token', data.token);
        localStorage.setItem('splitpay_user', JSON.stringify(data.user));
        
        // Show success message
        alert('🎉 Account created successfully!');
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setIsLoading(false);
        setErrors({ submit: data.error || 'Sign up failed' });
      }
    } catch (error) {
      setIsLoading(false);
      setErrors({ submit: 'Cannot connect to server. Please try again.' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #334155 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"DM Sans", -apple-system, sans-serif'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 12s ease-in-out infinite',
        filter: 'blur(60px)'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-8%',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite reverse',
        filter: 'blur(60px)'
      }}></div>

      {/* Floating money icons */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '12%',
        fontSize: '3rem',
        opacity: 0.08,
        animation: 'floatSlow 15s ease-in-out infinite'
      }}>💸</div>
      
      <div style={{
        position: 'absolute',
        top: '65%',
        right: '18%',
        fontSize: '2.5rem',
        opacity: 0.08,
        animation: 'floatSlow 13s ease-in-out infinite 2s'
      }}>💰</div>
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '25%',
        fontSize: '2rem',
        opacity: 0.08,
        animation: 'floatSlow 14s ease-in-out infinite 4s'
      }}>🤝</div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@700;900&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, -25px); }
        }
        
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, -30px) rotate(5deg); }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .signup-container {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .input-wrapper {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }
        
        .input-wrapper:nth-child(1) { animation-delay: 0.1s; }
        .input-wrapper:nth-child(2) { animation-delay: 0.2s; }
        .input-wrapper:nth-child(3) { animation-delay: 0.3s; }
        .input-wrapper:nth-child(4) { animation-delay: 0.4s; }

        .input-field {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .input-field:focus {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.5) !important;
        }
        
        .submit-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(34, 197, 94, 0.3);
        }
        
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .submit-btn:hover::before {
          left: 100%;
        }

        .link-text {
          position: relative;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .link-text::after {
          content: '';
          position: 'absolute';
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: #22c55e;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .link-text:hover::after {
          width: 100%;
        }
      `}</style>

      {/* Main container */}
      <div className="signup-container" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            borderRadius: '20px',
            marginBottom: '1.5rem',
            fontSize: '2.5rem',
            boxShadow: '0 8px 30px rgba(34, 197, 94, 0.4)',
            animation: 'float 6s ease-in-out infinite'
          }}>
            💸
          </div>
          
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '2.5rem',
            fontWeight: 900,
            color: '#ffffff',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.02em'
          }}>
            Join SplitPay
          </h1>
          
          <p style={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: 0,
            fontWeight: 400
          }}>
            Split bills, share expenses, stay friends
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name field */}
          <div className="input-wrapper" style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '0.5rem',
              letterSpacing: '0.02em'
            }}>
              Full Name
            </label>
            <input
              className="input-field"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '1rem',
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.05)',
                border: errors.name ? '2px solid #ef4444' : '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
            {errors.name && (
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.875rem',
                color: '#ef4444'
              }}>
                {errors.name}
              </p>
            )}
          </div>

          {/* Email field */}
          <div className="input-wrapper" style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '0.5rem',
              letterSpacing: '0.02em'
            }}>
              Email Address
            </label>
            <input
              className="input-field"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '1rem',
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.05)',
                border: errors.email ? '2px solid #ef4444' : '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
            {errors.email && (
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.875rem',
                color: '#ef4444'
              }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="input-wrapper" style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '0.5rem',
              letterSpacing: '0.02em'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.875rem 3rem 0.875rem 1rem',
                  fontSize: '1rem',
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: errors.password ? '2px solid #ef4444' : '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  opacity: 0.6,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.875rem',
                color: '#ef4444'
              }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="input-wrapper" style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '0.5rem',
              letterSpacing: '0.02em'
            }}>
              Confirm Password
            </label>
            <input
              className="input-field"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '1rem',
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.05)',
                border: errors.confirmPassword ? '2px solid #ef4444' : '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
            {errors.confirmPassword && (
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.875rem',
                color: '#ef4444'
              }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <p style={{
              margin: '0 0 1rem 0',
              padding: '0.75rem',
              fontSize: '0.875rem',
              color: '#ef4444',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {errors.submit}
            </p>
          )}

          {/* Submit button */}
          <button
            className="submit-btn"
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#ffffff',
              background: isLoading 
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.6) 0%, rgba(22, 163, 74, 0.6) 100%)'
                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
              letterSpacing: '0.02em'
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }}></span>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          Already have an account?{' '}
          <a
            href="/login"
            className="link-text"
            style={{
              color: '#22c55e',
              fontWeight: 500
            }}
          >
            Sign in
          </a>
        </div>

        {/* Terms */}
        <p style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.4)',
          lineHeight: '1.5'
        }}>
          By creating an account, you agree to our{' '}
          <a href="/terms" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'underline' }}>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'underline' }}>
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}