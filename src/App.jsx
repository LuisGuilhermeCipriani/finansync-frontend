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
  income: 0,
  expense: 0,
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
  categoryType: 'expense',
  categoryColor: '#2563eb',
  transactionDescription: '',
  transactionAmount: '',
  transactionType: 'expense',
  transactionAccountId: '1',
  transactionCategoryId: '2'
};

const emptyAuthForm = {
  name: '',
  email: '',
  password: ''
};

function sumDashboardData(transactions, accounts, categories) {
  const income = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const expense = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    accounts: accounts.length,
    categories: categories.length,
    income,
    expense,
    balance: income - expense,
    totalTransactions: transactions.length,
    recentTransactions: transactions.slice(0, 5)
  };
}

function formatAccountType(value) {
  return value === 'poupanca' ? 'Poupança' : 'Corrente';
}

function parseCurrencyCents(value) {
  return Number(String(value ?? '').replace(/\D/g, '')) || 0;
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
    const nextDashboard = sumDashboardData(mockTransactions, mockAccounts, mockCategories);
    setDashboard(nextDashboard);
    setAccounts(mockAccounts);
    setCategories(mockCategories);
    setTransactions(mockTransactions);
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

    setDashboard(dashboardResponse.data);
    setAccounts(accountsResponse.data);
    setCategories(categoriesResponse.data);
    setTransactions(transactionsResponse.data);
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
    const payload = {
      name: form.categoryName,
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
    const payload = {
      description: form.transactionDescription,
      amount: Number(form.transactionAmount || 0),
      type: form.transactionType,
      accountId: Number(form.transactionAccountId),
      categoryId: Number(form.transactionCategoryId)
    };

    if (sessionMode === 'demo') {
      const nextTransaction = {
        id: Date.now(),
        status: 'posted',
        transactionDate: new Date().toISOString(),
        ...payload
      };
      const nextTransactions = [nextTransaction, ...transactions];
      setTransactions(nextTransactions);
      setDashboard(sumDashboardData(nextTransactions, accounts, categories));
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
      { key: 'type', label: 'Tipo' },
      { key: 'institution', label: 'Instituicao' },
      {
        key: 'currentBalance',
        label: 'Saldo',
        render: (row) => Number(row.currentBalance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      }
    ],
    categories: [
      { key: 'name', label: 'Nome' },
      { key: 'type', label: 'Tipo' },
      { key: 'color', label: 'Cor' },
      { key: 'active', label: 'Ativa', render: (row) => (row.active ? 'Sim' : 'Nao') }
    ],
    transactions: [
      { key: 'description', label: 'Descricao' },
      { key: 'type', label: 'Tipo' },
      {
        key: 'amount',
        label: 'Valor',
        render: (row) => Number(row.amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      },
      { key: 'status', label: 'Status' }
    ]
  };

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
              { value: 'income', label: 'Receita' },
              { value: 'expense', label: 'Despesa' }
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
              { value: 'income', label: 'Receita' },
              { value: 'expense', label: 'Despesa' }
            ]
          },
          { name: 'transactionAccountId', label: 'Conta ID', type: 'number', min: 1 },
          { name: 'transactionCategoryId', label: 'Categoria ID', type: 'number', min: 1 }
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
            value={Number(dashboard.income || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
            hint="Valores positivos do periodo"
            tone="income"
          />
          <MetricCard
            label="Despesas"
            value={Number(dashboard.expense || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
            hint="Saidas do periodo"
            tone="expense"
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
