// Resolve a direct case link before the larger module graph initializes.
// Only known case elements can be expanded; the fragment is never parsed as HTML.
const initialCase = document.getElementById(location.hash.slice(1));
if (initialCase?.classList.contains('case')) {
  const group = initialCase.closest('[data-more-work]');
  if (group) group.open = true;
  initialCase.open = true;
}
