import clsx from 'clsx';
import Icon from './Icon.jsx';
import styles from './NavButton.module.css';

const iconByDirection = {
  prev: 'chevron-left',
  next: 'chevron-right',
  up: 'chevron-up',
  down: 'chevron-down',
};

const labelByDirection = {
  prev: '前一天',
  next: '下一天',
  up: '同一天的上一篇',
  down: '同一天的下一篇',
};

export default function NavButton({direction, size, disabled = false, onClick, describedBy}) {
  return (
    <button
      type="button"
      className={clsx(styles.button, styles[size])}
      aria-label={labelByDirection[direction]}
      aria-describedby={describedBy}
      aria-disabled={disabled ? 'true' : undefined}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      <span className={styles.circle}>
        <Icon name={iconByDirection[direction]} className={styles.icon} />
      </span>
    </button>
  );
}
