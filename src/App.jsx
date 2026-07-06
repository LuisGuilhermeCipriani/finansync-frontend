import React from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import MetricCard from './components/MetricCard';
import SectionCard from './components/SectionCard';
import DataTable from './components/DataTable';
import QuickForm from './components/QuickForm';
import { getDashboard, getAccounts, getCategories, getTransactions, createAccount, createCategory, createTransaction } from './services/api';
import { mockAccounts, mockCategories, mockDashboard, mockTransactions } from './services/mockData';
import './styles/app.css';

const TAB_TITLES = {
  dashboard: 'Painel executivo',
  contas: 'Contas bancarias',
  categorias: 'Categorias financeiras',
  lancamentos: 'Lancamentos e fluxo'
};

const useApi = Boolean(import.meta.env.VITE_API_URL);

const emptyForm = {
  accountName: '',
  accountType: 'corrente',
  accountInstitution: '',
  accountBalance: '',
  categoryName: '',
  categoryType: 'expense',
  categoryColor: '#2563eb',
  transactionDescription: '',
  transactionAmount: '',
  transactionType: 'expense',
  transactionAccountId: '1',
  transactionCategoryId: '2'
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

function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');
  const [dashboard, setDashboard] = React.useState(mockDashboard);
  const [accounts, setAccounts] = React.useState(mockAccounts);
  const [categories, setCategories] = React.useState(mockCategories);
  const [transactions, setTransactions] = React.useState(mockTransactions);
  const [form, setForm] = React.useState(emptyForm);

  const loadData = React.useCallback(async () => {
    setError('');

    if (!useApi) {
      const nextDashboard = sumDashboardData(mockTransactions, mockAccounts, mockCategories);
      setDashboard(nextDashboard);
      setAccounts(mockAccounts);
      setCategories(mockCategories);
      setTransactions(mockTransactions);
      return;
    }

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

  React.useEffect(() => {
    loadData()
      .catch(() => {
        setError('Nao foi possivel conectar na API. Usando dados de demonstracao.');
        setDashboard(sumDashboardData(mockTransactions, mockAccounts, mockCategories));
        setAccounts(mockAccounts);
        setCategories(mockCategories);
        setTransactions(mockTransactions);
      })
      .finally(() => setLoading(false));
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
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
    const payload = {
      name: form.accountName,
      type: form.accountType,
      institution: form.accountInstitution,
      initialBalance: Number(form.accountBalance || 0)
    };

    if (!useApi) {
      const nextAccount = {
        id: Date.now(),
        currentBalance: payload.initialBalance,
        active: true,
        ...payload
      };
      setAccounts((current) => [nextAccount, ...current]);
      setDashboard((current) => ({ ...current, accounts: current.accounts + 1 }));
      setForm((current) => ({ ...current, accountName: '', accountInstitution: '', accountBalance: '' }));
      return;
    }

    try {
      const response = await createAccount(payload);
      setAccounts((current) => [response.data, ...current]);
      setForm((current) => ({ ...current, accountName: '', accountInstitution: '', accountBalance: '' }));
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

    if (!useApi) {
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
      const response = await createCategory(payload);
      setCategories((current) => [response.data, ...current]);
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

    if (!useApi) {
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
      const response = await createTransaction(payload);
      setTransactions((current) => [response.data, ...current]);
      setForm((current) => ({ ...current, transactionDescription: '', transactionAmount: '' }));
      await handleRefresh();
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
          { name: 'accountType', label: 'Tipo', placeholder: 'corrente' },
          { name: 'accountInstitution', label: 'Instituicao', placeholder: 'Banco X' },
          { name: 'accountBalance', label: 'Saldo inicial', type: 'number', min: 0, step: '0.01' }
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
          { name: 'categoryType', label: 'Tipo', placeholder: 'expense' },
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
        description="Registre entradas e saidas do caixa."
        fields={[
          { name: 'transactionDescription', label: 'Descricao', placeholder: 'Servicos prestados' },
          { name: 'transactionAmount', label: 'Valor', type: 'number', min: 0, step: '0.01' },
          { name: 'transactionType', label: 'Tipo', placeholder: 'expense' },
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
          <MetricCard label="Saldo atual" value={Number(dashboard.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} hint="Consolidado de receitas e despesas" tone="balance" />
          <MetricCard label="Receitas" value={Number(dashboard.income || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} hint="Valores positivos do periodo" tone="income" />
          <MetricCard label="Despesas" value={Number(dashboard.expense || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} hint="Saidas do periodo" tone="expense" />
          <MetricCard label="Lancamentos" value={String(dashboard.totalTransactions || 0)} hint="Movimentacoes registradas" tone="default" />
        </div>

        <div className="two-columns">
          <SectionCard title="Lancamentos recentes" description="Visao rapida das ultimas movimentacoes.">
            <DataTable columns={columns.transactions} rows={dashboard.recentTransactions || []} />
          </SectionCard>

          <SectionCard title="Contas em destaque" description="Saldos principais do usuario.">
            <DataTable columns={columns.accounts} rows={accounts.slice(0, 3)} />
          </SectionCard>
        </div>
      </>
    ),
    contas: (
      <div className="workspace-grid">
        <SectionCard title="Contas cadastradas" description="Lista das contas ativas no sistema.">
          <DataTable columns={columns.accounts} rows={accounts} />
        </SectionCard>
        {forms.contas}
      </div>
    ),
    categorias: (
      <div className="workspace-grid">
        <SectionCard title="Categorias cadastradas" description="Classifique receitas e despesas sem complicacao.">
          <DataTable columns={columns.categories} rows={categories} />
        </SectionCard>
        {forms.categorias}
      </div>
    ),
    lancamentos: (
      <div className="workspace-grid">
        <SectionCard title="Movimentacoes" description="Controle o fluxo de caixa em uma tela unica.">
          <DataTable columns={columns.transactions} rows={transactions} />
        </SectionCard>
        {forms.lancamentos}
      </div>
    )
  };

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />
      <main className="app-content">
        <Topbar
          title={TAB_TITLES[activeTab]}
          subtitle="Interface clara, responsiva e preparada para evoluir com o backend Oracle."
          onRefresh={handleRefresh}
          loading={refreshing}
        />

        {error ? <div className="alert">{error}</div> : null}
        {loading ? <div className="loading">Carregando experiencia financeira...</div> : mainContent[activeTab]}
      </main>
    </div>
  );
}

export default App;

