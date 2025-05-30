const LoadingSpinner = ({ size = "h-5 w-5", color = "text-white" }) => {
  return (
    <div className={`animate-spin ${size} border-2 border-current border-t-transparent rounded-full ${color} opacity-75`}></div>
  );
};

export default LoadingSpinner;
