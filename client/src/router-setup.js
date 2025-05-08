// This file sets up React Router future flags globally
// It should be imported before any React Router imports

// Set future flags for React Router v7
window.__reactRouterFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};

export default window.__reactRouterFutureFlags;
