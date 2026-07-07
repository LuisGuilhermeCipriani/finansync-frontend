import React from 'react';

export default function Topbar({ title, subtitle, onRefresh, loading, user, onLogout, modeLabel }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Sistema de gestao financeira</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        {modeLabel ? <p className="topbar__mode">{modeLabel}</p> : null}
      </div>

      <div className="topbar__actions">
        {user ? (
          <div className="topbar__user">
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <button type="button" className="button button--ghost" onClick={onLogout}>
              Sair
            </button>
          </div>
        ) : null}

        <button type="button" className="button button--ghost" onClick={onRefresh} disabled={loading}>
          {loading ? 'Atualizando...' : 'Atualizar dados'}
        </button>
      </div>
    </header>
  );
}
