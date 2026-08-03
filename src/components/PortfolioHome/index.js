import MoreProjects from './MoreProjects';
import PortfolioHero from './PortfolioHero';
import SelectedProjects from './SelectedProjects';
import styles from './styles.module.css';

export default function PortfolioHome() {
  return (
    <main className={styles.portfolioHome}>
      <PortfolioHero />
      <SelectedProjects />
      <MoreProjects />
    </main>
  );
}
