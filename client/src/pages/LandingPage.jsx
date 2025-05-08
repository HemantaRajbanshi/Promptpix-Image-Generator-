import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';

const LandingPage = () => {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const features = [
    {
      id: 'text-to-image',
      title: 'Text to Image',
      description: 'Generate stunning images from text descriptions using advanced AI models.',
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      id: 'upscale',
      title: 'Upscale',
      description: 'Enhance image resolution and quality without losing details.',
      icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5'
    },
    {
      id: 'uncrop',
      title: 'Uncrop',
      description: 'Expand your images beyond their original boundaries with AI-powered content generation.',
      icon: 'M4 8v8a2 2 0 002 2h12a2 2 0 002-2V8m-4-4v8m-12 0V4a2 2 0 012-2h12a2 2 0 012 2v4'
    },
    {
      id: 'remove-bg',
      title: 'Remove Background',
      description: 'Automatically remove backgrounds from images with precision.',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
    },
    {
      id: 'image-editor',
      title: 'Image Editor',
      description: 'Powerful editing tools to adjust, crop, and enhance your images.',
      icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
    },
    {
      id: 'batch-processing',
      title: 'Batch Processing',
      description: 'Process multiple images at once to save time and effort.',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    }
  ];

  return (
    <div className="bg-black">
      <HeroSection />

      {/* Features Section */}
      <motion.div
        className="py-16 bg-gray-900"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center" variants={itemVariants}>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Powerful AI Image Tools
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Everything you need to create and edit amazing images
            </p>
          </motion.div>

          <motion.div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3" variants={containerVariants}>
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                className="bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 border border-gray-700"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-white">{feature.title}</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-base text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div
        className="py-16 bg-gray-900"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              What Our Users Say
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Join thousands of satisfied users who have transformed their creative workflow
            </p>
          </motion.div>

          <motion.div className="grid gap-8 md:grid-cols-3" variants={containerVariants}>
            {[
              {
                name: "Sarah Johnson",
                role: "Graphic Designer",
                quote: "PromptPix has completely transformed my workflow. The text-to-image feature saves me hours of work every week."
              },
              {
                name: "Michael Chen",
                role: "Marketing Director",
                quote: "The background removal tool is incredibly precise. We've cut our product photo editing time in half!"
              },
              {
                name: "Emma Rodriguez",
                role: "Content Creator",
                quote: "I use the upscaling feature daily for my social media content. The quality improvement is remarkable."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700"
                variants={itemVariants}
              >
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="bg-gradient-to-r from-purple-600 to-indigo-600 py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
            Ready to transform your creative process?
          </h2>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link
              to="/signup"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-purple-700 bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10 shadow-lg"
            >
              Get Started for Free
            </Link>
          </motion.div>
        </div>
      </motion.div>

    </div>
  );
};

export default LandingPage;
