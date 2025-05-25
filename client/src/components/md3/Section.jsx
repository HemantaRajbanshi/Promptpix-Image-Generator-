import { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Material Design 3 Section component for landing pages
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Section ID for navigation
 * @param {string} props.background - Background style: 'primary', 'secondary', 'tertiary', 'surface', 'container'
 * @param {boolean} props.fullHeight - Whether the section should take full viewport height
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Section content
 */
const Section = forwardRef(({
  id,
  background = 'surface',
  fullHeight = false,
  className = '',
  children,
  ...props
}, ref) => {
  // Background classes based on the background prop
  const backgroundClasses = {
    primary: 'bg-primary-40 text-on-primary',
    'primary-container': 'bg-primary-90 text-on-primary-container',
    secondary: 'bg-secondary-40 text-on-secondary',
    'secondary-container': 'bg-secondary-90 text-on-secondary-container',
    tertiary: 'bg-tertiary-40 text-on-tertiary',
    'tertiary-container': 'bg-tertiary-90 text-on-tertiary-container',
    surface: 'bg-surface text-on-surface',
    'surface-dim': 'bg-surface-dim text-on-surface',
    'surface-bright': 'bg-surface-bright text-on-surface',
    'surface-container': 'bg-surface-container text-on-surface',
    'surface-container-low': 'bg-surface-container-low text-on-surface',
    'surface-container-high': 'bg-surface-container-high text-on-surface',
    'surface-container-highest': 'bg-surface-container-highest text-on-surface',
  };
  
  // Height class
  const heightClass = fullHeight ? 'min-h-screen' : '';
  
  // Combine all classes
  const sectionClass = `py-16 px-4 sm:px-6 lg:px-8 ${backgroundClasses[background] || backgroundClasses.surface} ${heightClass} ${className}`;
  
  // Animation variants for scroll reveal
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
  
  return (
    <section
      id={id}
      className={sectionClass}
      ref={ref}
      {...props}
    >
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {children}
      </motion.div>
    </section>
  );
});

Section.displayName = 'Section';

export default Section;
