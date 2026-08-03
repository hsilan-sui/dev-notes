import {projects} from '../data/projects';
import ProjectCard from '../ProjectCard';
import SectionHeading from '../SectionHeading';
import sharedStyles from '../styles.module.css';
import styles from './styles.module.css';

export default function MoreProjects() {
  const moreProjects = projects.filter((project) => project.tier === 'more');

  return (
    <section className={styles.section}>
      <div className={sharedStyles.container}>
        <div className={styles.stack}>
          <SectionHeading
            eyebrow="More Projects"
            title="More Projects"
            description="2024 結訓專案-AIoT 物聯網暨人工智慧工程師實戰班"
          />
          <div className={styles.projectList}>
            {moreProjects.map((project) => (
              <ProjectCard key={project.id} project={project} variant="compact" />
            ))}
          </div>
          <p className={styles.moreNote}>更多作品陸續整理中</p>
        </div>
      </div>
    </section>
  );
}
