import React from 'react';

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
