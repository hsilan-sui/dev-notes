// A reply briefly overlaps the folding timeline and the mobile editor.
// Restore scrolling only after both have released their lock.
let locks = 0;
let previousOverflow = '';
export default function lockJournalScroll() {
  const root = document.documentElement;
  if (locks === 0) previousOverflow = root.style.overflow;
  locks += 1;
  root.style.overflow = 'hidden';
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) root.style.overflow = previousOverflow;
  };
}
