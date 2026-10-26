import type { Domain, Project } from './types';
import { postTrainingPipeline } from './projects/post-training-pipeline';
import { grapeThinningRobot } from './projects/grape-thinning-robot';
import { vlaLab } from './projects/vla-lab';
import { eyeInHandCalibration } from './projects/eye-in-hand-calibration';
import { clinicalMultimodalAgent } from './projects/clinical-multimodal-agent';
import { lilbot } from './projects/lilbot';
import { gnssInsNavigation } from './projects/gnss-ins-navigation';
import { visualSlam } from './projects/visual-slam';
import { humanRobotCollaboration } from './projects/human-robot-collaboration';
import { diffusionPolicyOptimization } from './projects/diffusion-policy-optimization';

/**
 * Declared order drives both the project index and the home bento grid.
 *
 * Only `featured` projects reach the bento grid, and their footprints must
 * appear in the order `anchor, tall, wide, cell, cell, wide, wide` for the
 * six-column grid to tile without holes — see `bentoSpan` in src/lib/utils.ts.
 * Reorder freely, but re-check the fill on a wide screen afterwards.
 *
 * Ordering principle: the work that is most defensible leads. The doctoral
 * navigation research and the field robot carry measured, published results;
 * the exploratory pieces sit at the end and are not featured.
 */
export const projects: Project[] = [
  postTrainingPipeline, // featured · anchor
  grapeThinningRobot, // featured · tall
  gnssInsNavigation, // featured · wide
  eyeInHandCalibration, // featured · cell
  clinicalMultimodalAgent, // featured · cell
  lilbot, // featured · wide
  vlaLab, // featured · wide
  visualSlam, // featured · cell
  humanRobotCollaboration,
  diffusionPolicyOptimization,
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Previous/next for case-study footer navigation, wrapping at both ends. */
export function getProjectNeighbours(slug: string): { prev: Project; next: Project } | null {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1 || projects.length < 2) return null;
  return {
    prev: projects[(index - 1 + projects.length) % projects.length]!,
    next: projects[(index + 1) % projects.length]!,
  };
}

export function projectsByDomain(domain: Domain | 'all'): Project[] {
  if (domain === 'all') return projects;
  return projects.filter((p) => p.domain === domain || p.alsoIn?.includes(domain));
}

/** Domains that actually have projects, in a stable display order. */
export const activeDomains: Domain[] = (
  ['agentic', 'rl', 'robotics', 'embodied', 'healthcare', 'infra'] as Domain[]
).filter((d) => projectsByDomain(d).length > 0);

export { publications } from './publications';
export { articles } from './writing';
