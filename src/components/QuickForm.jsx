import React from 'react';

function formatarMoeda(value) {
  if (value === '' || value === null || value === undefined) {
    return '';
  }

  const amount = Number(String(value ?? '').replace(/\D/g, '')) || 0;
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function QuickForm({ title, description, fields, values, onChange, onSubmit, submitLabel }) {
  const [focusedCurrencyField, setFocusedCurrencyField] = React.useState('');
  const [focusedSelectField, setFocusedSelectField] = React.useState('');
  const [openEmptySelectField, setOpenEmptySelectField] = React.useState('');

  return (
    <form className="quick-form" onSubmit={onSubmit}>
      <div className="quick-form__intro">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="quick-form__grid">
        {fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            {field.type === 'select' ? (
              field.name === 'transactionAccountId' && (field.options || []).length === 0 ? (
                <div className="quick-form__select-shell">
                  <button
                    type="button"
                    className="quick-form__select-faux"
                    onClick={() =>
                      setOpenEmptySelectField((current) => (current === field.name ? '' : field.name))
                    }
                  >
                    <span>{field.placeholder || 'Selecione uma conta'}</span>
                  </button>
                  {openEmptySelectField === field.name ? (
                    <div className="quick-form__select-empty" role="status" aria-live="polite">
                      Não há contas registradas
                    </div>
                  ) : null}
                </div>
              ) : (
                <select
                  name={field.name}
                  value={values[field.name]}
                  onChange={onChange}
                  onFocus={() => setFocusedSelectField(field.name)}
                  onBlur={() => setFocusedSelectField((current) => (current === field.name ? '' : current))}
                >
                  {field.placeholder ? (
                    <option value="" disabled>
                      {field.placeholder}
                    </option>
                  ) : null}
                  {(field.options || []).map((option) => {
                    const optionValue = typeof option === 'string' ? option : option.value;
                    const optionLabel = typeof option === 'string' ? option : option.label;

                    return (
                      <option key={optionValue} value={optionValue}>
                        {optionLabel}
                      </option>
                    );
                  })}
                </select>
              )
            ) : field.type === 'currency' ? (
              <input
                type="text"
                name={field.name}
                value={focusedCurrencyField === field.name ? String(values[field.name] ?? '') : formatarMoeda(values[field.name])}
                onChange={(event) => {
                  const nextValue = String(event.target.value).replace(/\D/g, '');
                  onChange({
                    target: {
                      name: field.name,
                      value: nextValue
                    }
                  });
                }}
                onFocus={() => {
                  setFocusedCurrencyField(field.name);

                  if (String(values[field.name] ?? '') === '0') {
                    onChange({
                      target: {
                        name: field.name,
                        value: ''
                      }
                    });
                  }
                }}
                onBlur={() => setFocusedCurrencyField('')}
                inputMode="numeric"
                placeholder={field.placeholder || 'R$ 0,00'}
              />
            ) : (
              <input
                type={field.type || 'text'}
                name={field.name}
                value={values[field.name]}
                onChange={onChange}
                placeholder={field.placeholder}
                min={field.min}
                step={field.step}
                list={field.list}
              />
            )}
          </label>
        ))}
      </div>
      <button type="submit" className="button quick-form__submit">
        {submitLabel}
      </button>
    </form>
  );
}
