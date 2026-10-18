import {Fragment} from 'react';
import {LINK_PATTERN} from './signalRiver.js';
import styles from './SignalText.module.css';

// A signal's words, with any link it carries: links the API checked as safe
// open in a new tab and wear a ✅; the rest stay plain text with a ⚠️.
export default function SignalText({text, links = [], unsafeLabel = '未通過安全檢查，不開放連結'}) {
  const verdict = new Map(links.map(link => [link.url, link.safe]));
  const parts = [];
  let last = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push({url: match[0]});
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.map((part, index) => {
    if (typeof part === 'string') return <Fragment key={index}>{part}</Fragment>;
    const safe = verdict.get(part.url);
    if (safe === true) {
      return (
        <a key={index} className={styles.link} href={part.url} target="_blank" rel="noopener noreferrer nofollow ugc"
          onClick={event => event.stopPropagation()}>
          {part.url}<span className={styles.mark} role="img" aria-label="已通過安全檢查">✅</span>
        </a>
      );
    }
    return (
      <span key={index} className={styles.plain} title={safe === false ? unsafeLabel : undefined}>
        {part.url}{safe === false ? <span className={styles.mark} role="img" aria-label={unsafeLabel}>⚠️</span> : null}
      </span>
    );
  });
}
