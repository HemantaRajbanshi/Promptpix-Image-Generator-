import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Import Material Design 3 components
import Button from '../components/md3/Button';
import TextField from '../components/md3/TextField';
import Card from '../components/md3/Card';
import Section from '../components/md3/Section';

const Contact = () => {
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

  // Refs for animations
  const headerRef = useRef(null);
  const formRef = useRef();

  // Scroll animations
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ["start start", "end start"]
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const headerY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

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

  return (
    <div className="min-h-screen bg-surface text-on-surface pt-16 md:pt-20">
      {/* Hero Section */}
      <Section
        id="contact-hero"
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
              Let's <span className="text-purple-600 dark:text-purple-300">Talk</span>
            </h1>

            <p className="headline-small text-gray-700 dark:text-gray-100 mb-8 max-w-3xl mx-auto">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </motion.div>
        </motion.div>
      </Section>

      {/* Contact Form and Info Section */}
      <Section id="contact-form" background="surface">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Contact Information */}
          <motion.div variants={fadeInLeft}>
            <Card
              variant="elevated"
              className="h-full"
              header={
                <div className="bg-purple-100 dark:bg-purple-900/50 p-6 rounded-t-large">
                  <h2 className="headline-medium text-purple-900 dark:text-purple-100 mb-4">Get in Touch</h2>
                  <p className="body-large text-purple-800 dark:text-purple-200">
                    We're here to help and answer any questions you might have. We look forward to hearing from you.
                  </p>
                </div>
              }
            >
              <div className="space-y-8 p-4">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="title-small text-purple-600 dark:text-purple-400">Email</p>
                    <p className="body-large mt-1">
                      <a href="mailto:peacemusic80@gmail.com" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        peacemusic80@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="title-small text-blue-600 dark:text-blue-400">Phone</p>
                    <p className="body-large mt-1">
                      <a href="tel:+9779816927699" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        +977 9816927699
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="title-small text-green-600 dark:text-green-400">Address</p>
                    <p className="body-large mt-1 text-gray-700 dark:text-gray-300">
                      Mechi Multiple Campus<br />
                      H36P+WV3, Bhadrapur 57200<br />
                      Nepal
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-20">
                  <h3 className="title-medium text-on-surface mb-4">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="w-10 h-10 bg-primary-90 rounded-full flex items-center justify-center text-primary-40 hover:bg-primary-80 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a href="#" className="w-10 h-10 bg-secondary-90 rounded-full flex items-center justify-center text-secondary-40 hover:bg-secondary-80 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="#" className="w-10 h-10 bg-tertiary-90 rounded-full flex items-center justify-center text-tertiary-40 hover:bg-tertiary-80 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={fadeInRight}>
            <Card
              variant="filled"
              className="h-full"
              header={
                <div className="p-6">
                  <h2 className="headline-medium text-gray-900 dark:text-white mb-4">Send Us a Message</h2>
                  <p className="body-large text-gray-600 dark:text-gray-300">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>
              }
            >
              {formStatus.submitted && (
                <motion.div
                  className={`mx-6 mb-6 p-4 rounded-medium ${formStatus.success ? 'bg-primary-90 text-on-primary-container' : 'bg-error-90 text-on-error-container'}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {formStatus.message}
                </motion.div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="p-6 pt-0">
                <div className="space-y-6">
                  <TextField
                    variant="filled"
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    leadingIcon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />

                  <TextField
                    variant="filled"
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    leadingIcon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />

                  <TextField
                    variant="filled"
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    leadingIcon="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />

                  <div className="relative">
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">
                      Message
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 text-neutral-50">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <textarea
                        name="message"
                        rows={6}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-highest rounded-medium border-b-2 border-neutral-40 focus:border-primary-40 outline-none transition-colors duration-medium ease-standard text-on-surface"
                        placeholder="Please describe how we can help you..."
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="filled"
                      type="submit"
                      disabled={isSubmitting}
                      fullWidth
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      </Section>

      {/* Map Section */}
      <Section id="map" background="surface-container-low">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Card variant="elevated" className="overflow-hidden">
            <div className="relative">
              <div className="absolute top-0 left-0 w-full bg-primary-40 h-2 z-10"></div>
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.0394346351!2d88.087163!3d26.561046!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e5ba6b84a4f8b3%3A0x2c9a4b3b0c237e0!2sMechi%20Multiple%20Campus%2C%20H36P%2BWV3%2C%20Mechi%20Multiple%20Campus%2C%20Bhadrapur%2057200!5e0!3m2!1sen!2snp!4v1695900000000!5m2!1sen!2snp"
                  style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Mechi Multiple Campus Location"
                ></iframe>
              </div>
              <div className="absolute bottom-4 left-4 bg-surface p-3 rounded-medium shadow-elevation-2 z-10">
                <div className="flex items-center">
                  <div className="bg-primary-40 p-2 rounded-full mr-3">
                    <svg className="h-5 w-5 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="title-small text-on-surface">Mechi Multiple Campus</p>
                    <p className="body-small text-on-surface-variant">H36P+WV3, Bhadrapur 57200, Nepal</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </Section>
    </div>
  );
};

export default Contact;
