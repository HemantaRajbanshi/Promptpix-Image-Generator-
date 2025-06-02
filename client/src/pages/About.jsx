import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Import Material Design 3 components
import Card from '../components/md3/Card';
import Section from '../components/md3/Section';

const About = () => {
  // Refs for scroll animations
  const headerRef = useRef(null);

  // Scroll animation for the hero section
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ["start start", "end start"]
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const headerY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.2, 0.0, 0, 1.0]
      }
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.2, 0.0, 0, 1.0]
      }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.2, 0.0, 0, 1.0]
      }
    }
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

  // Team members data
  const teamMembers = [
    {
      name: 'Hemanta Rajbanshi',
      role: 'Founder & CEO',
      bio: 'Hemanta is the visionary behind PromptPix, combining his passion for AI with a mission to make advanced image generation accessible to everyone.',
      image: '/images/about/Hemanta.jpg'  // ✅ Correct relative path for public assets
    },
    {
      name: 'Abhishek',
      role: 'Lead Developer',
      bio: 'Abhishek leads our development team, bringing expertise in frontend and backend technologies to create seamless, intuitive user experiences.',
      image: '/images/about/Abhishek.jpg' // ✅ If it's a real image file (replace base64 if needed)
    }

  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface pt-16 md:pt-20">
      {/* Hero Section */}
      <Section
        id="about-hero"
        background="surface-container-high"
        className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/50 dark:to-indigo-900/50"
        ref={headerRef}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-500/20 dark:bg-purple-400/30 blur-3xl"></div>
          <div className="absolute top-1/3 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 dark:bg-indigo-400/30 blur-3xl"></div>
          <div className="absolute -bottom-24 right-1/3 w-96 h-96 rounded-full bg-blue-500/20 dark:bg-blue-400/30 blur-3xl"></div>
        </div>

        <motion.div
          className="text-center relative z-10"
          style={{ opacity: headerOpacity, y: headerY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0.0, 0, 1.0] }}
          >
            <h1 className="display-large text-gray-900 dark:text-white mb-6 font-bold">
              About <span className="text-purple-600 dark:text-purple-300">PromptPix</span>
            </h1>

            <p className="headline-small text-gray-700 dark:text-gray-100 mb-8 max-w-3xl mx-auto">
              Transforming imagination into stunning visuals with the power of AI, made simple for everyone.
            </p>
          </motion.div>
        </motion.div>
      </Section>

      {/* Our Story Section */}
      <Section id="our-story" background="surface">
        <motion.div
          className="flex flex-col md:flex-row items-center gap-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            className="md:w-1/2"
            variants={fadeInLeft}
          >
            <Card variant="elevated" className="overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-80/20 to-tertiary-80/20 mix-blend-overlay z-10"></div>
                <img
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImMiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2NzUwQTQiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iIzgzNjVGRiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzlDNjlGRiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNTAwIiBmaWxsPSJ1cmwoI2MpIi8+PGNpcmNsZSBjeD0iMjAwIiBjeT0iMTUwIiByPSI0MCIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC4zIi8+PGNpcmNsZSBjeD0iNjAwIiBjeT0iMzAwIiByPSI2MCIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC4yIi8+PHRleHQgeD0iNDAwIiB5PSIyMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzNiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkZGRkYiPk91ciBKb3VybmV5PC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMjcwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuOCI+QnVpbGRpbmcgdGhlIGZ1dHVyZSBvZiBBSSBpbWFnZSBnZW5lcmF0aW9uPC90ZXh0Pjwvc3ZnPg=="
                  alt="Our journey"
                  className="w-full h-auto transform transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute top-0 right-0 bg-primary-40 text-on-primary text-xs font-bold px-3 py-1 rounded-bl-medium">EST. 2023</div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            className="md:w-1/2"
            variants={fadeInRight}
          >
            <h2 className="headline-medium text-on-surface mb-6 relative inline-block">
              Our Story
              <div className="absolute -bottom-1 left-0 w-16 h-1 bg-primary-40 rounded-full"></div>
            </h2>

            <div className="space-y-4">
              <p className="body-large text-gray-600 dark:text-gray-300">
                PromptPix was born in 2023 from a moment of inspiration when Hemanta Rajbanshi, frustrated by the complexity of existing AI image tools, envisioned a platform where creativity wouldn't be limited by technical knowledge.
              </p>

              <p className="body-large text-gray-600 dark:text-gray-300">
                What began as a passion project quickly evolved into a mission: to bridge the gap between cutting-edge AI technology and everyday users who want to bring their creative visions to life.
              </p>

              <p className="body-large text-gray-600 dark:text-gray-300">
                With Abhishek joining as Lead Developer, our small but dedicated team has created an intuitive platform that transforms complex AI processes into simple, accessible tools that anyone can use to create stunning visuals with just a few clicks.
              </p>

              <div className="mt-6 flex items-center">
                <div className="flex -space-x-2 mr-4">
                  <div className="inline-block h-10 w-10 rounded-full ring-2 ring-primary-40 bg-surface-container overflow-hidden">
                    <img src="/images/about/Hemanta.jpg" alt="Hemanta" className="h-full w-full object-cover" />
                  </div>

                  <div className="inline-block h-10 w-10 rounded-full ring-2 ring-primary-40 bg-surface-container overflow-hidden">
                    <img src="/images/about/Abhishek.JPG" alt="Abhishek" className="h-full w-full object-cover" />
                  </div>

                </div>
                <span className="text-sm text-on-surface-variant">Our founding team</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* Our Mission Section */}
      <Section id="our-mission" background="surface-container">
        <motion.div
          className="text-center mb-12"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="headline-large text-gray-900 dark:text-white mb-4 relative inline-block">
            Our Mission
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-purple-600 rounded-full"></div>
          </h2>
          <p className="title-large text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're on a mission to democratize AI image generation and make it accessible to everyone.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Innovation Card */}
          <motion.div variants={fadeIn} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
            <Card variant="filled" className="h-full">
              <div className="mb-6">
                <div className="h-14 w-14 bg-primary-90 rounded-full flex items-center justify-center mb-5 shadow-elevation-1">
                  <svg className="h-7 w-7 text-primary-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="title-large text-on-surface mb-3">Innovation</h3>
                <p className="body-medium text-on-surface-variant">
                  We're committed to pushing the boundaries of what's possible with AI image generation, making tomorrow's technology accessible today.
                </p>
              </div>
              <div className="w-12 h-1 bg-primary-40 rounded-full"></div>
            </Card>
          </motion.div>

          {/* Accessibility Card */}
          <motion.div variants={fadeIn} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
            <Card variant="filled" className="h-full">
              <div className="mb-6">
                <div className="h-14 w-14 bg-secondary-90 rounded-full flex items-center justify-center mb-5 shadow-elevation-1">
                  <svg className="h-7 w-7 text-secondary-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="title-large text-on-surface mb-3">Accessibility</h3>
                <p className="body-medium text-on-surface-variant">
                  We're breaking down barriers between advanced AI technology and everyday users, empowering everyone to create stunning visuals regardless of technical background.
                </p>
              </div>
              <div className="w-12 h-1 bg-secondary-40 rounded-full"></div>
            </Card>
          </motion.div>

          {/* Responsibility Card */}
          <motion.div variants={fadeIn} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
            <Card variant="filled" className="h-full">
              <div className="mb-6">
                <div className="h-14 w-14 bg-tertiary-90 rounded-full flex items-center justify-center mb-5 shadow-elevation-1">
                  <svg className="h-7 w-7 text-tertiary-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="title-large text-on-surface mb-3">Responsibility</h3>
                <p className="body-medium text-on-surface-variant">
                  We're committed to the ethical development of AI, ensuring our tools enhance human creativity rather than replace it, while maintaining the highest standards of privacy and security.
                </p>
              </div>
              <div className="w-12 h-1 bg-tertiary-40 rounded-full"></div>
            </Card>
          </motion.div>
        </motion.div>
      </Section>
    </div>
  );
};

export default About;
