/**
 * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked.
 *
 * This is useful for implementing behavior that should only happen after a repeated action has completed.
 * For example, when typing in a form field, we might want to wait until the user has stopped typing
 * before sending an API request to update the data.
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 *
 * @example
 * // Create a debounced version of updateUser that only runs 500ms after the last call
 * const debouncedUpdateUser = debounce(updateUser, 500);
 *
 * // Call the debounced function whenever the input changes
 * <input onChange={(e) => debouncedUpdateUser(e.target.value)} />
 */
export const debounce = (func, wait) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
