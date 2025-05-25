import { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Material Design 3 Card component
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Card variant: 'filled', 'elevated', 'outlined'
 * @param {boolean} props.interactive - Whether the card is interactive (has hover/click effects)
 * @param {boolean} props.fullWidth - Whether the card should take full width
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} props.media - Media content to display at the top of the card
 * @param {React.ReactNode} props.header - Header content
 * @param {React.ReactNode} props.footer - Footer content
 */
const Card = forwardRef(({
  variant = 'filled',
  interactive = true,
  fullWidth = false,
  onClick,
  className = '',
  children,
  media,
  header,
  footer,
  ...props
}, ref) => {
  // Determine base class based on variant
  const baseClass = `md3-card-${variant}`;

  // Interactive class
  const interactiveClass = interactive ? 'cursor-pointer' : '';

  // Full width class
  const widthClass = fullWidth ? 'w-full' : '';

  // Combine all classes
  const cardClass = `${baseClass} ${interactiveClass} ${widthClass} ${className}`;

  // Framer Motion animation props
  const motionProps = interactive ? {
    whileHover: { y: -4, boxShadow: variant === 'outlined' ? '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)' : '0px 4px 8px 0px rgba(0, 0, 0, 0.12)' },
    transition: { duration: 0.2 },
    style: { position: 'relative' }
  } : { style: { position: 'relative' } };

  return (
    <motion.div
      className={cardClass}
      onClick={interactive ? onClick : undefined}
      ref={ref}
      {...motionProps}
      {...props}
    >
      {/* Media section */}
      {media && (
        <div className="mb-4 -mx-4 -mt-4 overflow-hidden rounded-t-large">
          {media}
        </div>
      )}

      {/* Header section */}
      {header && (
        <div className="mb-4">
          {header}
        </div>
      )}

      {/* Content */}
      <div>
        {children}
      </div>

      {/* Footer section */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-neutral-20">
          {footer}
        </div>
      )}
    </motion.div>
  );
});

Card.displayName = 'Card';

export default Card;
