import { motion } from 'framer-motion';

const AboutUs = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Team members data
  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'Founder & CEO',
      bio: 'Alex has over 10 years of experience in AI and machine learning, with a focus on computer vision and image processing.',
      image: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Sarah Chen',
      role: 'CTO',
      bio: 'Sarah leads our technical team with her expertise in deep learning models and neural networks for image generation.',
      image: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Lead Developer',
      bio: 'Michael specializes in frontend development and creating intuitive user interfaces for complex AI applications.',
      image: 'https://randomuser.me/api/portraits/men/67.jpg'
    },
    {
      name: 'Priya Patel',
      role: 'AI Research Scientist',
      bio: 'Priya focuses on developing cutting-edge algorithms for image enhancement and transformation.',
      image: 'https://randomuser.me/api/portraits/women/63.jpg'
    }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl"></div>
        <div className="absolute top-1/3 -left-24 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl"></div>
        <div className="absolute -bottom-24 right-1/3 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl"></div>
      </div>
      {/* Hero Section */}
      <motion.div
        className="max-w-7xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl relative">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 animate-gradient-x">PromptPix</span>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-300">
          We're on a mission to make AI image generation and editing accessible to everyone.
        </p>
      </motion.div>

      {/* Our Story */}
      <motion.div
        className="max-w-7xl mx-auto mb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
          variants={itemVariants}
        >
          <div className="px-4 py-5 sm:p-6 md:flex md:items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <motion.div
                className="relative rounded-xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 mix-blend-overlay z-10 rounded-xl"></div>
                <img
                  src="/images/about-story.jpg"
                  alt="Our journey"
                  className="w-full h-auto rounded-xl shadow-md transform transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">EST. 2023</div>
              </motion.div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 relative inline-block">
                Our Story
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-purple-600 rounded-full"></div>
              </h2>
              <div className="prose prose-lg prose-purple dark:prose-invert">
                <p className="text-lg">
                  Founded in 2023, PromptPix began with a simple idea: to make powerful AI image tools accessible to everyone, not just technical experts.
                </p>
                <p className="mt-4 text-lg">
                  Our team of AI researchers and developers came together with a shared vision of democratizing access to cutting-edge image generation and editing technology.
                </p>
                <p className="mt-4 text-lg">
                  Today, we're proud to offer a suite of tools that empower creators, marketers, designers, and everyday users to transform their ideas into stunning visuals with just a few clicks.
                </p>
                <div className="mt-6 flex items-center">
                  <div className="flex -space-x-2 mr-4">
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800" src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800" src="https://randomuser.me/api/portraits/women/44.jpg" alt="" />
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800" src="https://randomuser.me/api/portraits/men/67.jpg" alt="" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Our founding team</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Our Mission */}
      <motion.div
        className="max-w-7xl mx-auto mb-20 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl overflow-hidden shadow-xl border border-purple-100 dark:border-purple-800/20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="px-6 py-12 sm:px-8 sm:py-16 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12 relative inline-block"
            variants={itemVariants}
          >
            <span className="relative z-10">Our Mission</span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
            variants={itemVariants}
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
              <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-5 shadow-md">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We're committed to staying at the forefront of AI image technology, constantly improving our models and algorithms.
              </p>
              <div className="mt-4 w-12 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 shadow-md">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Accessibility</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We believe powerful AI tools should be accessible to everyone, regardless of technical expertise.
              </p>
              <div className="mt-4 w-12 h-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full"></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mb-5 shadow-md">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Responsibility</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We're dedicated to the ethical development and use of AI technology, with a focus on privacy and security.
              </p>
              <div className="mt-4 w-12 h-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Team Section */}
      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="text-center mb-16"
          variants={itemVariants}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 relative inline-block">
            Meet Our Team
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our talented team of experts is passionate about AI and dedicated to creating the best image generation tools.
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={itemVariants}
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700"
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="relative">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-72 object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-purple-300">AI Expert</div>
                    <div className="text-sm">Joined 2023</div>
                  </div>
                </div>
              </div>
              <div className="p-6 relative">
                <div className="absolute top-0 right-0 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">{member.role}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{member.name}</h3>
                <div className="w-10 h-1 bg-purple-600 rounded-full my-3"></div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{member.bio}</p>
                <div className="mt-4 flex space-x-3">
                  <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutUs;
