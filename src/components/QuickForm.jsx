import React from 'react';

function formatarMoeda(value) {
  const cents = Number(String(value ?? '').replace(/\D/g, '')) || 0;
  return cents.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function QuickForm({ title, description, fields, values, onChange, onSubmit, submitLabel }) {
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
              <select name={field.name} value={values[field.name]} onChange={onChange}>
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
            ) : field.type === 'currency' ? (
              <input
                type="text"
                name={field.name}
                value={formatarMoeda(values[field.name])}
                onChange={(event) => {
                  const nextValue = String(event.target.value).replace(/\D/g, '');
                  onChange({
                    target: {
                      name: field.name,
                      value: nextValue || '0'
                    }
                  });
                }}
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
