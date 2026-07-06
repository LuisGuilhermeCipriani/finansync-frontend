import React from 'react';

export default function Topbar({ title, subtitle, onRefresh, loading }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Sistema de gestao financeira</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>

      <button type="button" className="button button--ghost" onClick={onRefresh} disabled={loading}>
        {loading ? 'Atualizando...' : 'Atualizar dados'}
      </button>
    </header>
  );
}
