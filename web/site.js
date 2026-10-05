const input = document.querySelector('#article-search');
if (input) {
  const cards = [...document.querySelectorAll('[data-search]')];
  const status = document.querySelector('#search-status');
  input.addEventListener('input', () => {
    const term = input.value.trim().toLocaleLowerCase('en-AU'); let count = 0;
    for (const card of cards) { card.hidden = !card.dataset.search.includes(term); if (!card.hidden) count += 1; }
    status.textContent = term ? `${count} ${count === 1 ? 'article' : 'articles'} found` : '';
  });
}

for (const diagram of document.querySelectorAll('[data-architecture]')) {
  const nodes = [...diagram.querySelectorAll('[data-node]')];
  const status = diagram.querySelector('.flow-status');
  const play = diagram.querySelector('[data-play]');
  const scenario = diagram.querySelector('[data-scenario]');
  const steps = [...diagram.querySelectorAll('[data-step-text]')].map(el => el.textContent);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let position = -1, timer = null;
  diagram.querySelector('.diagram-controls').hidden = false;
  function select(index) {
    nodes.forEach((node,i) => node.querySelector('button').setAttribute('aria-pressed', String(i === index)));
    diagram.querySelectorAll('[data-detail]').forEach(el => { el.hidden = Number(el.dataset.detail) !== index; });
  }
  function pause() {
    clearInterval(timer); timer = null; play.textContent = 'Play flow';
    diagram.classList.remove('is-playing');
  }
  function reset() {
    pause(); position = -1;
    nodes.forEach(node => node.classList.remove('is-active','is-done','is-blocked'));
    select(0); status.textContent = 'Ready to explore. Select a node, or play the request flow.';
  }
  function advance() {
    const end = scenario.value === 'blocked' ? Number(diagram.dataset.blockAt) : nodes.length - 1;
    if (position >= end) position = -1;
    position += 1;
    nodes.forEach((node,i) => {
      node.classList.toggle('is-active',i === position);
      node.classList.toggle('is-done',i < position);
      node.classList.toggle('is-blocked',i === position && scenario.value === 'blocked' && position === end);
    });
    select(position);
    const blocked = scenario.value === 'blocked' && position === end;
    status.textContent = blocked ? `Blocked · ${diagram.querySelector('[data-blocked-text]').textContent}` : `Step ${position + 1} of ${end + 1} · ${steps[position]}`;
    if (position === end) { pause(); if (!blocked) status.textContent += ' Flow complete.'; }
  }
  nodes.forEach((node,i) => node.querySelector('button').addEventListener('click', () => select(i)));
  play.addEventListener('click', () => {
    if (timer) { pause(); return; }
    advance();
    const end = scenario.value === 'blocked' ? Number(diagram.dataset.blockAt) : nodes.length - 1;
    if (position < end) {
      play.textContent = 'Pause flow'; diagram.classList.add('is-playing');
      timer = setInterval(advance, reduced.matches ? 2400 : 1800);
    }
  });
  diagram.querySelector('[data-step]').addEventListener('click', () => { pause(); advance(); });
  diagram.querySelector('[data-reset]').addEventListener('click', reset);
  scenario.addEventListener('change', reset);
  diagram.querySelector('[data-security]').addEventListener('click', event => {
    const shown = event.currentTarget.getAttribute('aria-pressed') !== 'true';
    event.currentTarget.setAttribute('aria-pressed', String(shown));
    event.currentTarget.textContent = shown ? 'Hide security boundaries' : 'Show security boundaries';
    diagram.querySelectorAll('.security-boundary').forEach(el => { el.hidden = !shown; });
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
}
