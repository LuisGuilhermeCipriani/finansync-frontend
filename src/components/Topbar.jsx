import React from 'react';

export default function Topbar({ title, subtitle, onRefresh, loading, user, onEditUser, onLogout, modeLabel }) {
  return (
    <header className="topbar">
      <div className="topbar__content">
        <p className="eyebrow">Sistema de gestão financeira</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        <div className="topbar__meta">
          {modeLabel ? <span className="topbar__chip">{modeLabel}</span> : null}
          {user ? <span className="topbar__chip topbar__chip--ghost">Conectado como {user.name}</span> : null}
        </div>
      </div>

      <div className="topbar__surface">
        {user ? (
          <div className="topbar__user">
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <button type="button" className="button button--ghost" onClick={onEditUser}>
              Editar usuário
            </button>
            <button type="button" className="button button--ghost" onClick={onLogout}>
              Sair
            </button>
          </div>
        ) : null}

        <button type="button" className="button button--ghost" onClick={onRefresh} disabled={loading}>
          {loading ? 'Recarregando...' : 'Recarregar dados'}
        </button>
      </div>
    </header>
  );
}

