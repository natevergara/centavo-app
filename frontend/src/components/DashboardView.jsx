import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { EmptyTransactions } from './EmptyTransactions';
import {
  Wallet,
  PieChart,
  ArrowDownRight,
  Bell,
  LogOut,
  Plus,
  Shield,
  Layers,
  FileText,
  Utensils,
  Tag,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const DashboardView = () => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('inicio');
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Modal Form State
  const [formAmount, setFormAmount] = useState('50000');
  const [formCategory, setFormCategory] = useState('Comida');
  const [formDescription, setFormDescription] = useState('Almuerzo de trabajo');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formError, setFormError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingTx(true);
      const res = await fetch('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Error al cargar transacciones:', err);
    } finally {
      setLoadingTx(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setFormError(null);
    const num = parseFloat(formAmount);
    if (isNaN(num) || num <= 0) {
      setFormError('El monto debe ser mayor a 0');
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: num,
          category: formCategory,
          date: formDate,
          description: formDescription
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar movimiento');
      }

      setShowAddModal(false);
      setFormAmount('50000');
      setFormCategory('Comida');
      setFormDescription('');
      fetchTransactions();
    } catch (err) {
      setFormError(err.message || 'Error al procesar la transacción');
    } finally {
      setFormSubmitting(false);
    }
  };

  const formatCurrency = (val) => '$' + Number(val).toLocaleString('de-DE');
  const totalGastos = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--neutral-border)',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              ¢
            </div>
            <div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: 'var(--neutral-dark)'
              }}>
                Centavo
              </span>
              <span style={{
                fontSize: '10px',
                backgroundColor: 'var(--primary-tint)',
                color: 'var(--primary)',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: 'var(--radius-full)',
                marginLeft: '8px'
              }}>
                PERSONAL
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('inicio')}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: activeTab === 'inicio' ? 'var(--primary-tint)' : 'transparent',
                color: activeTab === 'inicio' ? 'var(--primary)' : 'var(--neutral-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              Inicio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presupuestos')}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: activeTab === 'presupuestos' ? 'var(--primary-tint)' : 'transparent',
                color: activeTab === 'presupuestos' ? 'var(--primary)' : 'var(--neutral-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              Presupuestos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reportes')}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: activeTab === 'reportes' ? 'var(--primary-tint)' : 'transparent',
                color: activeTab === 'reportes' ? 'var(--primary)' : 'var(--neutral-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              Reportes
            </button>
          </nav>

          {/* User actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              title="Alertas de sobregasto"
              style={{
                position: 'relative',
                color: 'var(--neutral-muted)',
                padding: '8px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bell size={20} />
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)'
              }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-inset)',
                color: 'var(--neutral-dark)',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--neutral-border)'
              }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              <button
                type="button"
                onClick={logout}
                title="Cerrar sesión"
                style={{
                  color: 'var(--neutral-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {/* Welcome & Action Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontWeight: '700',
              color: 'var(--neutral-dark)',
              letterSpacing: '-0.02em',
              marginBottom: '4px'
            }}>
              Hola, {user?.name || 'Usuario'} 👋
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--neutral-muted)' }}>
              Aquí tienes el resumen financiero y el estado de tus presupuestos.
            </p>
          </div>

          <button
            id="new-transaction-button"
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 6px rgba(15, 81, 50, 0.2)',
              cursor: 'pointer'
            }}
          >
            <Plus size={18} />
            <span>Nuevo Movimiento</span>
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '18px',
          marginBottom: '36px'
        }}>
          {/* Card 1: Saldo Total */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '22px 24px',
            border: '1px solid var(--neutral-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--neutral-muted)' }}>
                Saldo Disponible
              </span>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-tint)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Wallet size={18} />
              </div>
            </div>
            <div className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: '700',
              color: 'var(--neutral-dark)'
            }}>
              $0.00
            </div>
            <span style={{ fontSize: '12px', color: 'var(--neutral-muted)' }}>
              Actualizado hoy
            </span>
          </div>

          {/* Card 2: Presupuesto del Mes */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '22px 24px',
            border: '1px solid var(--neutral-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--neutral-muted)' }}>
                Presupuesto Mensual
              </span>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PieChart size={18} />
              </div>
            </div>
            <div className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: '700',
              color: 'var(--neutral-dark)'
            }}>
              $200.000
            </div>
            <span style={{ fontSize: '12px', color: 'var(--neutral-muted)' }}>
              Presupuesto asignado
            </span>
          </div>

          {/* Card 3: Gastos del Período */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '22px 24px',
            border: '1px solid var(--neutral-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--neutral-muted)' }}>
                Gastos Acumulados
              </span>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#fff1f2',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ArrowDownRight size={18} />
              </div>
            </div>
            <div id="kpi-gastos-acumulados" className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: '700',
              color: 'var(--neutral-dark)'
            }}>
              {formatCurrency(totalGastos)}
            </div>
            <span style={{ fontSize: '12px', color: totalGastos > 0 ? '#10b981' : 'var(--neutral-muted)' }}>
              {totalGastos > 0 ? `${transactions.length} movimiento(s) registrado(s)` : 'Sin movimientos'}
            </span>
          </div>
        </div>

        {/* Transactions Section Header */}
        <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--neutral-dark)'
            }}>
              Registro de Transacciones
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--neutral-muted)' }}>
              Movimientos recientes categorizados en transactions-service
            </p>
          </div>
        </div>

        {/* Transactions List or Empty State */}
        {transactions.length === 0 ? (
          <EmptyTransactions onAddTransaction={() => setShowAddModal(true)} />
        ) : (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--neutral-border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <table id="transactions-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-inset)', borderBottom: '1px solid var(--neutral-border)' }}>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--neutral-muted)', textTransform: 'uppercase' }}>Categoría</th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--neutral-muted)', textTransform: 'uppercase' }}>Descripción</th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--neutral-muted)', textTransform: 'uppercase' }}>Fecha</th>
                  <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--neutral-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} id={`tx-row-${tx.id}`} style={{ borderBottom: '1px solid var(--neutral-border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        className="category-badge"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '12px',
                          fontWeight: '700',
                          backgroundColor: tx.category === 'Comida' ? '#ecfdf5' : 'var(--primary-tint)',
                          color: tx.category === 'Comida' ? '#047857' : 'var(--primary)',
                          border: tx.category === 'Comida' ? '1px solid #a7f3d0' : 'none'
                        }}
                      >
                        <Tag size={12} />
                        <span className="category-name">{tx.category}</span>
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '500', color: 'var(--neutral-dark)' }}>
                      {tx.description || 'Sin descripción'}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--neutral-muted)' }}>
                      {tx.date}
                    </td>
                    <td className="tabular-nums" style={{ padding: '16px 20px', fontSize: '15px', fontWeight: '700', color: '#dc2626', textAlign: 'right' }}>
                      -{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal / Sheet for Adding Transaction */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '480px',
            padding: '28px',
            boxShadow: 'var(--shadow-lg)'
          }} className="animate-fade-in">
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '6px',
              color: 'var(--neutral-dark)'
            }}>
              Registrar Movimiento
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--neutral-muted)', marginBottom: '20px' }}>
              Este formulario registrará el gasto en <code>transactions-service</code> con su categoría.
            </p>

            {formError && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--neutral-dark)', marginBottom: '6px' }}>
                  Monto ($)
                </label>
                <input
                  id="transaction-amount-input"
                  type="number"
                  step="any"
                  required
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="50000"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-border)',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--neutral-dark)', marginBottom: '6px' }}>
                  Categoría
                </label>
                <select
                  id="transaction-category-select"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-border)',
                    fontSize: '14px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="Comida">Comida</option>
                  <option value="Alimentación">Alimentación</option>
                  <option value="Vivienda">Vivienda</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Ocio">Ocio</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--neutral-dark)', marginBottom: '6px' }}>
                  Fecha
                </label>
                <input
                  id="transaction-date-input"
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-border)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--neutral-dark)', marginBottom: '6px' }}>
                  Descripción
                </label>
                <input
                  id="transaction-description-input"
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ej: Almuerzo con amigos"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-border)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    color: 'var(--neutral-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  id="submit-transaction-button"
                  type="submit"
                  disabled={formSubmitting}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(15, 81, 50, 0.2)'
                  }}
                >
                  {formSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom status bar */}
      <footer style={{
        borderTop: '1px solid var(--neutral-border)',
        backgroundColor: '#ffffff',
        padding: '14px 24px',
        fontSize: '12px',
        color: 'var(--neutral-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={14} color="var(--primary)" />
          <span>Centavo · Monorepo Microservicios (auth, transactions, budgets, notifications, reports)</span>
        </div>
        <span>Sesión activa para {user?.email}</span>
      </footer>
    </div>
  );
};
