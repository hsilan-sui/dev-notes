const icons = {
  'arrow-right': (
    <path d="M5 12h14M13 6l6 6-6 6" />
  ),
  'arrow-left': (
    <path d="M19 12H5m6 6-6-6 6-6" />
  ),
  'chevron-down': (
    <path d="m6 9 6 6 6-6" />
  ),
  'chevron-left': (
    <path d="m15 18-6-6 6-6" />
  ),
  'chevron-right': (
    <path d="m9 18 6-6-6-6" />
  ),
  'chevron-up': (
    <path d="m18 15-6-6-6 6" />
  ),
};

export default function Icon({name, className, title}) {
  return (
    <svg
      aria-hidden={title ? undefined : 'true'}
      className={className}
      fill="none"
      focusable="false"
      role={title ? 'img' : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {title ? <title>{title}</title> : null}
      {icons[name] || icons['arrow-right']}
    </svg>
  );
}
