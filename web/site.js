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
