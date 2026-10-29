export const pageRoutes = {
  home: { en: 'index.html', tr: 'tr.html' },
  work: { en: 'work.html', tr: 'work-tr.html' },
  lab: { en: 'lab.html', tr: 'lab-tr.html' },
  credentials: { en: 'credentials.html', tr: 'credentials-tr.html' }
};

export function pageHref(page, language, fragment = '') {
  return pageRoutes[page][language] + fragment;
}

// Keep local navigation on the current language without touching external URLs.
export function localizeHref(href, language) {
  const match = /^([^?#]+)(.*)$/.exec(href);
  if (!match) return href;
  const route = Object.values(pageRoutes).find(item => Object.values(item).includes(match[1]));
  return route ? route[language] + match[2] : href;
}
