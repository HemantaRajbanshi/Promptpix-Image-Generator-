import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const ContactUs = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Form reference for direct submission
  const form = useRef();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create email content
      const emailContent = `
        Name: ${formData.name}
        Email: ${formData.email}
        Subject: ${formData.subject}

        Message:
        ${formData.message}
      `;

      // Create mailto URL with all form data
      const mailtoUrl = `mailto:peacemusic80@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailContent)}`;

      // Open the user's email client with the pre-filled email
      window.open(mailtoUrl, '_blank');

      // Show success message
      setFormStatus({
        submitted: true,
        success: true,
        message: 'Thank you for your message! Your default email client has been opened with your message. Please send the email to complete the process.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setFormStatus({
        submitted: true,
        success: false,
        message: 'There was an error sending your message. Please try again or contact us directly at peacemusic80@gmail.com.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8 min-h-screen relative">
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
          Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 animate-gradient-x">Us</span>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-300">
          Have questions or feedback? We'd love to hear from you.
        </p>
      </motion.div>

      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div variants={itemVariants}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:shadow-2xl">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 relative">Get in Touch</h2>
                <p className="text-purple-100 relative z-10 max-w-md">
                  We're here to help and answer any questions you might have. We look forward to hearing from you.
                </p>
              </div>
              <div className="px-6 py-8">
                <div className="space-y-8">
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-3 rounded-lg group-hover:from-purple-500/20 group-hover:to-indigo-500/20 transition-all duration-300">
                      <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4 text-gray-700 dark:text-gray-300">
                      <p className="text-sm font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">Email</p>
                      <p className="mt-1 text-lg"><a href="mailto:peacemusic80@gmail.com" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">peacemusic80@gmail.com</a></p>
                    </div>
                  </div>
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 p-3 rounded-lg group-hover:from-indigo-500/20 group-hover:to-blue-500/20 transition-all duration-300">
                      <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-4 text-gray-700 dark:text-gray-300">
                      <p className="text-sm font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Phone</p>
                      <p className="mt-1 text-lg"><a href="tel:+9779816927699" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">+977 9816927699</a></p>
                    </div>
                  </div>
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 bg-gradient-to-br from-blue-500/10 to-teal-500/10 p-3 rounded-lg group-hover:from-blue-500/20 group-hover:to-teal-500/20 transition-all duration-300">
                      <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4 text-gray-700 dark:text-gray-300">
                      <p className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Address</p>
                      <p className="mt-1 text-lg">Mechi Multiple Campus<br />H36P+WV3, Bhadrapur 57200<br />Nepal</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 relative inline-block">
                    Connect With Us
                    <div className="absolute -bottom-1 left-0 w-12 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
                  </h3>
                  <div className="flex space-x-5">
                    <a href="#" className="group">
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-indigo-500">
                        <svg className="h-6 w-6 text-gray-600 dark:text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </div>
                      <span className="sr-only">Twitter</span>
                    </a>
                    <a href="#" className="group">
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-blue-500">
                        <svg className="h-6 w-6 text-gray-600 dark:text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="sr-only">GitHub</span>
                    </a>
                    <a href="#" className="group">
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-teal-500">
                        <svg className="h-6 w-6 text-gray-600 dark:text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </div>
                      <span className="sr-only">LinkedIn</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 relative inline-block">
                Send Us a Message
                <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
              </h2>

              {formStatus.submitted && (
                <motion.div
                  className={`mb-6 p-4 rounded-md ${formStatus.success ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {formStatus.message}
                </motion.div>
              )}

              <form ref={form} onSubmit={handleSubmit} className="mt-8">
                <div className="grid grid-cols-1 gap-y-6">
                  <div className="relative">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="py-3 pl-10 pr-4 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="py-3 pl-10 pr-4 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="py-3 pl-10 pr-4 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        placeholder="What is your message about?"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <textarea
                        name="message"
                        id="message"
                        rows={6}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        className="py-3 pl-10 pr-4 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        placeholder="Please describe how we can help you..."
                      />
                    </div>
                  </div>
                  <div>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-lg text-base font-medium rounded-full text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-300"
                      whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Message
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Map Section */}
      <motion.div
        className="max-w-7xl mx-auto mt-20 mb-10"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:shadow-2xl">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-purple-600 to-indigo-600 h-2 z-10"></div>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.0394346351!2d88.087163!3d26.561046!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e5ba6b84a4f8b3%3A0x2c9a4b3b0c237e0!2sMechi%20Multiple%20Campus%2C%20H36P%2BWV3%2C%20Mechi%20Multiple%20Campus%2C%20Bhadrapur%2057200!5e0!3m2!1sen!2snp!4v1695900000000!5m2!1sen!2snp"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Mechi Multiple Campus Location"
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-10 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-md mr-3">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Mechi Multiple Campus</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">H36P+WV3, Bhadrapur 57200, Nepal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactUs;
