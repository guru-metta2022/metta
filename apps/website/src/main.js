import { PRECEPTS } from '@metta/common';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('precepts-container');
  if (!container) return;

  container.innerHTML = PRECEPTS.map(
    (p) => `
    <div class="precept-item">
      <div class="precept-main">
        <div class="precept-category">${p.category} • Precept ${p.id}</div>
        <div class="precept-pali">"${p.pali}"</div>
        <div class="precept-desc">${p.description}</div>
      </div>
      <div class="precept-anchor">
        <a href="${p.suttaCentralUrl}" target="_blank" rel="noopener">
          ${p.suttaAnchor} ↗
        </a>
      </div>
    </div>
  `
  ).join('');
});
