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
  const registerHeadline = 'Crie sua conta e comece a organizar suas finanças agora';
  const helperText = isRegister
    ? 'O cadastro é rápido. Depois disso, você já pode testar a interface ou seguir para a sua conta'
    : 'Use sua conta cadastrada ou entre em modo demonstração para explorar a interface sem risco';

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
            <span>Gestão Financeira</span>
          </div>
        </div>

        <div key={mode} className="auth-panel__content">
          <div className="auth-intro auth-intro--spaced">
            <div className="auth-intro__eyebrow">
              <p className="eyebrow auth-eyebrow">{isRegister ? 'Criar acesso' : 'Entrar agora'}</p>
              <span className="auth-intro__line" />
            </div>
            {isRegister ? (
              <h1 className="auth-panel__headline auth-panel__headline--register">{registerHeadline}</h1>
            ) : (
              <h1 className="auth-panel__headline auth-panel__headline--login">
                Acesse seu painel com contas, categorias e lançamentos
              </h1>
            )}
          </div>

          <p className="muted">{helperText}</p>

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
              <small className="auth-hint auth-hint--spaced">
                Mantenha a senha em sigilo ao usar computadores compartilhados.
              </small>
            </label>

            {notice ? <div className="auth-banner auth-banner--info">{notice}</div> : null}
            {error ? <div className="auth-banner auth-banner--error">{error}</div> : null}

            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Processando...' : isRegister ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          <div className="auth-actions">
            <button type="button" className="button button--ghost" onClick={onToggleMode} disabled={loading}>
              {isRegister ? 'Já tenho conta' : 'Quero criar conta'}
            </button>
            <button type="button" className="button button--ghost" onClick={onDemoMode} disabled={loading}>
              Entrar em modo demonstração
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
