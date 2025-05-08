const DashboardTools = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {/* Text to Image Card */}
      <div className="card-modern flex flex-col space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-display">Text to Image</h3>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Click to start using Text to Image
        </div>
      </div>

      {/* Upscale Card */}
      <div className="card-modern flex flex-col space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <h3 className="text-xl font-display">Upscale</h3>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Click to start using Upscale
        </div>
      </div>

      {/* Uncrop Card */}
      <div className="card-modern flex flex-col space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8v8a4 4 0 004 4h8m-4-16v8m0 0l3-3m-3 3l-3-3" />
            </svg>
            <h3 className="text-xl font-display">Uncrop</h3>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Click to start using Uncrop
        </div>
      </div>

      {/* Remove Background Card */}
      <div className="card-modern flex flex-col space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
            <h3 className="text-xl font-display">Remove Background</h3>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Click to start using Remove Background
        </div>
      </div>

      {/* Image Editor Card */}
      <div className="card-modern flex flex-col space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <h3 className="text-xl font-display">Image Editor</h3>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Click to start using Image Editor
        </div>
      </div>
    </div>
  );
};

export default DashboardTools;
