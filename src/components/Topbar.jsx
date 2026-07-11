import React from 'react';

export default function Topbar({
  title,
  subtitle,
  user,
  onEditUser,
  onLogout,
  onSessionAction,
  sessionActionLabel,
  modeLabel
}) {
  return (
    <header className="topbar">
      <div className="topbar__content">
        <p className="eyebrow">Sistema de gestão financeira</p>
        <h1>{title}</h1>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
        <div className="topbar__meta">
          {modeLabel ? <span className="topbar__chip">{modeLabel}</span> : null}
        </div>
      </div>

      <div className="topbar__surface">
        {user ? (
          <>
            <div className="topbar__user">
              <div>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
              <button type="button" className="button button--ghost" onClick={onEditUser}>
                Editar usuário
              </button>
            </div>
            <div className="topbar__actions">
              <button type="button" className="button button--ghost topbar__logout" onClick={onLogout}>
                Sair
              </button>
            </div>
          </>
        ) : onSessionAction ? (
          <button type="button" className="button button--ghost" onClick={onSessionAction}>
            {sessionActionLabel || 'Voltar ao login'}
          </button>
        ) : null}
      </div>
    </header>
  );
}
