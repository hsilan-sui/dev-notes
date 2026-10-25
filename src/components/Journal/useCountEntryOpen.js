import {useCallback} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const OPENED_KEY = 'mytide.counter.opened';

// Tells the Signal API that a reader opened this story card, once per tab
// and entry, so the site owner can see which entries get read.
export default function useCountEntryOpen() {
  const {siteConfig} = useDocusaurusContext();
  const apiBase = String(siteConfig.customFields?.signalApiBaseUrl || '').replace(/\/$/, '');

  return useCallback((slug) => {
    if (!apiBase || !slug) return;
    let opened = [];
    try { opened = JSON.parse(window.sessionStorage.getItem(OPENED_KEY) || '[]'); } catch { /* counted again */ }
    if (opened.includes(slug)) return;
    try { window.sessionStorage.setItem(OPENED_KEY, JSON.stringify([...opened, slug])); } catch { /* counted again */ }
    // keepalive: 「繼續閱讀」 may be a link that leaves the page right away.
    fetch(`${apiBase}/api/entry-open`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({slug}),
      keepalive: true,
    }).catch(() => {});
  }, [apiBase]);
}
