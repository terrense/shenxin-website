import { Suspense, lazy } from 'react';
import type { DiagramId } from '@/content/types';
import { ErrorBoundary } from '@/components/primitives/ErrorBoundary';
import { diagramSpecs } from './specs';

/**
 * Diagrams are code-split: the renderer plus all six specs is a meaningful
 * chunk, and a visitor who never scrolls past the hero should not download it.
 *
 * The Suspense fallback reserves the diagram's exact aspect ratio, so the swap
 * from skeleton to content causes no layout shift.
 */
const FlowDiagram = lazy(() => import('./FlowDiagram'));

export function Diagram({ id, caption }: { id: DiagramId; caption?: string }) {
  const spec = diagramSpecs[id];

  const skeleton = (
    <div className="my-2">
      <div
        className="w-full animate-pulse rounded-xl border border-line-2 bg-surface-2/60"
        style={{ aspectRatio: `${spec.width} / ${spec.height}` }}
      />
      <div className="mt-4 h-32 animate-pulse rounded-xl border border-line-2 bg-surface-2/40" />
    </div>
  );

  return (
    <ErrorBoundary label={`Diagram:${id}`} fallback={skeleton}>
      <Suspense fallback={skeleton}>
        <FlowDiagram spec={spec} caption={caption} />
      </Suspense>
    </ErrorBoundary>
  );
}
