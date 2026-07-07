import React from 'react';

export default function AuthCard({ mode, values, onChange, onSubmit, onToggleMode, onDemoMode, loading, error }) {
  const isRegister = mode === 'register';

  return (
    <section className="auth-shell">
      <div className="auth-panel">
        <div className="brand auth-brand">
          <div className="brand__mark">F</div>
          <div>
            <strong>Finansync</strong>
            <span>Gestao Financeira</span>
          </div>
        </div>

        <h1>Entre para acessar suas contas, categorias e lancamentos.</h1>
        <p className="muted">
          Use sua conta cadastrada no Oracle ou entre em modo demonstracao para testar a interface.
        </p>

        <form className="auth-form" onSubmit={onSubmit}>
          {isRegister ? (
            <label>
              <span>Nome</span>
              <input
                name="name"
                autoComplete="name"
                value={values.name}
                onChange={onChange}
                placeholder="Seu nome"
                required={isRegister}
              />
            </label>
          ) : null}

          <label>
            <span>E-mail</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={onChange}
              placeholder="voce@empresa.com"
              required
            />
          </label>

          <label>
            <span>Senha</span>
            <input
              name="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={values.password}
              onChange={onChange}
              placeholder="Sua senha"
              required
            />
          </label>

          {error ? <div className="alert auth-alert">{error}</div> : null}

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Processando...' : isRegister ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <div className="auth-actions">
          <button type="button" className="button button--ghost" onClick={onToggleMode} disabled={loading}>
            {isRegister ? 'Ja tenho conta' : 'Quero me cadastrar'}
          </button>
          <button type="button" className="button button--ghost" onClick={onDemoMode} disabled={loading}>
            Entrar em demo
          </button>
        </div>
      </div>
    </section>
  );
}
