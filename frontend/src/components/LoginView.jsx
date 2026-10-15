import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const LoginView = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({ email, password, name });
      } else {
        await login({ email, password });
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.08) 0%, rgba(248, 250, 252, 1) 60%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--neutral-border)',
        padding: '36px 32px'
      }} className="animate-fade-in">

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '16px',
            boxShadow: '0 4px 14px rgba(15, 81, 50, 0.25)'
          }}>
            ¢
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--neutral-dark)',
            letterSpacing: '-0.02em',
            marginBottom: '6px'
          }}>
            Bienvenido a Centavo
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--neutral-muted)',
            lineHeight: '20px'
          }}>
            Toma el control de tus finanzas personales y sobregastos.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '12px 14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {isRegister && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--neutral-dark)',
                marginBottom: '6px'
              }}>
                Nombre completo
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid var(--neutral-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0 12px'
              }}>
                <input
                  id="name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    color: 'var(--neutral-dark)'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--neutral-dark)',
              marginBottom: '6px'
            }}>
              Correo electrónico
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid var(--neutral-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0 12px',
              transition: 'all 0.15s ease'
            }}>
              <Mail size={18} color="var(--neutral-muted)" style={{ marginRight: '10px' }} />
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: 'var(--neutral-dark)'
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--neutral-dark)'
              }}>
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => {
                  setEmail('usuario@centavo.com');
                  setPassword('password123');
                  setIsRegister(false);
                }}
                style={{
                  fontSize: '12px',
                  color: 'var(--primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cargar demo
              </button>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid var(--neutral-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0 12px'
            }}>
              <Lock size={18} color="var(--neutral-muted)" style={{ marginRight: '10px' }} />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: 'var(--neutral-dark)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: 'var(--neutral-muted)', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            id="login-button"
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(15, 81, 50, 0.25)',
              transition: 'background-color 0.15s ease',
              cursor: 'pointer'
            }}
          >
            <span>{loading ? 'Procesando...' : (isRegister ? 'Crear Cuenta' : 'Iniciar Sesión')}</span>
            <ArrowRight size={16} />
          </button>

          <div style={{ textAlign: 'center', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--neutral-muted)',
                fontSize: '13px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </form>

        {/* Security badge footer */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--neutral-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--neutral-muted)',
          fontSize: '12px'
        }}>
          <ShieldCheck size={16} color="var(--primary-light)" />
          <span>Acceso seguro con cifrado bancario individual</span>
        </div>
      </div>
    </div>
  );
};
