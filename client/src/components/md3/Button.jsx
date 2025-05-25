import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Material Design 3 Button component
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant: 'filled', 'tonal', 'outlined', 'text', 'elevated'
 * @param {string} props.size - Button size: 'small', 'medium', 'large'
 * @param {boolean} props.fullWidth - Whether the button should take full width
 * @param {string} props.to - React Router link destination (if button should be a link)
 * @param {string} props.href - HTML anchor href (if button should be an anchor)
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {boolean} props.loading - Whether the button is in loading state
 * @param {string} props.icon - Icon to display in the button
 * @param {string} props.iconPosition - Position of the icon: 'start', 'end'
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 */
const Button = forwardRef(({
  variant = 'filled',
  size = 'medium',
  fullWidth = false,
  to,
  href,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'start',
  onClick,
  className = '',
  children,
  ...props
}, ref) => {
  // Determine base class based on variant
  const baseClass = `md3-button-${variant} md3-ripple`;
  
  // Size classes
  const sizeClasses = {
    small: 'text-sm py-1.5 px-4',
    medium: 'text-base py-2.5 px-6',
    large: 'text-lg py-3 px-8',
  };
  
  // Full width class
  const widthClass = fullWidth ? 'w-full justify-center' : '';
  
  // Icon classes
  const iconClass = icon ? 'inline-flex items-center' : '';
  const iconSpacing = icon && children ? (iconPosition === 'start' ? 'mr-2' : 'ml-2') : '';
  
  // Combine all classes
  const buttonClass = `${baseClass} ${sizeClasses[size]} ${widthClass} ${iconClass} ${className}`;
  
  // Framer Motion animation props
  const motionProps = {
    whileHover: { scale: disabled ? 1 : 1.02 },
    whileTap: { scale: disabled ? 1 : 0.98 },
    transition: { duration: 0.2 }
  };
  
  // Loading indicator
  const loadingIndicator = loading ? (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ) : null;
  
  // Render icon
  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <span className={iconSpacing}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </span>
    );
  };
  
  // Render content based on icon position
  const renderContent = () => (
    <>
      {loadingIndicator}
      {iconPosition === 'start' && renderIcon()}
      {children}
      {iconPosition === 'end' && renderIcon()}
    </>
  );
  
  // If it's a link (internal)
  if (to && !disabled) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link
          to={to}
          className={buttonClass}
          ref={ref}
          {...props}
        >
          {renderContent()}
        </Link>
      </motion.div>
    );
  }
  
  // If it's a link (external)
  if (href && !disabled) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <a
          href={href}
          className={buttonClass}
          ref={ref}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {renderContent()}
        </a>
      </motion.div>
    );
  }
  
  // Regular button
  return (
    <motion.button
      {...motionProps}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      ref={ref}
      {...props}
    >
      {renderContent()}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
