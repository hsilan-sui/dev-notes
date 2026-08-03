import styles from './styles.module.css';

export default function TechTags({tags}) {
  return (
    <ul className={styles.tags} aria-label="技術標籤">
      {tags.map((tag) => (
        <li className={styles.tag} key={tag}>
          {tag}
        </li>
      ))}
    </ul>
  );
}
