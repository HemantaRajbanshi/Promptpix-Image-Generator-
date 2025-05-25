import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Material Design 3 TextField component
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - TextField variant: 'filled', 'outlined'
 * @param {string} props.label - Input label
 * @param {string} props.helperText - Helper text displayed below the input
 * @param {string} props.errorText - Error text displayed when input has an error
 * @param {boolean} props.error - Whether the input has an error
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {boolean} props.required - Whether the input is required
 * @param {string} props.leadingIcon - Leading icon path
 * @param {string} props.trailingIcon - Trailing icon path
 * @param {Function} props.onTrailingIconClick - Click handler for trailing icon
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onFocus - Focus handler
 * @param {Function} props.onBlur - Blur handler
 */
const TextField = forwardRef(({
  variant = 'filled',
  label,
  helperText,
  errorText,
  error = false,
  disabled = false,
  required = false,
  leadingIcon,
  trailingIcon,
  onTrailingIconClick,
  className = '',
  onChange,
  onFocus,
  onBlur,
  value,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  
  // Handle focus event
  const handleFocus = (e) => {
    setFocused(true);
    if (onFocus) onFocus(e);
  };
  
  // Handle blur event
  const handleBlur = (e) => {
    setFocused(false);
    if (onBlur) onBlur(e);
  };
  
  // Handle change event
  const handleChange = (e) => {
    setHasValue(!!e.target.value);
    if (onChange) onChange(e);
  };
  
  // Determine container classes based on variant, focus, error, and disabled states
  const containerBaseClass = variant === 'filled' 
    ? 'bg-surface-container-highest rounded-t-medium rounded-b-none border-b-2' 
    : 'bg-transparent border-2 rounded-medium';
  
  const containerStateClass = error 
    ? 'border-error-40' 
    : focused 
      ? 'border-primary-40' 
      : variant === 'filled' 
        ? 'border-neutral-40' 
        : 'border-neutral-40';
  
  const containerFocusClass = focused && variant === 'filled' ? 'bg-surface-container-high' : '';
  const containerDisabledClass = disabled ? 'opacity-40 cursor-not-allowed' : '';
  
  // Combine container classes
  const containerClass = `relative transition-all duration-medium ease-standard ${containerBaseClass} ${containerStateClass} ${containerFocusClass} ${containerDisabledClass} ${className}`;
  
  // Determine label classes based on focus, value, and error states
  const labelBaseClass = 'absolute transition-all duration-medium ease-standard pointer-events-none';
  const labelPositionClass = (focused || hasValue) 
    ? 'text-xs top-2' 
    : 'text-base top-1/2 -translate-y-1/2';
  
  const labelColorClass = error 
    ? 'text-error-40' 
    : focused 
      ? 'text-primary-40' 
      : 'text-neutral-50';
  
  // Combine label classes
  const labelClass = `${labelBaseClass} ${labelPositionClass} ${labelColorClass}`;
  
  // Determine input classes
  const inputBaseClass = 'w-full bg-transparent outline-none';
  const inputPaddingClass = leadingIcon ? 'pl-10' : 'pl-4';
  const inputRightPaddingClass = trailingIcon ? 'pr-10' : 'pr-4';
  
  // Combine input classes
  const inputClass = `${inputBaseClass} ${inputPaddingClass} ${inputRightPaddingClass}`;
  
  // Helper/error text classes
  const helperTextClass = `text-xs mt-1 ${error ? 'text-error-40' : 'text-neutral-50'}`;
  
  return (
    <div className="mb-4">
      <div className={containerClass}>
        {/* Leading Icon */}
        {leadingIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={leadingIcon} />
            </svg>
          </div>
        )}
        
        {/* Input Element */}
        <input
          className={inputClass}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          ref={ref}
          value={value}
          {...props}
          style={{ 
            paddingTop: (focused || hasValue) ? '1.5rem' : '1rem',
            paddingBottom: (focused || hasValue) ? '0.5rem' : '1rem'
          }}
        />
        
        {/* Floating Label */}
        {label && (
          <label className={labelClass} style={{ left: leadingIcon ? '2.5rem' : '1rem' }}>
            {label}{required && <span className="text-error-40 ml-1">*</span>}
          </label>
        )}
        
        {/* Trailing Icon */}
        {trailingIcon && (
          <div 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-50 cursor-pointer"
            onClick={onTrailingIconClick}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trailingIcon} />
            </svg>
          </div>
        )}
      </div>
      
      {/* Helper Text or Error Text */}
      {(helperText || (error && errorText)) && (
        <div className={helperTextClass}>
          {error ? errorText : helperText}
        </div>
      )}
    </div>
  );
});

TextField.displayName = 'TextField';

export default TextField;
