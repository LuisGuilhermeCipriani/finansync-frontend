import React from 'react';

export default function AuthCard({
  mode,
  values,
  onChange,
  onSubmit,
  onToggleMode,
  onDemoMode,
  loading,
  error,
  notice
}) {
  const isRegister = mode === 'register';
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    setShowPassword(false);
  }, [mode]);

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

        <div className="auth-intro">
          <p className="eyebrow auth-eyebrow">{isRegister ? 'Criacao de acesso' : 'Acesso protegido'}</p>
          <h1>Entre para acessar suas contas, categorias e lancamentos.</h1>
        </div>
        <p className="muted">
          Use sua conta cadastrada na API ou entre em modo demonstracao para testar a interface.
        </p>

        <div className="auth-pills" aria-label="Recursos da autenticacao">
          <span>Login seguro</span>
          <span>Cadastro rapido</span>
          <span>Modo demo</span>
        </div>

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
            <div className="auth-password">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={values.password}
                onChange={onChange}
                placeholder="Sua senha"
                required
              />
              <button
                type="button"
                className="auth-password__toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <small className="auth-hint">Mantenha a senha em sigilo ao usar computadores compartilhados.</small>
          </label>

          {notice ? <div className="auth-banner auth-banner--info">{notice}</div> : null}
          {error ? <div className="auth-banner auth-banner--error">{error}</div> : null}

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
