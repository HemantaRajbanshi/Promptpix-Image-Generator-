// React Router configuration
export const routerConfig = {
  // Opt-in to v7 behavior for smoother transitions
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    // Suppress warnings in production
    ...(process.env.NODE_ENV === 'production' ? { suppressWarnings: true } : {})
  }
};
