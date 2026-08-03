import styles from './styles.module.css';

export default function SectionHeading({eyebrow, title, description, id}) {
  return (
    <div className={styles.heading} id={id}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
    </div>
  );
}
