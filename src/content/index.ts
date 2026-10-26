import type { Domain, Project } from './types';
import { postTrainingPipeline } from './projects/post-training-pipeline';
import { grapeThinningRobot } from './projects/grape-thinning-robot';
import { vlaLab } from './projects/vla-lab';
import { eyeInHandCalibration } from './projects/eye-in-hand-calibration';
import { clinicalMultimodalAgent } from './projects/clinical-multimodal-agent';
import { lilbot } from './projects/lilbot';

/**
 * Declared order drives both the project index and the home bento grid.
 *
 * The bento tiling assumes the featured footprints appear in the order
 * `anchor, tall, wide, cell, cell, wide` — see `bentoSpan` in src/lib/utils.ts.
 * Reorder freely, but re-check the grid fill on a wide screen afterwards.
 */
export const projects: Project[] = [
  postTrainingPipeline, // anchor
  grapeThinningRobot, // tall
  vlaLab, // wide
  eyeInHandCalibration, // cell
  clinicalMultimodalAgent, // cell
  lilbot, // wide
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
