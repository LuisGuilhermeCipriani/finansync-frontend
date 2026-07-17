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
  deleteAccount,
  createCategory,
  updateCategory,
  deleteCategory,
  createTransaction,
  login as loginUser,
  register as registerUser,
  updateMe,
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
  contas: 'Contas bancárias',
  categorias: 'Categorias financeiras',
  lancamentos: 'Lançamentos e fluxo de caixa'
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
  transactionAmount: '0',
  transactionType: 'despesa',
  transactionAccountId: '',
  transactionCategoryId: ''
};

const emptyAuthForm = {
  name: '',
  email: '',
  password: ''
};

const emptyProfileForm = {
  name: '',
  email: '',
  currentPassword: '',
  newPassword: ''
};

function sumDashboardData(transactions, accounts, categories) {
  const receita = transactions
    .filter((item) => normalizarTipoMovimento(item.type) === 'receita')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const despesa = transactions
    .filter((item) => normalizarTipoMovimento(item.type) === 'despesa')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const cashFlowBalance = receita - despesa;
  const accountBalance = accounts.reduce((sum, account) => sum + Number(account.currentBalance || 0), 0);

  return {
    accounts: accounts.length,
    categories: categories.length,
    receita,
    despesa,
    cashFlowBalance,
    balance: accountBalance,
    totalTransactions: transactions.length,
    recentTransactions: transactions.slice(0, 5)
  };
}

function normalizarTipoMovimento(value) {
  const normalized = String(value || '').toLowerCase();

  if (normalized === 'income' || normalized === 'receita') {
    return 'receita';
  }

  if (normalized === 'expense' || normalized === 'despesa') {
    return 'despesa';
  }

  return 'despesa';
}

function getCategoriasPorTipo(categorias, tipoMovimento) {
  const normalizedType = normalizarTipoMovimento(tipoMovimento);

  return categorias.filter((categoria) => normalizarTipoMovimento(categoria.type) === normalizedType);
}

function formatarTipoMovimento(value) {
  return normalizarTipoMovimento(value) === 'receita' ? 'Receita' : 'Despesa';
}

function formatarTipoConta(value) {
  const normalized = String(value || '').toLowerCase();

  if (normalized === 'poupanca') {
    return 'Poupança';
  }

  if (normalized === 'caixa') {
    return 'Caixa';
  }

  return 'Corrente';
}

function parseCurrencyCents(value) {
  return Number(String(value ?? '').replace(/\D/g, '')) || 0;
}

function normalizarDadosDashboard(data) {
  return {
    accounts: Number(data?.accounts || 0),
    categories: Number(data?.categories || 0),
    receita: Number(data?.receita ?? data?.income ?? 0),
    despesa: Number(data?.despesa ?? data?.expense ?? 0),
    balance: Number(data?.balance ?? data?.accountBalance ?? 0),
    cashFlowBalance: Number(data?.cashFlowBalance ?? data?.flowBalance ?? 0),
    totalTransactions: Number(data?.totalTransactions ?? data?.total_transactions ?? 0),
    recentTransactions: (data?.recentTransactions || data?.recent_transactions || []).map((item) => ({
      ...item,
      type: normalizarTipoMovimento(item.type)
    }))
  };
}

function normalizarConta(item) {
  const normalizedType = String(item?.type || '').toLowerCase();
  const normalizedId = item?.id ?? item?.accountId ?? item?.account_id ?? null;

  return {
    ...item,
    id: normalizedId,
    type: normalizedType === 'poupanca' || normalizedType === 'caixa' ? normalizedType : 'corrente'
  };
}

function normalizarCategoria(item) {
  const normalizedId = item?.id ?? item?.categoryId ?? item?.category_id ?? null;

  return {
    ...item,
    id: normalizedId,
    type: normalizarTipoMovimento(item.type)
  };
}

function normalizarLancamento(item) {
  return {
    ...item,
    type: normalizarTipoMovimento(item.type),
    status: normalizarStatusLancamento(item.status)
  };
}

function normalizarStatusLancamento(value) {
  const normalized = String(value || '').toLowerCase();

  if (normalized === 'posted' || normalized === 'efetivado') {
    return 'efetivado';
  }

  return normalized ? normalized : 'efetivado';
}

function formatarStatus(value) {
  const normalized = normalizarStatusLancamento(value);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function parseHexColor(value) {
  const hex = String(value || '').trim().replace('#', '');

  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16)
    };
  }

  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    };
  }

  return null;
}

function getContrastTextColor(backgroundColor) {
  const rgb = parseHexColor(backgroundColor);

  if (!rgb) {
    return '#ffffff';
  }

  const luminance = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return luminance >= 160 ? '#000000' : '#ffffff';
}

function buildTransactionDescriptionStyle(backgroundColor) {
  const safeBackgroundColor = backgroundColor || '#2563eb';

  return {
    '--transaction-description-bg': safeBackgroundColor,
    '--transaction-description-fg': getContrastTextColor(safeBackgroundColor)
  };
}

function buildCategoryColorStyle(backgroundColor) {
  const safeBackgroundColor = backgroundColor || '#2563eb';

  return {
    backgroundColor: safeBackgroundColor,
    color: getContrastTextColor(safeBackgroundColor),
    width: '10rem'
  };
}

function buildSelectionValue(id, label) {
  return `${String(id ?? '').trim()}::${String(label ?? '').trim()}`;
}

function parseSelectionValue(value) {
  const rawValue = String(value ?? '');
  const separatorIndex = rawValue.indexOf('::');

  if (separatorIndex === -1) {
    return {
      id: rawValue.trim(),
      label: ''
    };
  }

  return {
    id: rawValue.slice(0, separatorIndex).trim(),
    label: rawValue.slice(separatorIndex + 2).trim()
  };
}

function findSelectedOption(options, selectionValue) {
  const { id, label } = parseSelectionValue(selectionValue);

  const byId = options.find((option) => String(option.id ?? '') === id);
  if (byId) {
    return byId;
  }

  const normalizedLabel = label.toLowerCase();
  if (!normalizedLabel) {
    return null;
  }

  return options.find((option) => String(option.name || '').trim().toLowerCase() === normalizedLabel) || null;
}

function belongsToUser(item, userId) {
  if (!userId) {
    return true;
  }

  if (item?.userId === undefined || item?.userId === null) {
    return true;
  }

  return String(item.userId) === String(userId);
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
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [profileSubmitting, setProfileSubmitting] = React.useState(false);
  const [profileError, setProfileError] = React.useState('');
  const [profileForm, setProfileForm] = React.useState(emptyProfileForm);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [dashboard, setDashboard] = React.useState(mockDashboard);
  const [accounts, setAccounts] = React.useState(mockAccounts);
  const [categories, setCategories] = React.useState(mockCategories);
  const [transactions, setTransactions] = React.useState(mockTransactions);
  const [form, setForm] = React.useState(emptyForm);
  const [categoryEditingId, setCategoryEditingId] = React.useState(null);

  React.useEffect(() => {
    if (!error) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setError('');
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [error]);

  React.useEffect(() => {
    if (error) {
      setError('');
    }
  }, [activeTab]);

  React.useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab, authView, sessionMode, authStatus]);

  React.useEffect(() => {
    if (authView !== 'login') {
      setAuthNotice('');
    }
  }, [authView]);

  const loadDemoData = React.useCallback(() => {
    const nextAccounts = mockAccounts.map(normalizarConta);
    const nextCategories = mockCategories.map(normalizarCategoria);
    const nextTransactions = mockTransactions.map(normalizarLancamento);
    setDashboard(normalizarDadosDashboard(sumDashboardData(nextTransactions, nextAccounts, nextCategories)));
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

  const loadRemoteData = React.useCallback(async (currentUserId = authUser?.id) => {
    setError('');

    const [dashboardResponse, accountsResponse, categoriesResponse, transactionsResponse] = await Promise.all([
      getDashboard(),
      getAccounts(),
      getCategories(),
      getTransactions()
    ]);

    const nextAccounts = (accountsResponse.data || [])
      .map(normalizarConta)
      .filter((item) => belongsToUser(item, currentUserId));
    const nextCategories = (categoriesResponse.data || [])
      .map(normalizarCategoria)
      .filter((item) => belongsToUser(item, currentUserId));
    const nextTransactions = (transactionsResponse.data || [])
      .map(normalizarLancamento)
      .filter((item) => belongsToUser(item, currentUserId));

    const dashboardData = dashboardResponse.data || {};
    const nextDashboard = normalizarDadosDashboard(sumDashboardData(nextTransactions, nextAccounts, nextCategories));

    setDashboard({
      ...nextDashboard,
      receita: Number(dashboardData?.receita ?? dashboardData?.income ?? nextDashboard.receita ?? 0),
      despesa: Number(dashboardData?.despesa ?? dashboardData?.expense ?? nextDashboard.despesa ?? 0),
      recentTransactions: nextDashboard.recentTransactions
    });
    setAccounts(nextAccounts);
    setCategories(nextCategories);
    setTransactions(nextTransactions);
  }, [authUser?.id]);

  React.useEffect(() => {
    if (activeTab !== 'lancamentos' || sessionMode !== 'auth' || authStatus !== 'authenticated') {
      return undefined;
    }

    void loadRemoteData();
    return undefined;
  }, [activeTab, authStatus, loadRemoteData, sessionMode]);

  const resetAuthState = React.useCallback(() => {
    setAuthUser(null);
    setAuthStatus(hasApi ? 'signedOut' : 'demo');
    setAuthView('login');
    setAuthForm(emptyAuthForm);
    setProfileOpen(false);
    setProfileSubmitting(false);
    setProfileError('');
    setProfileForm(emptyProfileForm);
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
          await loadRemoteData(response.data?.id);
        } catch {
          setError('Não foi possível carregar os dados agora');
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        clearAuthToken();
        resetAuthState();
        setAuthNotice('Sua sessão expirou por segurança. Entre novamente para continuar');
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
      setAuthError('Informe seu nome para criar a conta');
      return;
    }

    if (!trimmedEmail) {
      setAuthError('Informe um e-mail válido');
      return;
    }

    if (!trimmedPassword) {
      setAuthError('Informe sua senha');
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
        await loadRemoteData(response.data?.id);
      } catch {
        setError('Não foi possível carregar os dados agora');
      }
    } catch (submissionError) {
      setAuthError(submissionError.message || 'Não foi possível autenticar');
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
    setAuthNotice('Você entrou em modo demonstração. Os dados desta tela não alteram sua conta real');
    loadDemoData();
    setLoading(false);
  };

  const handleReturnToLogin = () => {
    localStorage.removeItem(STORAGE_KEY);
    clearAuthToken();
    setAuthUser(null);
    setProfileOpen(false);
    setProfileSubmitting(false);
    setProfileError('');
    setProfileForm(emptyProfileForm);
    setSessionMode('auth');
    setAuthStatus('signedOut');
    setAuthView('login');
    setAuthForm(emptyAuthForm);
    setActiveTab('dashboard');
    resetWorkspaceData();
    setAuthNotice('');
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    clearAuthToken();
    setAuthUser(null);
    setProfileOpen(false);
    setProfileSubmitting(false);
    setProfileError('');
    setProfileForm(emptyProfileForm);
    setSessionMode('auth');
    setAuthStatus('signedOut');
    setAuthView('login');
    setAuthForm(emptyAuthForm);
    setActiveTab('dashboard');
    resetWorkspaceData();
    setAuthNotice('Você saiu com segurança. Quando quiser, entre novamente');
    setLoading(false);
  };

  const handleOpenProfile = () => {
    if (!authUser) {
      return;
    }

    setProfileForm({
      name: authUser.name || '',
      email: authUser.email || '',
      currentPassword: '',
      newPassword: ''
    });
    setProfileError('');
    setProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setProfileOpen(false);
    setProfileSubmitting(false);
    setProfileError('');
    setProfileForm(emptyProfileForm);
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError('');

    const name = profileForm.name.trim();
    const email = profileForm.email.trim();
    const currentPassword = profileForm.currentPassword.trim();
    const newPassword = profileForm.newPassword.trim();

    if (!name) {
      setProfileError('Informe seu nome');
      return;
    }

    if (!email) {
      setProfileError('Informe um e-mail válido');
      return;
    }

    if (!currentPassword) {
      setProfileError('Informe sua senha atual');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setProfileError('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    setProfileSubmitting(true);

    try {
      const response = await updateMe({
        name,
        email,
        currentPassword,
        newPassword: newPassword || undefined
      });
      const { token, user } = response.data;

      localStorage.setItem(STORAGE_KEY, token);
      setAuthToken(token);
      setAuthUser(user);
      setProfileOpen(false);
      setAuthNotice('Dados do usuário atualizados com sucesso');
      setProfileForm(emptyProfileForm);
    } catch (updateError) {
      setProfileError(updateError?.message || 'Não foi possível atualizar os dados do usuário');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetCategoryForm = React.useCallback(() => {
    setForm((current) => ({
      ...current,
      categoryName: '',
      categoryType: 'despesa',
      categoryColor: '#2563eb'
    }));
    setCategoryEditingId(null);
  }, []);

  React.useEffect(() => {
    setForm((current) => {
      const selectedAccount = findSelectedOption(accounts, current.transactionAccountId);

      if (selectedAccount || current.transactionAccountId === '') {
        return current;
      }

      return {
        ...current,
        transactionAccountId: ''
      };
    });
  }, [accounts]);

  React.useEffect(() => {
    setForm((current) => {
      const categoriasDoTipo = getCategoriasPorTipo(categories, current.transactionType);
      const selectedCategory = findSelectedOption(categoriasDoTipo, current.transactionCategoryId);

      if (selectedCategory || current.transactionCategoryId === '') {
        return current;
      }

      if (categoriasDoTipo.length === 0) {
        return current.transactionCategoryId ? { ...current, transactionCategoryId: '' } : current;
      }

      return {
        ...current,
        transactionCategoryId: ''
      };
    });
  }, [categories, form.transactionType]);

  const handleSubmitAccount = async (event) => {
    event.preventDefault();
    const accountName = form.accountName.trim();
    const accountInstitution = form.accountInstitution.trim();

    if (!accountName || !accountInstitution) {
      setError('Preencha Nome da conta e Instituição antes de salvar');
      return;
    }

    setError('');
    const payload = {
      name: accountName,
      type: formatarTipoConta(form.accountType),
      institution: accountInstitution,
      initialBalance: Number(form.accountBalance || 0)
    };

    if (sessionMode === 'demo') {
      const nextAccount = {
        id: Date.now(),
        currentBalance: payload.initialBalance,
        active: true,
        ...payload
      };
      setAccounts((current) => {
        const nextAccounts = [nextAccount, ...current];
        setDashboard((dashboardCurrent) => ({
          ...dashboardCurrent,
          accounts: nextAccounts.length,
          balance: nextAccounts.reduce((sum, account) => sum + Number(account.currentBalance || 0), 0)
        }));
        return nextAccounts;
      });
      setForm((current) => ({ ...current, accountName: '', accountInstitution: '', accountBalance: '0' }));
      return;
    }

    try {
      await createAccount(payload);
      await loadRemoteData();
      setForm((current) => ({ ...current, accountName: '', accountInstitution: '', accountBalance: '0' }));
    } catch {
      setError('Não foi possível salvar a conta');
    }
  };

  const handleDeleteAccount = async (account) => {
    const confirmed = window.confirm(`Tem certeza que deseja excluir a conta "${account.name}"?`);
    if (!confirmed) {
      return;
    }

    if (sessionMode === 'demo') {
      setAccounts((current) => {
        const nextAccounts = current.filter((item) => String(item.id) !== String(account.id));
        setDashboard((dashboardCurrent) => ({
          ...dashboardCurrent,
          accounts: nextAccounts.length,
          balance: nextAccounts.reduce((sum, item) => sum + Number(item.currentBalance || 0), 0)
        }));
        return nextAccounts;
      });
      return;
    }

    try {
      await deleteAccount(account.id);
      await loadRemoteData();
    } catch (deleteError) {
      const deleteMessage = deleteError?.message || '';
      const accountDeleteFallback = 'Não é possível excluir esta conta porque ela possui lançamentos vinculados';
      if (
        deleteMessage.toLowerCase().includes('nao encontrada') ||
        deleteMessage.toLowerCase().includes('não encontrada')
      ) {
        setError(accountDeleteFallback);
        return;
      }

      setError(deleteMessage || 'Não foi possível excluir a conta');
    }
  };

  const handleSubmitCategory = async (event) => {
    event.preventDefault();
    const categoryName = form.categoryName.trim();

    if (!categoryName) {
      setError('Preencha Nome da categoria antes de salvar');
      return;
    }

    setError('');
    const payload = {
      name: categoryName,
      type: form.categoryType,
      color: form.categoryColor
    };

    if (sessionMode === 'demo') {
      if (categoryEditingId) {
        setCategories((current) =>
          current.map((category) =>
            String(category.id) === String(categoryEditingId)
              ? { ...category, ...payload }
              : category
          )
        );
      } else {
        const nextCategory = {
          id: Date.now(),
          active: true,
          ...payload
        };
        setCategories((current) => [nextCategory, ...current]);
        setDashboard((current) => ({ ...current, categories: current.categories + 1 }));
      }

      resetCategoryForm();
      return;
    }

    try {
      if (categoryEditingId) {
        await updateCategory(categoryEditingId, payload);
      } else {
        await createCategory(payload);
      }
      await loadRemoteData();
      resetCategoryForm();
    } catch {
      setError('Não foi possível salvar a categoria');
    }
  };

  const handleEditCategory = (category) => {
    setActiveTab('categorias');
    setCategoryEditingId(category.id);
    setForm((current) => ({
      ...current,
      categoryName: category.name || '',
      categoryType: normalizarTipoMovimento(category.type),
      categoryColor: category.color || '#2563eb'
    }));
  };

  const handleCancelCategoryEdit = () => {
    resetCategoryForm();
  };

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`);
    if (!confirmed) {
      return;
    }

    if (sessionMode === 'demo') {
      const hasLinkedTransactions = transactions.some((item) => String(item.categoryId) === String(category.id));
      if (hasLinkedTransactions) {
        setError('Não é possível excluir esta categoria porque ela possui lançamentos vinculados');
        return;
      }

      setCategories((current) => {
        const nextCategories = current.filter((item) => String(item.id) !== String(category.id));
        setDashboard((dashboardCurrent) => ({
          ...dashboardCurrent,
          categories: nextCategories.length
        }));
        return nextCategories;
      });
      resetCategoryForm();
      return;
    }

    try {
      await deleteCategory(category.id);
      await loadRemoteData();
      resetCategoryForm();
    } catch (deleteError) {
      setError(deleteError?.message || 'Não foi possível excluir a categoria');
    }
  };

  const handleSubmitTransaction = async (event) => {
    event.preventDefault();
    const transactionDescription = form.transactionDescription.trim();

    if (!transactionDescription) {
      setError('Preencha Descrição antes de salvar');
      return;
    }

    if (categories.length === 0) {
      setError('Por favor, crie uma categoria primeiro');
      return;
    }

    if (accounts.length === 0) {
      setError('Por favor, crie uma conta primeiro');
      return;
    }

    let currentAccounts = accounts;
    let currentCategories = categories;

    if (sessionMode !== 'demo') {
      try {
        const [freshAccountsResponse, freshCategoriesResponse] = await Promise.all([getAccounts(), getCategories()]);
        currentAccounts = (freshAccountsResponse.data || []).map(normalizarConta);
        currentCategories = (freshCategoriesResponse.data || []).map(normalizarCategoria);
      } catch {
        currentAccounts = accounts;
        currentCategories = categories;
      }
    }

    const selectedAccount = findSelectedOption(currentAccounts, form.transactionAccountId);
    const currentCategoriesByType = getCategoriasPorTipo(currentCategories, form.transactionType);
    const selectedCategory = findSelectedOption(currentCategoriesByType, form.transactionCategoryId);

    if (!selectedAccount) {
      setError('Selecione uma conta cadastrada para salvar o lançamento');
      return;
    }

    if (!selectedCategory) {
      if (currentCategoriesByType.length === 0) {
        setError(`Por favor, crie uma categoria do tipo ${normalizarTipoMovimento(form.transactionType)} primeiro`);
      } else {
        setError(`Selecione uma categoria do tipo ${normalizarTipoMovimento(form.transactionType)} para salvar o lançamento`);
      }
      return;
    }

    setError('');
    const payload = {
      description: transactionDescription,
      amount: Number(form.transactionAmount || 0),
      type: form.transactionType,
      accountId: Number(selectedAccount.id),
      accountName: selectedAccount.name,
      categoryId: Number(selectedCategory.id),
      categoryName: selectedCategory.name
    };

    if (sessionMode === 'demo') {
      const nextTransaction = {
        id: Date.now(),
        status: 'efetivado',
        transactionDate: new Date().toISOString(),
        ...payload
      };
      const movementDelta = normalizarTipoMovimento(payload.type) === 'receita' ? Number(payload.amount || 0) : Number(payload.amount || 0) * -1;
      const nextAccounts = accounts.map((account) =>
        String(account.id) === String(payload.accountId)
          ? { ...account, currentBalance: Number(account.currentBalance || 0) + movementDelta }
          : account
      );
      const nextTransactions = [nextTransaction, ...transactions];
      setAccounts(nextAccounts);
      setTransactions(nextTransactions.map(normalizarLancamento));
      setDashboard(normalizarDadosDashboard(sumDashboardData(nextTransactions, nextAccounts, categories)));
      setForm((current) => ({ ...current, transactionDescription: '', transactionAmount: '0' }));
      return;
    }

    try {
      await createTransaction(payload);
      setForm((current) => ({ ...current, transactionDescription: '', transactionAmount: '0' }));
      await loadRemoteData();
    } catch (createError) {
      const createMessage = String(createError?.message || '');
      if (createMessage.toLowerCase().includes('conta informada')) {
        const fallbackAccount = accounts.find(
          (account) => String(account.name || '').trim().toLowerCase() === String(selectedAccount.name || '').trim().toLowerCase()
        );

        if (fallbackAccount && String(fallbackAccount.id) !== String(selectedAccount.id)) {
          try {
            await createTransaction({
              ...payload,
              accountId: Number(fallbackAccount.id)
            });
            setForm((current) => ({ ...current, transactionDescription: '', transactionAmount: '0' }));
            await loadRemoteData();
            return;
          } catch (retryError) {
            const retryMessage = String(retryError?.message || '');
            if (retryMessage.toLowerCase().includes('conta informada')) {
              setError('Selecione uma conta cadastrada para salvar o lançamento');
              return;
            }

            if (retryMessage.toLowerCase().includes('categoria')) {
              setError('Por favor, crie uma categoria primeiro');
              return;
            }

            setError(retryMessage || 'Não foi possível salvar o lançamento');
            return;
          }
        }

        setError('Selecione uma conta cadastrada para salvar o lançamento');
        return;
      }

      if (createMessage.toLowerCase().includes('categoria')) {
        setError('Por favor, crie uma categoria primeiro');
        return;
      }

      setError(createMessage || 'Não foi possível salvar o lançamento');
    }
  };

  const columns = {
    accounts: [
      { key: 'name', label: 'Nome' },
      { key: 'type', label: 'Tipo', render: (row) => formatarTipoConta(row.type) },
      { key: 'institution', label: 'Instituição' },
      {
        key: 'currentBalance',
        label: 'Saldo',
        render: (row) => Number(row.currentBalance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      },
      {
        key: 'actions',
        label: 'Ações',
        render: (row) => (
          <button
            type="button"
            className="button button--ghost table-action-button"
            onClick={() => handleDeleteAccount(row)}
          >
            Excluir
          </button>
        )
      }
    ],
    categories: [
      {
        key: 'name',
        label: 'Nome',
        className: 'category-name-cell'
      },
      {
        key: 'type',
        label: 'Tipo',
        render: (row) => formatarTipoMovimento(row.type)
      },
      {
        key: 'color',
        label: 'Cor',
        className: 'category-color-cell',
        render: (row) => (
          <span
            className="category-color-chip"
            style={buildCategoryColorStyle(row.color)}
            aria-label={`Cor cadastrada: ${row.color}`}
            title={`Cor cadastrada: ${row.color}`}
          />
        )
      },
      {
        key: 'active',
        label: 'Ativa',
        className: 'category-active-cell',
        render: (row) => (row.active ? 'Sim' : 'Não')
      },
      {
        key: 'actions',
        label: 'Ações',
        className: 'category-actions-cell',
        render: (row) => (
          <div className="table-actions">
            <button
              type="button"
              className="button button--ghost table-action-button"
              onClick={() => handleEditCategory(row)}
            >
              Editar
            </button>
            <button
              type="button"
              className="button button--ghost table-action-button"
              onClick={() => handleDeleteCategory(row)}
            >
              Excluir
            </button>
          </div>
        )
      }
    ],
    transactions: [
      { key: 'description', label: 'Descrição' },
      { key: 'type', label: 'Tipo', render: (row) => formatarTipoMovimento(row.type) },
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
      { key: 'status', label: 'Status', render: (row) => formatarStatus(row.status) }
    ]
  };

  const launchTransactionColumns = [
    {
      key: 'description',
      label: 'Descrição',
      render: (row) => row.description
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (row) => formatarTipoMovimento(row.type)
    },
    {
      key: 'accountId',
      label: 'Conta',
      render: (row) => accounts.find((item) => String(item.id) === String(row.accountId))?.name || `Conta ${row.accountId}`
    },
    {
      key: 'categoryId',
      label: 'Categoria',
      className: 'transaction-category-cell',
      style: (row) => {
        const category = categories.find((item) => String(item.id) === String(row.categoryId));
        return buildTransactionDescriptionStyle(category?.color);
      },
      render: (row) =>
        categories.find((item) => String(item.id) === String(row.categoryId))?.name || `Categoria ${row.categoryId}`
    },
    {
      key: 'amount',
      label: 'Valor',
      render: (row) => Number(row.amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => formatarStatus(row.status)
    }
  ];

  const transactionAccountOptions = accounts.map((account) => ({
    value: buildSelectionValue(account.id, account.name),
    label: account.name
  })).filter((account) => account.value.trim());
  const transactionCategoryOptions = getCategoriasPorTipo(categories, form.transactionType).map((category) => ({
    value: buildSelectionValue(category.id, category.name),
    label: category.name
  })).filter((category) => category.value.trim());

  const forms = {
    contas: (
      <QuickForm
        title="Nova conta"
        description="Cadastre contas correntes, poupança ou caixa"
        fields={[
          { name: 'accountName', label: 'Nome da conta', placeholder: 'Ex: Conta X' },
          {
            name: 'accountType',
            label: 'Tipo',
            type: 'select',
            options: [
              { value: 'corrente', label: 'Corrente' },
              { value: 'poupanca', label: 'Poupança' },
              { value: 'caixa', label: 'Caixa' }
            ]
          },
          { name: 'accountInstitution', label: 'Instituição', placeholder: 'Ex: Banco X' },
          { name: 'accountBalance', label: 'Saldo inicial', type: 'currency', placeholder: 'R$ 0,00' }
        ]}
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmitAccount}
        submitLabel="Salvar conta"
      />
    ),
    categorias: (
      <div>
        <QuickForm
          title={categoryEditingId ? 'Editar categoria' : 'Nova categoria'}
          description={categoryEditingId ? 'Os campos abaixo mostram a categoria selecionada para edição' : 'Organize receitas e despesas com cores desejadas'}
          fields={[
            { name: 'categoryName', label: 'Nome da categoria', placeholder: 'Ex: Viagem' },
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
          submitLabel={categoryEditingId ? 'Salvar alterações' : 'Salvar categoria'}
        />
        {categoryEditingId ? (
          <button type="button" className="button button--ghost" onClick={handleCancelCategoryEdit}>
            Cancelar edição
          </button>
        ) : null}
      </div>
    ),
    lancamentos: (
      <QuickForm
        title="Novo lançamento"
        description="Controle o fluxo de caixa em uma tela única"
        fields={[
          { name: 'transactionDescription', label: 'Descrição', placeholder: 'Ex: Hospedagem' },
          { name: 'transactionAmount', label: 'Valor', type: 'currency', placeholder: 'R$ 0,00' },
          {
            name: 'transactionType',
            label: 'Tipo',
            type: 'select',
            options: [
              { value: 'receita', label: 'Receita' },
              { value: 'despesa', label: 'Despesa' }
            ]
          },
          {
            name: 'transactionAccountId',
            label: 'Conta',
            type: 'select',
            placeholder: 'Selecione uma conta',
            options: transactionAccountOptions
          },
          {
            name: 'transactionCategoryId',
            label: 'Categoria',
            type: 'select',
            placeholder: 'Selecione uma categoria',
            options: transactionCategoryOptions
          }
        ]}
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmitTransaction}
        submitLabel="Salvar lançamento"
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
            hint="Soma dos saldos das contas"
            tone="balance"
          />
          <MetricCard
            label="Receitas"
            value={Number(dashboard.receita || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
            hint="Valores positivos do período"
            tone="receita"
          />
          <MetricCard
            label="Despesas"
            value={Number(dashboard.despesa || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
            hint="Saídas do período"
            tone="despesa"
          />
          <MetricCard
            label="Lançamentos"
            value={String(dashboard.totalTransactions || 0)}
            hint="Movimentações registradas"
            tone="default"
          />
        </div>

        <div className="two-columns">
          <SectionCard
            title="Lançamentos recentes"
            description="Visão rápida das últimas movimentações"
            action={<span className="section-card__chip">Últimos 5</span>}
          >
            <DataTable columns={columns.transactions} rows={dashboard.recentTransactions || []} />
          </SectionCard>

          <SectionCard
            title="Contas em destaque"
            description="Saldos principais do usuario"
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
          description="Lista das contas ativas no sistema"
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
          description="Classificação de receitas e despesas"
          action={<span className="section-card__chip">Organização</span>}
        >
          <DataTable columns={columns.categories} rows={categories} />
        </SectionCard>
        {forms.categorias}
      </div>
    ),
    lancamentos: (
      <div className="workspace-grid">
        <SectionCard
          title="Movimentações"
          description="Controle do fluxo de caixa"
          action={<span className="section-card__chip">Fluxo completo</span>}
        >
          <DataTable columns={launchTransactionColumns} rows={transactions} />
        </SectionCard>
        {forms.lancamentos}
      </div>
    )
  };

  if (authLoading) {
    return <div className="loading loading--full">Carregando sessão...</div>;
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
          subtitle=""
          user={authUser}
          onEditUser={handleOpenProfile}
          onLogout={sessionMode === 'demo' ? handleReturnToLogin : handleLogout}
          onSessionAction={sessionMode === 'demo' ? handleReturnToLogin : null}
          sessionActionLabel="Voltar ao login"
          modeLabel={
            sessionMode === 'demo'
              ? 'Modo demonstração'
              : authStatus === 'authenticated'
                ? 'Sessão autenticada'
                : 'Acesso encerrado'
          }
        />

        {profileOpen ? (
          <div className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
            <div className="profile-modal__backdrop" onClick={handleCloseProfile} aria-hidden="true" />
            <div className="profile-modal__dialog">
              <div className="profile-modal__header">
                <div>
                  <p className="eyebrow">Perfil do usuário</p>
                  <h2 id="profile-modal-title">Atualizar dados</h2>
                </div>
                <button type="button" className="button button--ghost" onClick={handleCloseProfile}>
                  Fechar
                </button>
              </div>

              <form className="profile-form" onSubmit={handleProfileSubmit}>
                <label>
                  <span>Nome</span>
                  <input name="name" value={profileForm.name} onChange={handleProfileChange} />
                </label>

                <label>
                  <span>E-mail</span>
                  <input name="email" type="email" value={profileForm.email} onChange={handleProfileChange} />
                </label>

                <label>
                  <span>Senha atual</span>
                  <input
                    name="currentPassword"
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={handleProfileChange}
                    placeholder="Digite sua senha atual"
                  />
                </label>

                <label>
                  <span>Nova senha</span>
                  <input
                    name="newPassword"
                    type="password"
                    value={profileForm.newPassword}
                    onChange={handleProfileChange}
                    placeholder="Opcional"
                  />
                </label>

                <p className="auth-hint">
                  Para confirmar a alteração, informe a senha atual. A nova senha é opcional
                </p>

                {profileError ? <div className="auth-banner auth-banner--error">{profileError}</div> : null}

                <div className="profile-modal__actions">
                  <button type="button" className="button button--ghost" onClick={handleCloseProfile}>
                    Cancelar
                  </button>
                  <button type="submit" className="button" disabled={profileSubmitting}>
                    {profileSubmitting ? 'Salvando...' : 'Salvar dados'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {error ? <div className="alert">{error}</div> : null}
        {loading ? <div className="loading">Carregando experiência financeira...</div> : mainContent[activeTab]}
      </main>
    </div>
  );
}

export default App;
