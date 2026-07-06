import React from 'react';

export default function SectionCard({ title, description, children, action }) {
  return (
    <section className="section-card">
      <div className="section-card__header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
