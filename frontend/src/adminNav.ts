/** Admin SPA navigation — reset scroll so edit pages open at the top. */
export function adminNavigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.querySelector('.dashboard-content')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}
