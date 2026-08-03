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
            eyebrow="Side Projects"
            title="專案展示區"
            description="喜歡從實際使用情境出發，把原本分散、重複或操作繁瑣的流程，整理成容易使用與維護的服務。"
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
