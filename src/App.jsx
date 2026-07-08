import React from 'react';
import AuthCard from './components/AuthCard';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import MetricCard from './components/MetricCard';
import SectionCard from './components/SectionCard';
import DataTable from './components/DataTable';
import QuickForm from './components/QuickForm';
import {
  getDashboard,
  getAccounts,
  getCategories,
  getTransactions,
  createAccount,
  createCategory,
  createTransaction,
  login as loginUser,
  register as registerUser,
  getMe,
  setAuthToken,
  clearAuthToken
} from './services/api';
import { mockAccounts, mockCategories, mockDashboard, mockTransactions } from './services/mockData';
import './styles/app.css';

const STORAGE_KEY = 'finansync_token';
const emptyDashboard = {
  accounts: 0,
  categories: 0,
  receita: 0,
  despesa: 0,
  balance: 0,
  totalTransactions: 0,
  recentTransactions: []
};

const TAB_TITLES = {
  dashboard: 'Painel executivo',
  contas: 'Contas bancarias',
  categorias: 'Categorias financeiras',
  lancamentos: 'Lancamentos e fluxo de caixa'
};

const emptyForm = {
  accountName: '',
  accountType: 'corrente',
  accountInstitution: '',
  accountBalance: '0',
  categoryName: '',
  categoryType: 'despesa',
  categoryColor: '#2563eb',
  transactionDescription: '',
  transactionAmount: '',
  transactionType: 'despesa',
  transactionAccountId: '',
  transactionCategoryId: ''
};

const emptyAuthForm = {
  name: '',
  email: '',
  password: ''
};

function sumDashboardData(transactions, accounts, categories) {
  const receita = transactions
    .filter((item) => normalizeMovementType(item.type) === 'receita')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const despesa = transactions
    .filter((item) => normalizeMovementType(item.type) === 'despesa')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    accounts: accounts.length,
    categories: categories.length,
    receita,
    despesa,
    balance: receita - despesa,
    totalTransactions: transactions.length,
    recentTransactions: transactions.slice(0, 5)
  };
}

function normalizeMovementType(value) {
  const normalized = String(value || '').toLowerCase();

  if (normalized === 'income' || normalized === 'receita') {
    return 'receita';
  }

  if (normalized === 'expense' || normalized === 'despesa') {
    return 'despesa';
  }

  return 'despesa';
}

function formatMovementType(value) {
  return normalizeMovementType(value) === 'receita' ? 'Receita' : 'Despesa';
}

function formatAccountType(value) {
  return value === 'poupanca' ? 'Poupança' : 'Corrente';
}

function parseCurrencyCents(value) {
  return Number(String(value ?? '').replace(/\D/g, '')) || 0;
}

function normalizeDashboardData(data) {
  return {
    accounts: Number(data?.accounts || 0),
    categories: Number(data?.categories || 0),
    receita: Number(data?.receita ?? data?.income ?? 0),
    despesa: Number(data?.despesa ?? data?.expense ?? 0),
    balance: Number(data?.balance || 0),
    totalTransactions: Number(data?.totalTransactions ?? data?.total_transactions ?? 0),
    recentTransactions: (data?.recentTransactions || data?.recent_transactions || []).map((item) => ({
      ...item,
      type: normalizeMovementType(item.type)
    }))
  };
}

function normalizeAccountData(item) {
  return {
    ...item,
    type: item?.type === 'poupanca' ? 'poupanca' : 'corrente'
  };
}

function normalizeCategoryData(item) {
  return {
    ...item,
    type: normalizeMovementType(item.type)
  };
}

function normalizeTransactionData(item) {
  return {
    ...item,
    type: normalizeMovementType(item.type),
    status: normalizeTransactionStatus(item.status)
  };
}

function normalizeTransactionStatus(value) {
  const normalized = String(value || '').toLowerCase();

  if (normalized === 'posted' || normalized === 'efetivado') {
    return 'efetivado';
  }

  return normalized ? normalized : 'efetivado';
}

function formatStatus(value) {
  const normalized = normalizeTransactionStatus(value);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function App() {
  const hasApi = Boolean(import.meta.env.VITE_API_URL);
  const [sessionMode, setSessionMode] = React.useState(hasApi ? 'auth' : 'demo');
  const [authStatus, setAuthStatus] = React.useState(hasApi ? 'signedOut' : 'demo');
  const [authView, setAuthView] = React.useState('login');
  const [authUser, setAuthUser] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(hasApi);
  const [authSubmitting, setAuthSubmitting] = React.useState(false);
  const [authError, setAuthError] = React.useState('');
  const [authNotice, setAuthNotice] = React.useState('');
  const [authForm, setAuthForm] = React.useState(emptyAuthForm);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');
  const [dashboard, setDashboard] = React.useState(mockDashboard);
  const [accounts, setAccounts] = React.useState(mockAccounts);
  const [categories, setCategories] = React.useState(mockCategories);
  const [transactions, setTransactions] = React.useState(mockTransactions);
  const [form, setForm] = React.useState(emptyForm);

  const loadDemoData = React.useCallback(() => {
    const nextAccounts = mockAccounts.map(normalizeAccountData);
    const nextCategories = mockCategories.map(normalizeCategoryData);
    const nextTransactions = mockTransactions.map(normalizeTransactionData);
    setDashboard(normalizeDashboardData(sumDashboardData(nextTransactions, nextAccounts, nextCategories)));
    setAccounts(nextAccounts);
    setCategories(nextCategories);
    setTransactions(nextTransactions);
  }, []);

  const resetWorkspaceData = React.useCallback(() => {
    setDashboard(emptyDashboard);
    setAccounts([]);
    setCategories([]);
    setTransactions([]);
  }, []);

  const loadRemoteData = React.useCallback(async () => {
    setError('');

    const [dashboardResponse, accountsResponse, categoriesResponse, transactionsResponse] = await Promise.all([
      getDashboard(),
      getAccounts(),
      getCategories(),
      getTransactions()
    ]);

    setDashboard(normalizeDashboardData(dashboardResponse.data));
    setAccounts((accountsResponse.data || []).map(normalizeAccountData));
    setCategories((categoriesResponse.data || []).map(normalizeCategoryData));
    setTransactions((transactionsResponse.data || []).map(normalizeTransactionData));
  }, []);

  const resetAuthState = React.useCallback(() => {
    setAuthUser(null);
    setAuthStatus(hasApi ? 'signedOut' : 'demo');
    setAuthView('login');
    setAuthForm(emptyAuthForm);
    setAuthLoading(false);
    setAuthSubmitting(false);
    setAuthError('');
    setAuthNotice('');
    setError('');
    resetWorkspaceData();
    setLoading(false);
  }, [hasApi, resetWorkspaceData]);

  React.useEffect(() => {
    const bootstrapSession = async () => {
      if (!hasApi) {
        loadDemoData();
        setAuthLoading(false);
        setLoading(false);
        return;
      }

      const storedToken = localStorage.getItem(STORAGE_KEY);
      if (!storedToken) {
        setAuthLoading(false);
        setLoading(false);
        return;
      }

      setAuthLoading(true);
      setLoading(true);
      setAuthToken(storedToken);

      try {
        const response = await getMe();
        setAuthUser(response.data);
        setSessionMode('auth');
        setAuthStatus('authenticated');
        resetWorkspaceData();

        try {
          await loadRemoteData();
        } catch {
          setError('Nao foi possivel carregar os dados agora.');
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        clearAuthToken();
        resetAuthState();
        setAuthNotice('Sua sessao expirou por seguranca. Entre novamente para continuar.');
      } finally {
        setAuthLoading(false);
        setLoading(false);
      }
    };

    void bootstrapSession();
  }, [hasApi, loadDemoData, loadRemoteData, resetAuthState, resetWorkspaceData]);

  const handleAuthChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthNotice('');

    const trimmedName = authForm.name.trim();
    const trimmedEmail = authForm.email.trim();
    const trimmedPassword = authForm.password.trim();

    if (authView === 'register' && !trimmedName) {
      setAuthError('Informe seu nome para criar a conta.');
      return;
    }

    if (!trimmedEmail) {
      setAuthError('Informe um e-mail valido.');
      return;
    }

    if (!trimmedPassword) {
      setAuthError('Informe sua senha.');
      return;
    }

    setAuthSubmitting(true);

    try {
      const payload =
        authView === 'register'
          ? { name: trimmedName, email: trimmedEmail, password: trimmedPassword }
          : { email: trimmedEmail, password: trimmedPassword };
      const response = authView === 'register' ? await registerUser(payload) : await loginUser(payload);
      const { token, user } = response.data;

      localStorage.setItem(STORAGE_KEY, token);
      setAuthToken(token);
      setAuthUser(user);
      setSessionMode('auth');
      setAuthStatus('authenticated');
      setLoading(true);
      resetWorkspaceData();
      try {
        await loadRemoteData();
      } catch {
        setError('Nao foi possivel carregar os dados agora.');
      }
    } catch (submissionError) {
      setAuthError(submissionError.message || 'Nao foi possivel autenticar.');
    } finally {
      setAuthSubmitting(false);
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    clearAuthToken();
    setSessionMode('demo');
    setAuthStatus('demo');
    setAuthUser(null);
    setAuthView('login');
    setAuthForm(emptyAuthForm);
    setAuthError('');
    setAuthNotice('Voce entrou em modo demonstracao. Os dados desta tela nao alteram sua conta real.');
    loadDemoData();
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    clearAuthToken();
    setAuthUser(null);
    setSessionMode('auth');
    setAuthStatus('signedOut');
    setAuthView('login');
    setAuthForm(emptyAuthForm);
    setActiveTab('dashboard');
    resetWorkspaceData();
    setAuthNotice('Voce saiu com seguranca. Quando quiser, entre novamente.');
    setLoading(false);
  };

  const handleRefresh = async () => {
    if (sessionMode === 'demo') {
      setRefreshing(true);
      try {
        loadDemoData();
      } finally {
        setRefreshing(false);
      }
      return;
    }

    setRefreshing(true);
    try {
      await loadRemoteData();
    } catch {
      setError('Nao foi possivel atualizar os dados agora.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  React.useEffect(() => {
    if (accounts.length > 0) {
      setForm((current) => {
        const hasSelectedAccount = accounts.some((account) => String(account.id) === String(current.transactionAccountId));
        if (hasSelectedAccount) {
          return current;
        }

        return {
          ...current,
          transactionAccountId: String(accounts[0].id)
        };
      });
    }

    if (categories.length > 0) {
      setForm((current) => {
        const hasSelectedCategory = categories.some((category) => String(category.id) === String(current.transactionCategoryId));
        if (hasSelectedCategory) {
          return current;
        }

        return {
          ...current,
          transactionCategoryId: String(categories[0].id)
        };
      });
    }
  }, [accounts, categories]);

  const handleSubmitAccount = async (event) => {
    event.preventDefault();
    const accountName = form.accountName.trim();
    const accountInstitution = form.accountInstitution.trim();

    if (!accountName || !accountInstitution) {
      setError('Preencha Nome da conta e Instituicao antes de salvar.');
      return;
    }

    setError('');
    const payload = {
      name: accountName,
      type: formatAccountType(form.accountType),
      institution: accountInstitution,
      initialBalance: parseCurrencyCents(form.accountBalance) / 100
    };

    if (sessionMode === 'demo') {
      const nextAccount = {
        id: Date.now(),
        currentBalance: payload.initialBalance,
        active: true,
        ...payload
      };
      setAccounts((current) => [nextAccount, ...current]);
      setDashboard((current) => ({ ...current, accounts: current.accounts + 1 }));
      setForm((current) => ({ ...current, accountName: '', accountInstitution: '', accountBalance: '0' }));
      return;
    }

    try {
      await createAccount(payload);
      await loadRemoteData();
      setForm((current) => ({ ...current, accountName: '', accountInstitution: '', accountBalance: '0' }));
    } catch {
      setError('Nao foi possivel salvar a conta.');
    }
  };

  const handleSubmitCategory = async (event) => {
    event.preventDefault();
    const categoryName = form.categoryName.trim();

    if (!categoryName) {
      setError('Preencha Nome da categoria antes de salvar.');
      return;
    }

    setError('');
    const payload = {
      name: categoryName,
      type: form.categoryType,
      color: form.categoryColor
    };

    if (sessionMode === 'demo') {
      const nextCategory = {
        id: Date.now(),
        active: true,
        ...payload
      };
      setCategories((current) => [nextCategory, ...current]);
      setDashboard((current) => ({ ...current, categories: current.categories + 1 }));
      setForm((current) => ({ ...current, categoryName: '' }));
      return;
    }

    try {
      await createCategory(payload);
      await loadRemoteData();
      setForm((current) => ({ ...current, categoryName: '' }));
    } catch {
      setError('Nao foi possivel salvar a categoria.');
    }
  };

  const handleSubmitTransaction = async (event) => {
    event.preventDefault();
    const transactionDescription = form.transactionDescription.trim();

    if (!transactionDescription) {
      setError('Preencha Descricao antes de salvar.');
      return;
    }

    setError('');
    const payload = {
      description: transactionDescription,
      amount: Number(form.transactionAmount || 0),
      type: form.transactionType,
      accountId: Number(form.transactionAccountId),
      categoryId: Number(form.transactionCategoryId)
    };

    if (sessionMode === 'demo') {
      const nextTransaction = {
        id: Date.now(),
        status: 'efetivado',
        transactionDate: new Date().toISOString(),
        ...payload
      };
      const nextTransactions = [nextTransaction, ...transactions];
      setTransactions(nextTransactions.map(normalizeTransactionData));
      setDashboard(normalizeDashboardData(sumDashboardData(nextTransactions, accounts, categories)));
      setForm((current) => ({ ...current, transactionDescription: '', transactionAmount: '' }));
      return;
    }

    try {
      await createTransaction(payload);
      setForm((current) => ({ ...current, transactionDescription: '', transactionAmount: '' }));
      await loadRemoteData();
    } catch {
      setError('Nao foi possivel salvar o lancamento.');
    }
  };

  const columns = {
    accounts: [
      { key: 'name', label: 'Nome' },
      { key: 'type', label: 'Tipo', render: (row) => formatAccountType(row.type) },
      { key: 'institution', label: 'Instituicao' },
      {
        key: 'currentBalance',
        label: 'Saldo',
        render: (row) => Number(row.currentBalance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      }
    ],
    categories: [
      { key: 'name', label: 'Nome' },
      { key: 'type', label: 'Tipo', render: (row) => formatMovementType(row.type) },
      {
        key: 'color',
        label: 'Cor',
        render: (row) => (
          <span className="color-swatch" title="Cor cadastrada" aria-label="Cor cadastrada">
            <span className="color-swatch__chip" style={{ backgroundColor: row.color }} aria-hidden="true" />
          </span>
        )
      },
      { key: 'active', label: 'Ativa', render: (row) => (row.active ? 'Sim' : 'Nao') }
    ],
    transactions: [
      { key: 'description', label: 'Descricao' },
      { key: 'type', label: 'Tipo', render: (row) => formatMovementType(row.type) },
      {
        key: 'accountId',
        label: 'Conta',
        render: (row) => accounts.find((item) => String(item.id) === String(row.accountId))?.name || `Conta ${row.accountId}`
      },
      {
        key: 'categoryId',
        label: 'Categoria',
        render: (row) =>
          categories.find((item) => String(item.id) === String(row.categoryId))?.name || `Categoria ${row.categoryId}`
      },
      {
        key: 'amount',
        label: 'Valor',
        render: (row) => Number(row.amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      },
      { key: 'status', label: 'Status', render: (row) => formatStatus(row.status) }
    ]
  };

  const transactionAccountOptions = accounts.map((account) => ({
    value: String(account.id),
    label: account.name
  }));
  const transactionCategoryOptions = categories.map((category) => ({
    value: String(category.id),
    label: category.name
  }));

  const forms = {
    contas: (
      <QuickForm
        title="Nova conta"
        description="Cadastre contas correntes, poupanca ou caixa."
        fields={[
          { name: 'accountName', label: 'Nome da conta', placeholder: 'Conta principal' },
          {
            name: 'accountType',
            label: 'Tipo',
            type: 'select',
            options: [
              { value: 'corrente', label: 'Corrente' },
              { value: 'poupanca', label: 'Poupança' }
            ]
          },
          { name: 'accountInstitution', label: 'Instituicao', placeholder: 'Banco X' },
          { name: 'accountBalance', label: 'Saldo inicial', type: 'currency', placeholder: 'R$ 0,00' }
        ]}
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmitAccount}
        submitLabel="Salvar conta"
      />
    ),
    categorias: (
      <QuickForm
        title="Nova categoria"
        description="Organize receitas e despesas com cores claras."
        fields={[
          { name: 'categoryName', label: 'Nome da categoria', placeholder: 'Aluguel' },
          {
            name: 'categoryType',
            label: 'Tipo',
            type: 'select',
            options: [
              { value: 'receita', label: 'Receita' },
              { value: 'despesa', label: 'Despesa' }
            ]
          },
          { name: 'categoryColor', label: 'Cor', type: 'color' }
        ]}
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmitCategory}
        submitLabel="Salvar categoria"
      />
    ),
    lancamentos: (
      <QuickForm
        title="Novo lancamento"
        description="Registre entradas e saidas do fluxo de caixa."
        fields={[
          { name: 'transactionDescription', label: 'Descricao', placeholder: 'Servicos prestados' },
          { name: 'transactionAmount', label: 'Valor', type: 'number', min: 0, step: '0.01' },
          {
            name: 'transactionType',
            label: 'Tipo',
            type: 'select',
            options: [
              { value: 'receita', label: 'Receita' },
              { value: 'despesa', label: 'Despesa' }
            ]
          },
          { name: 'transactionAccountId', label: 'Conta', type: 'select', options: transactionAccountOptions },
          { name: 'transactionCategoryId', label: 'Categoria', type: 'select', options: transactionCategoryOptions }
        ]}
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmitTransaction}
        submitLabel="Salvar lancamento"
      />
    )
  };

  const mainContent = {
    dashboard: (
      <>
        <div className="metrics-grid">
          <MetricCard
            label="Saldo atual"
            value={Number(dashboard.balance || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
            hint="Consolidado de receitas e despesas"
            tone="balance"
          />
          <MetricCard
            label="Receitas"
            value={Number(dashboard.receita || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
            hint="Valores positivos do periodo"
            tone="receita"
          />
          <MetricCard
            label="Despesas"
            value={Number(dashboard.despesa || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
            hint="Saidas do periodo"
            tone="despesa"
          />
          <MetricCard
            label="Lancamentos"
            value={String(dashboard.totalTransactions || 0)}
            hint="Movimentacoes registradas"
            tone="default"
          />
        </div>

        <div className="two-columns">
          <SectionCard
            title="Lancamentos recentes"
            description="Visao rapida das ultimas movimentacoes."
            action={<span className="section-card__chip">Ultimos 5</span>}
          >
            <DataTable columns={columns.transactions} rows={dashboard.recentTransactions || []} />
          </SectionCard>

          <SectionCard
            title="Contas em destaque"
            description="Saldos principais do usuario."
            action={<span className="section-card__chip">Top 3</span>}
          >
            <DataTable columns={columns.accounts} rows={accounts.slice(0, 3)} />
          </SectionCard>
        </div>
      </>
    ),
    contas: (
      <div className="workspace-grid">
        <SectionCard
          title="Contas cadastradas"
          description="Lista das contas ativas no sistema."
          action={<span className="section-card__chip">Base atual</span>}
        >
          <DataTable columns={columns.accounts} rows={accounts} />
        </SectionCard>
        {forms.contas}
      </div>
    ),
    categorias: (
      <div className="workspace-grid">
        <SectionCard
          title="Categorias cadastradas"
          description="Classifique receitas e despesas sem complicacao."
          action={<span className="section-card__chip">Organizacao</span>}
        >
          <DataTable columns={columns.categories} rows={categories} />
        </SectionCard>
        {forms.categorias}
      </div>
    ),
    lancamentos: (
      <div className="workspace-grid">
        <SectionCard
          title="Movimentacoes"
          description="Controle o fluxo de caixa em uma tela unica."
          action={<span className="section-card__chip">Fluxo completo</span>}
        >
          <DataTable columns={columns.transactions} rows={transactions} />
        </SectionCard>
        {forms.lancamentos}
      </div>
    )
  };

  if (authLoading) {
    return <div className="loading loading--full">Carregando sessao...</div>;
  }

  if (sessionMode === 'auth' && authStatus !== 'authenticated') {
    return (
      <AuthCard
        mode={authView}
        values={authForm}
        onChange={handleAuthChange}
        onSubmit={handleAuthSubmit}
        onToggleMode={() => setAuthView((current) => (current === 'login' ? 'register' : 'login'))}
        onDemoMode={handleUseDemo}
        loading={authSubmitting}
        error={authError}
        notice={authNotice}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />
      <main className="app-content">
        <Topbar
          title={TAB_TITLES[activeTab]}
          subtitle="Interface clara, responsiva e pronta para trabalhar com a API protegida."
          onRefresh={handleRefresh}
          loading={refreshing}
          user={authUser}
          onLogout={sessionMode === 'demo' ? null : handleLogout}
          modeLabel={
            sessionMode === 'demo'
              ? 'Modo demonstracao'
              : authStatus === 'authenticated'
                ? 'Sessao autenticada'
                : 'Acesso encerrado'
          }
        />

        {error ? <div className="alert">{error}</div> : null}
        {loading ? <div className="loading">Carregando experiencia financeira...</div> : mainContent[activeTab]}
      </main>
    </div>
  );
}

export default App;
