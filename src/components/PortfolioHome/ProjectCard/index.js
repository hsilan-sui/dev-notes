import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Icon from '../Icon';
import ProjectMedia from '../ProjectMedia';
import TechTags from '../TechTags';
import styles from './styles.module.css';

function LinkIcon({link}) {
  if (link.label === 'GitHub') {
    return <Icon name="github" className={styles.linkIcon} />;
  }

  if (link.href) {
    return <Icon name="external-link" className={styles.linkIcon} />;
  }

  return <Icon name="arrow-right" className={styles.linkIcon} />;
}

function ProjectLink({link}) {
  if (link.disabled) {
    return (
      <span
        className={clsx(styles.projectLink, styles.linkDisabled)}
        title="尚未提供，補齊素材後再串接"
        aria-disabled="true"
      >
        <LinkIcon link={link} />
        {link.label}
      </span>
    );
  }

  if (link.href) {
    return (
      <Link
        className={styles.projectLink}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <LinkIcon link={link} />
        {link.label}
      </Link>
    );
  }

  return (
    <Link className={styles.projectLink} to={link.to}>
      <LinkIcon link={link} />
      {link.label}
    </Link>
  );
}

export default function ProjectCard({project, variant}) {
  return (
    <article className={clsx(styles.card, styles[variant], project.tier === 'more' && styles.moreCard)}>
      <ProjectMedia media={project.media} projectId={project.id} />
      <div className={styles.content}>
        <h3 className={styles.name}>{project.name}</h3>
        {project.problem ? <p className={styles.problem}>{project.problem}</p> : null}
        <p className={styles.solution}>{project.solution}</p>
        <TechTags tags={project.tags} />
        <div className={styles.links} aria-label={`${project.name} 連結`}>
          {project.links.map((link) => (
            <ProjectLink key={link.label} link={link} />
          ))}
        </div>
      </div>
    </article>
  );
}
