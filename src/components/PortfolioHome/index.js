import EngineeringCapabilities from './EngineeringCapabilities';
import FinalCallToAction from './FinalCallToAction';
import MoreProjects from './MoreProjects';
import PortfolioHero from './PortfolioHero';
import SelectedProjects from './SelectedProjects';
import TechnicalNotes from './TechnicalNotes';
import styles from './styles.module.css';

export default function PortfolioHome() {
  return (
    <main className={styles.portfolioHome}>
      <PortfolioHero />
      <SelectedProjects />
      <MoreProjects />
      <EngineeringCapabilities />
      <TechnicalNotes />
      <FinalCallToAction />
    </main>
  );
}
