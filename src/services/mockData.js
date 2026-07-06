export const mockDashboard = {
  accounts: 2,
  categories: 4,
  income: 15400,
  expense: 9275,
  balance: 6125,
  totalTransactions: 12,
  recentTransactions: [
    {
      id: 12,
      description: 'Pagamento cliente',
      amount: 4200,
      type: 'income',
      status: 'posted',
      transactionDate: new Date().toISOString(),
      accountId: 1,
      categoryId: 1
    }
  ]
};

export const mockAccounts = [
  { id: 1, name: 'Conta Principal', type: 'corrente', institution: 'Banco Exemplo', currentBalance: 8250.5, active: true },
  { id: 2, name: 'Reserva', type: 'poupanca', institution: 'Banco Exemplo', currentBalance: 12000, active: true }
];

export const mockCategories = [
  { id: 1, name: 'Receitas', type: 'income', color: '#16a34a', active: true },
  { id: 2, name: 'Despesas Fixas', type: 'expense', color: '#dc2626', active: true },
  { id: 3, name: 'Operacional', type: 'expense', color: '#f59e0b', active: true },
  { id: 4, name: 'Investimentos', type: 'expense', color: '#2563eb', active: true }
];

export const mockTransactions = [
  {
    id: 1,
    description: 'Mensalidade cliente A',
    amount: 4200,
    type: 'income',
    status: 'posted',
    transactionDate: new Date().toISOString(),
    accountId: 1,
    categoryId: 1
  },
  {
    id: 2,
    description: 'Internet corporativa',
    amount: 180,
    type: 'expense',
    status: 'posted',
    transactionDate: new Date().toISOString(),
    accountId: 1,
    categoryId: 2
  }
];
