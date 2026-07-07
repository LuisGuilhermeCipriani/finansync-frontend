import React from 'react';

export default function Sidebar({ activeTab, onChangeTab }) {
  const items = [
    { id: 'dashboard', label: 'Painel' },
    { id: 'contas', label: 'Contas' },
    { id: 'categorias', label: 'Categorias' },
    { id: 'lancamentos', label: 'Lancamentos' }
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__mark">F</div>
        <div>
          <strong>Finansync</strong>
          <span>Gestão Financeira</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar__item ${activeTab === item.id ? 'is-active' : ''}`}
            onClick={() => onChangeTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <p>Versão desktop web, pronta para evoluir para Electron.</p>
      </div>
    </aside>
  );
}
