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
  const headline = isRegister
    ? 'Crie sua conta e comece a organizar suas finanças agora.'
    : 'Entre para retomar seu painel com contas, categorias e lançamentos.';
  const helperText = isRegister
    ? 'O cadastro é rápido. Depois disso, você já pode testar a interface ou seguir para a API.'
    : 'Use sua conta cadastrada na API ou entre em modo demonstração para explorar a interface sem risco.';

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

        <div className="auth-badge-row">
          <span className="auth-badge">API protegida</span>
          <span className="auth-badge auth-badge--soft">Modo demonstração</span>
        </div>

        <div key={mode} className="auth-panel__content">
          <div className="auth-intro auth-intro--spaced">
            <div className="auth-intro__eyebrow">
              <p className="eyebrow auth-eyebrow">{isRegister ? 'Criar acesso' : 'Entrar agora'}</p>
              <span className="auth-intro__line" />
            </div>
            <h1>{headline}</h1>
          </div>

          <p className="muted">{helperText}</p>

          <div className="auth-pills" aria-label="Recursos da autenticação">
            <span>{isRegister ? 'Cadastro guiado' : 'Login seguro'}</span>
            <span>{isRegister ? 'Painel liberado' : 'Retomada rápida'}</span>
            <span>Modo demonstração</span>
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

            <p className="auth-note">
              {isRegister
                ? 'Ao criar a conta, você já entra pronto para testar o fluxo.'
                : 'Se preferir, entre em modo demonstração e explore sem alterar dados reais.'}
            </p>

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
