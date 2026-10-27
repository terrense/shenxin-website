import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { Layout } from '@/components/layout/Layout';
import Home from '@/pages/Home';

/**
 * The home page ships in the main bundle because it is the entry point for
 * essentially all traffic. Secondary routes are split — a visitor who only
 * reads the home page never downloads the case-study renderer.
 */
const Projects = lazy(() => import('@/pages/Projects'));
const ProjectCase = lazy(() => import('@/pages/ProjectCase'));
const Footprints = lazy(() => import('@/pages/Footprints'));
const Palace = lazy(() => import('@/pages/Palace'));
const NotFound = lazy(() => import('@/pages/NotFound'));

/** Minimum-height placeholder, so a route swap cannot collapse the footer upward. */
function RouteFallback() {
  return <div className="min-h-[60svh]" aria-busy="true" />;
}

export default function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="projects"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <Projects />
                </Suspense>
              }
            />
            <Route
              path="projects/:slug"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <ProjectCase />
                </Suspense>
              }
            />
            <Route
              path="footprints"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <Footprints />
                </Suspense>
              }
            />
            <Route
              path="hall"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <Palace />
                </Suspense>
              }
            />
            <Route
              path="*"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <NotFound />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </LocaleProvider>
  );
}
