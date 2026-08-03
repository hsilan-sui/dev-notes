import {projects} from '../data/projects';
import ProjectCard from '../ProjectCard';
import SectionHeading from '../SectionHeading';
import sharedStyles from '../styles.module.css';
import styles from './styles.module.css';

export default function SelectedProjects() {
  const selectedProjects = projects.filter((project) => project.tier === 'selected');
  const [featureProject, ...compactProjects] = selectedProjects;

  return (
    <section className={styles.section}>
      <div className={sharedStyles.container}>
        <div className={styles.stack}>
          <SectionHeading
            id="selected-projects"
            eyebrow="Selected Projects"
            title="Selected Projects"
            description="把真實問題、系統設計與可驗證的作品入口放在同一個脈絡裡。"
          />
          {featureProject ? (
            <ProjectCard project={featureProject} variant="feature" />
          ) : null}
          <div className={styles.compactGrid}>
            {compactProjects.map((project) => (
              <ProjectCard key={project.id} project={project} variant="compact" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
