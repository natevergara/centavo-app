import React from 'react';
import { Receipt, PlusCircle, Upload, ArrowUpRight } from 'lucide-react';

export const EmptyTransactions = ({ onAddTransaction }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--neutral-border)',
      boxShadow: 'var(--shadow-sm)',
      padding: '56px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      maxWidth: '640px',
      margin: '0 auto',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {/* Icon Badge */}
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--primary-tint)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
        marginBottom: '20px'
      }}>
        <Receipt size={36} strokeWidth={1.8} />
      </div>

      {/* Main Title & Subtitle */}
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '20px',
        fontWeight: '700',
        color: 'var(--neutral-dark)',
        marginBottom: '8px'
      }}>
        No tienes transacciones registradas
      </h3>

      <p style={{
        fontSize: '14px',
        color: 'var(--neutral-muted)',
        maxWidth: '420px',
        lineHeight: '22px',
        marginBottom: '28px'
      }}>
        Comienza a tomar el control de tu dinero agregando tu primer gasto o ingreso para activar el cálculo de presupuestos y alertas.
      </p>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onAddTransaction}
        style={{
          backgroundColor: 'var(--primary)',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '600',
          padding: '12px 24px',
          borderRadius: 'var(--radius-md)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(15, 81, 50, 0.2)',
          transition: 'transform 0.1s ease, background-color 0.15s ease'
        }}
      >
        <PlusCircle size={18} />
        <span>Registrar primera transacción</span>
      </button>

      {/* Secondary quick shortcuts */}
      <div style={{
        marginTop: '32px',
        display: 'flex',
        gap: '16px',
        fontSize: '13px',
        color: 'var(--neutral-muted)'
      }}>
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--secondary)',
            fontWeight: '500'
          }}
          onClick={() => alert('Función de importación lista para conectar con transactions-service')}
        >
          <Upload size={14} />
          <span>Importar archivo CSV</span>
        </button>
        <span>•</span>
        <a
          href="#docs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--neutral-muted)',
            textDecoration: 'none'
          }}
        >
          <span>¿Cómo categorizar gastos?</span>
          <ArrowUpRight size={14} />
        </a>
      </div>
    </div>
  );
};
