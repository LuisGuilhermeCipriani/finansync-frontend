import React from 'react';

export default function QuickForm({ title, description, fields, values, onChange, onSubmit, submitLabel }) {
  return (
    <form className="quick-form" onSubmit={onSubmit}>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      <div className="quick-form__grid">
        {fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
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
          </label>
        ))}
      </div>
      <button type="submit" className="button button--primary">{submitLabel}</button>
    </form>
  );
}
