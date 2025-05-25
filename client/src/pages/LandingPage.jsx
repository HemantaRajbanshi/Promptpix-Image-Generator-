import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Import Material Design 3 components
import Button from '../components/md3/Button';
import Card from '../components/md3/Card';
import Section from '../components/md3/Section';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.0, 0, 1.0] } }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.2, 0.0, 0, 1.0] } }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.2, 0.0, 0, 1.0] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
      ease: [0.2, 0.0, 0, 1.0]
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.05, 0.7, 0.1, 1.0]
    }
  }
};

const LandingPage = () => {
  // Refs for scroll animations
  const heroRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  // Scroll animation for the hero section
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  // Scroll indicator animation
  useEffect(() => {
    const handleScroll = () => {
      if (scrollIndicatorRef.current) {
        if (window.scrollY > 100) {
          scrollIndicatorRef.current.style.opacity = '0';
        } else {
          scrollIndicatorRef.current.style.opacity = '1';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Testimonial data
  const testimonials = [
    {
      quote: "PromptPix has completely transformed how I create visuals for my projects. The quality is incredible!",
      author: "Sarah J.",
      role: "Graphic Designer",
      avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzY3NTBBNCIvPjx0ZXh0IHg9IjUwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjM2IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRkZGRiI+UzwvdGV4dD48L3N2Zz4="
    },
    {
      quote: "I've tried many AI image tools, but PromptPix stands out with its intuitive interface and amazing results.",
      author: "Michael T.",
      role: "Content Creator",
      avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzYyNUI3MSIvPjx0ZXh0IHg9IjUwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjM2IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRkZGRiI+TTwvdGV4dD48L3N2Zz4="
    },
    {
      quote: "As someone with no design skills, PromptPix has been a game-changer for my marketing materials.",
      author: "Elena R.",
      role: "Small Business Owner",
      avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzdENTI2MCIvPjx0ZXh0IHg9IjUwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjM2IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRkZGRiI+RTwvdGV4dD48L3N2Zz4="
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Section 1: Hero Section */}
      <Section
        id="hero"
        background="surface-container-low"
        fullHeight={true}
        className="relative flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900"
        ref={heroRef}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-blue-500/20 dark:from-indigo-600/40 dark:via-purple-600/30 dark:to-blue-600/40 z-0"></div>

        {/* Hero content */}
        <motion.div
          className="relative z-10 text-center max-w-5xl px-4 sm:px-6 lg:px-8"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0.0, 0, 1.0] }}
          >
            <h1 className="display-large text-gray-900 dark:text-white mb-6 font-bold">
              Transform Your <span className="text-purple-600 dark:text-purple-400">Imagination</span> Into Stunning Visuals
            </h1>

            <p className="headline-small text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Create beautiful, professional-quality images in seconds with our AI-powered platform
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="filled"
                size="large"
                to="/register"
                className="md3-motion-container-transform"
              >
                Get Started Free
              </Button>

              <Button
                variant="outlined"
                size="large"
                to="/dashboard/text-to-image"
                className="md3-motion-container-transform"
              >
                Try Demo
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          ref={scrollIndicatorRef}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <span className="text-gray-600 dark:text-gray-400 text-sm mb-2">Scroll to explore</span>
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </Section>

      {/* Section 2: Features Section */}
      <Section id="features" background="surface">
        <motion.div
          className="text-center mb-16"
          variants={fadeIn}
        >
          <h2 className="headline-large text-gray-900 dark:text-white mb-4">
            Powerful AI Tools at Your Fingertips
          </h2>
          <p className="title-large text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our suite of AI-powered tools makes it easy to create, edit, and enhance images with just a few clicks.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
        >
          {/* Feature 1 */}
          <motion.div variants={scaleIn}>
            <Card
              variant="elevated"
              header={
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 bg-primary-90 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-primary-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="title-large text-on-surface">Text to Image</h3>
                </div>
              }
            >
              <p className="body-medium text-on-surface-variant">
                Turn your text descriptions into beautiful images using our advanced AI models. Perfect for creating concept art, illustrations, and more.
              </p>
            </Card>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={scaleIn}>
            <Card
              variant="elevated"
              header={
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 bg-secondary-90 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-secondary-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="title-large text-on-surface">Image Enhancement</h3>
                </div>
              }
            >
              <p className="body-medium text-on-surface-variant">
                Upscale, remove backgrounds, and enhance your images with one-click solutions. Transform ordinary photos into extraordinary visuals.
              </p>
            </Card>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={scaleIn}>
            <Card
              variant="elevated"
              header={
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 bg-tertiary-90 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-tertiary-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="title-large text-on-surface">Secure & Private</h3>
                </div>
              }
            >
              <p className="body-medium text-on-surface-variant">
                Your images and prompts are kept private and secure with our advanced encryption. We prioritize your data privacy and security.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </Section>

      {/* Section 3: Testimonials Section */}
      <Section id="testimonials" background="surface-container">
        <motion.div
          className="text-center mb-16"
          variants={fadeIn}
        >
          <h2 className="headline-large text-on-surface mb-4">
            What Our Users Say
          </h2>
          <p className="title-large text-on-surface-variant max-w-3xl mx-auto">
            Join thousands of satisfied creators who are already using PromptPix.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <Card
                variant="filled"
                className="h-full flex flex-col"
              >
                <div className="flex-grow">
                  <p className="body-large italic text-on-surface-variant mb-6">
                    "{testimonial.quote}"
                  </p>
                </div>

                <div className="flex items-center mt-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-40 mr-4">
                    <img
                      src={testimonial.avatar || `https://ui-avatars.com/api/?name=${testimonial.author}&background=random`}
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="title-medium text-on-surface">{testimonial.author}</p>
                    <p className="body-small text-on-surface-variant">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Section 4: CTA Section */}
      <Section id="cta" background="primary-container" className="bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.div
            className="md:w-1/2"
            variants={fadeInLeft}
          >
            <h2 className="headline-medium text-white mb-4">
              Ready to Transform Your Creative Process?
            </h2>
            <p className="body-large text-white/90 mb-8">
              Join thousands of creators, designers, and marketers who are already using PromptPix to bring their ideas to life. Get started today with our free tier.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="filled"
                size="large"
                to="/register"
              >
                Get Started Free
              </Button>

              <Button
                variant="outlined"
                size="large"
                to="/dashboard/text-to-image"
              >
                Try Demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="md:w-1/2 flex justify-center"
            variants={fadeInRight}
          >
            <div className="relative w-full max-w-md">
              <div className="absolute -top-4 -left-4 w-full h-full bg-tertiary-90 rounded-large"></div>
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-secondary-90 rounded-large"></div>
              <div className="relative bg-surface rounded-large shadow-elevation-3 p-6">
                <img
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2NzUwQTQiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iIzgzNjVGRiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzlDNjlGRiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNTAwIiBmaWxsPSJ1cmwoI2QpIiByeD0iMjAiLz48cmVjdCB4PSI1MCIgeT0iNTAiIHdpZHRoPSI3MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjEiIHJ4PSIxMCIvPjxyZWN0IHg9IjEwMCIgeT0iMTAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC4yIiByeD0iNSIvPjxyZWN0IHg9IjM1MCIgeT0iMTAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC4xNSIgcng9IjUiLz48dGV4dCB4PSI0MDAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRkZGRiI+UHJvbXB0UGl4PC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMzMwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuOCI+QUkgSW1hZ2UgR2VuZXJhdGlvbiBQbGF0Zm9ybTwvdGV4dD48L3N2Zz4="
                  alt="PromptPix App Preview"
                  className="w-full h-auto rounded-medium shadow-elevation-1"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll to top button */}
        <div className="flex justify-center mt-16">
          <Button
            variant="filled"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="rounded-full !p-3"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </Button>
        </div>
      </Section>
    </div>
  );
};

export default LandingPage;
