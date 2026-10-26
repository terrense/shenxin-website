import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Keeps a non-essential subtree from taking the page down.
 *
 * Used around the WebGL hero: a driver fault, a lost context or a shader
 * compile failure on an unusual GPU should degrade to the static backdrop, not
 * blank the site.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; label?: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error(`[${this.props.label ?? 'ErrorBoundary'}]`, error, info.componentStack);
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
