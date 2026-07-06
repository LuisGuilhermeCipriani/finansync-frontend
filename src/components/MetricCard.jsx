import React from 'react';

export default function MetricCard({ label, value, hint, tone = 'default' }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}
