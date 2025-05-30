import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserGalleryItems, removeGalleryItem, updateGalleryItemInteraction, searchGalleryItems } from '../services/local-storage/gallery';
import { downloadImage } from '../utils/download';
import { useAuth } from '../context/AuthContext';
import { UI_CONFIG } from '../constants';

const MasonryGallery = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);

  // Load gallery items when user changes
  useEffect(() => {
    loadGalleryItems();
  }, [user]);

  // Listen for gallery updates
  useEffect(() => {
    const handleGalleryUpdate = () => {
      if (user) {
        loadGalleryItems();
      }
    };

    window.addEventListener('galleryUpdated', handleGalleryUpdate);
    window.addEventListener('storage', handleGalleryUpdate);

    // Return cleanup function to revoke any blob URLs when component unmounts
    return () => {
      window.removeEventListener('galleryUpdated', handleGalleryUpdate);
      window.removeEventListener('storage', handleGalleryUpdate);

      // Clean up any blob URLs that might still be in memory
      if (window._blobUrlsToRevoke && window._blobUrlsToRevoke.length > 0) {
        console.log(`Cleaning up ${window._blobUrlsToRevoke.length} blob URLs on unmount`);
        window._blobUrlsToRevoke.forEach(url => {
          try {
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error('Error revoking blob URL:', error);
          }
        });
        window._blobUrlsToRevoke = [];
      }
    };
  }, [user]);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      if (searchTerm.trim()) {
        const results = searchGalleryItems(galleryItems, searchTerm);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, UI_CONFIG.DEBOUNCE_DELAY);

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, galleryItems]);

  // Load user-specific gallery items from local storage
  const loadGalleryItems = () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.id && !user?._id) {
        setGalleryItems([]);
        setLoading(false);
        return;
      }

      const userId = user.id || user._id;
      const items = getUserGalleryItems(userId);
      setGalleryItems(items);
    } catch (error) {
      console.error('Error loading user gallery items:', error);
      setError('Failed to load your images');
      setGalleryItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle item deletion
  const handleDeleteItem = (itemId) => {
    try {
      removeGalleryItem(itemId);
      setGalleryItems(prevItems => prevItems.filter(item => item.id !== itemId));

      // If the deleted item is currently selected, clear selection
      if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error deleting gallery item:', error);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  // Handle image click to track interactions
  const handleImageClick = (item) => {
    try {
      // Update interaction data for smart sorting
      updateGalleryItemInteraction(item.id);

      // Set selected item to open modal
      setSelectedItem(item);
    } catch (error) {
      console.error('Error tracking image interaction:', error);
      // Still open the modal even if tracking fails
      setSelectedItem(item);
    }
  };

  // Handle image download
  const handleDownload = async (item) => {
    try {
      if (item.imageData) {
        // If we have imageData (base64), convert to blob first for standardized download
        const response = await fetch(item.imageData);
        const blob = await response.blob();
        // Download high-quality PNG
        downloadImage(blob, `promptpix-${item.id}.png`);
      } else if (item.blob) {
        // If we have the blob directly, use it
        downloadImage(item.blob, `promptpix-${item.id}.png`);
      } else if (item.imageUrl) {
        // If we have an imageUrl, fetch it first
        const response = await fetch(item.imageUrl);
        const blob = await response.blob();
        // Download high-quality PNG
        downloadImage(blob, `promptpix-${item.id}.png`);
      } else {
        console.error('No image data available for download');
        alert('Unable to download this image. The image data is not available.');
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  // Calculate smart sort score for an item
  const calculateSmartScore = (item) => {
    try {
      const now = Date.now();
      const createdAt = new Date(item.createdAt).getTime();
      const lastViewed = new Date(item.lastViewed || item.createdAt).getTime();
      const viewCount = item.viewCount || 0;

      // Validate timestamps
      if (isNaN(createdAt) || isNaN(lastViewed)) {
        console.warn('Invalid timestamp found in item:', item.id);
        return Number.MAX_SAFE_INTEGER; // Push invalid items to the end
      }

      // Weighted score calculation (lower score = higher priority)
      // Time since creation (40% weight)
      const timeSinceCreation = (now - createdAt) * 0.4;
      // Time since last viewed (30% weight)
      const timeSinceViewed = (now - lastViewed) * 0.3;
      // View count bonus (30% weight, inverted so more views = lower score)
      const viewCountBonus = (viewCount * 100 * 0.3);

      return timeSinceCreation + timeSinceViewed - viewCountBonus;
    } catch (error) {
      console.error('Error calculating smart score for item:', item.id, error);
      return Number.MAX_SAFE_INTEGER; // Push errored items to the end
    }
  };

  // Filter and sort items
  const filteredAndSortedItems = () => {
    // Start with search results if search is active, otherwise use all gallery items
    let items = searchTerm.trim() ? searchResults : galleryItems;

    // Apply type filter
    if (filter !== 'all') {
      items = items.filter(item => item.type === filter);
    }

    // If search is active, items are already sorted by search score
    if (searchTerm.trim()) {
      return items;
    }

    // Otherwise, apply regular sorting
    return items.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'smart') {
        // Smart sort using weighted recency-frequency algorithm
        const scoreA = calculateSmartScore(a);
        const scoreB = calculateSmartScore(b);
        return scoreA - scoreB; // Lower score = higher priority
      }
      return 0;
    });
  };

  // Get display name for item type
  const getTypeDisplayName = (type) => {
    switch (type) {
      case 'text-to-image': return 'Text to Image';
      case 'upscale': return 'Upscale';
      case 'uncrop': return 'Uncrop';
      case 'remove-bg': return 'Remove Background';
      case 'image-editor': return 'Image Editor';
      default: return 'Unknown';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Generate consistent random height for masonry layout
  const getRandomHeight = (id) => {
    // Use the item ID to generate a consistent height
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Generate heights between 250px and 450px for better visual appeal
    return 250 + (hash % 200);
  };

  const displayedItems = filteredAndSortedItems();

  return (
    <div className="w-full pb-8">
      {/* Filter and Sort Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 mb-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          {/* Search Input */}
          <div className="flex items-center flex-1 min-w-0 max-w-md">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">Search:</span>
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by prompt or type..."
                className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  title="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">Filter:</span>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="text-to-image">Text to Image</option>
                <option value="upscale">Upscale</option>
                <option value="uncrop">Uncrop</option>
                <option value="remove-bg">Remove Background</option>
                <option value="image-editor">Image Editor</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={searchTerm.trim() !== ''}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="smart">Smart Sort: Personalized</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 dark:border-purple-800"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <svg className="h-12 w-12 text-red-400 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Error Loading Gallery</h3>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-md mx-auto">{error}</p>
          <div className="mt-8">
            <button
              onClick={loadGalleryItems}
              className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <svg className="h-12 w-12 text-purple-400 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {searchTerm.trim() ? 'No Images Match Your Search' : 'Your Gallery is Empty'}
          </h3>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            {searchTerm.trim()
              ? `No images found matching "${searchTerm}". Try different keywords or check your spelling.`
              : filter === 'all'
              ? "You haven't created any images yet. Start by generating some amazing visuals!"
              : `You don't have any ${getTypeDisplayName(filter).toLowerCase()} images in your gallery.`}
          </p>
          <div className="mt-8">
            <button
              onClick={() => navigate('/dashboard/text-to-image')}
              className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Image
            </button>
          </div>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1 mb-6 break-inside-avoid"
              onClick={() => handleImageClick(item)}
            >
              <div
                className="relative"
                style={{ height: `${getRandomHeight(item.id)}px` }}
              >
                {item.conversionError || item.saveError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30">
                    <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl shadow-lg backdrop-blur-sm">
                      <svg className="w-10 h-10 text-red-500 mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-1">Error Loading Image</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {item.errorMessage || 'API Error: Image could not be loaded'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={
                        // Try to use the most reliable source first
                        item.imageData ||
                        // For blob URLs, check if they're still valid
                        (item.imageUrl && item.imageUrl.startsWith('blob:') && item.blob ? item.imageUrl : null) ||
                        // For regular URLs, use them directly
                        (item.imageUrl && !item.imageUrl.startsWith('blob:') ? item.imageUrl : null) ||
                        // Fallback to placeholder
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+'
                      }
                      alt={item.prompt || 'Generated image'}
                      className="w-full h-full object-cover absolute inset-0"
                      onError={(e) => {
                        console.error('Image failed to load:', item.id);
                        // Try to recover the image if possible
                        if (item.blob && !item.imageData) {
                          try {
                            // Create a new URL from the blob
                            const newUrl = URL.createObjectURL(item.blob);
                            console.log('Recovering image with new blob URL');

                            // Store the URL for cleanup when the component unmounts
                            if (!window._blobUrlsToRevoke) {
                              window._blobUrlsToRevoke = [];
                            }
                            window._blobUrlsToRevoke.push(newUrl);

                            // Set up cleanup when the image is loaded successfully
                            const img = e.target;
                            const originalOnLoad = img.onload;

                            img.onload = function() {
                              // DON'T revoke the blob URL immediately - let it persist for gallery display
                              // Schedule cleanup after a longer delay to prevent access errors
                              setTimeout(() => {
                                URL.revokeObjectURL(newUrl);

                                // Remove from tracking array
                                if (window._blobUrlsToRevoke) {
                                  const index = window._blobUrlsToRevoke.indexOf(newUrl);
                                  if (index !== -1) {
                                    window._blobUrlsToRevoke.splice(index, 1);
                                  }
                                }
                              }, 15000); // 15 second delay to prevent premature revocation

                              // Call original onload if it exists
                              if (originalOnLoad) {
                                originalOnLoad.call(this);
                              }
                            };

                            e.target.src = newUrl;
                            return;
                          } catch (blobError) {
                            console.error('Failed to recover image from blob:', blobError);
                          }
                        }
                        // Fallback to placeholder
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 backdrop-blur-[2px] hover:backdrop-blur-0">
                      <div className="transform translate-y-2 hover:translate-y-0 transition-transform duration-300">
                        <div className="text-white text-sm font-medium truncate mb-1">{item.prompt || getTypeDisplayName(item.type)}</div>
                        <div className="flex items-center text-white/80 text-xs mb-3">
                          <svg className="w-3 h-3 mr-1 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDate(item.createdAt)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-all duration-200 transform hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(item);
                            }}
                            title="Download image"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          <button
                            className="p-2 bg-white/20 hover:bg-red-400/40 rounded-full transition-all duration-200 transform hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item.id);
                            }}
                            title="Delete image"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <div className="ml-auto">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/30 text-white">
                              {getTypeDisplayName(item.type)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border border-purple-200 dark:border-purple-800/30">
                    {getTypeDisplayName(item.type)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <svg className="w-3 h-3 mr-1 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => {
            // Clean up any blob URLs created specifically for the modal
            if (window._modalBlobUrl) {
              try {
                URL.revokeObjectURL(window._modalBlobUrl);
                window._modalBlobUrl = null;
              } catch (error) {
                console.error('Error revoking modal blob URL:', error);
              }
            }
            setSelectedItem(null);
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
              <div className="flex items-center">
                <div className="bg-purple-100 dark:bg-purple-800/30 p-2 rounded-lg mr-3">
                  <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {getTypeDisplayName(selectedItem.type)}
                </h3>
              </div>
              <button
                onClick={() => {
                  // Clean up any blob URLs created specifically for the modal
                  if (window._modalBlobUrl) {
                    try {
                      URL.revokeObjectURL(window._modalBlobUrl);
                      window._modalBlobUrl = null;
                    } catch (error) {
                      console.error('Error revoking modal blob URL:', error);
                    }
                  }
                  setSelectedItem(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white/80 dark:bg-gray-700/80 p-2 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/3 p-6 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                  <img
                    src={
                      // Try to use the most reliable source first
                      selectedItem.imageData ||
                      // For blob URLs, check if they're still valid
                      (selectedItem.imageUrl && selectedItem.imageUrl.startsWith('blob:') && selectedItem.blob ? selectedItem.imageUrl : null) ||
                      // For regular URLs, use them directly
                      (selectedItem.imageUrl && !selectedItem.imageUrl.startsWith('blob:') ? selectedItem.imageUrl : null) ||
                      // Fallback to placeholder
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+'
                    }
                    alt={selectedItem.prompt || 'Generated image'}
                    className="max-w-full max-h-[60vh] object-contain shadow-xl rounded-lg border border-gray-200 dark:border-gray-700"
                    onError={(e) => {
                      console.error('Modal image failed to load:', selectedItem.id);
                      // Try to recover the image if possible
                      if (selectedItem.blob && !selectedItem.imageData) {
                        try {
                          // Create a new URL from the blob
                          const newUrl = URL.createObjectURL(selectedItem.blob);
                          console.log('Recovering modal image with new blob URL');

                          // Store the URL for cleanup when the modal is closed
                          window._modalBlobUrl = newUrl;

                          // Also store in the general cleanup array as a backup
                          if (!window._blobUrlsToRevoke) {
                            window._blobUrlsToRevoke = [];
                          }
                          window._blobUrlsToRevoke.push(newUrl);

                          // Set up cleanup when the image is loaded successfully
                          const img = e.target;
                          const originalOnLoad = img.onload;

                          img.onload = function() {
                            // DON'T revoke the blob URL immediately - let it persist for modal display
                            // Schedule cleanup after a longer delay to prevent access errors
                            setTimeout(() => {
                              URL.revokeObjectURL(newUrl);

                              // Remove from tracking array
                              if (window._blobUrlsToRevoke) {
                                const index = window._blobUrlsToRevoke.indexOf(newUrl);
                                if (index !== -1) {
                                  window._blobUrlsToRevoke.splice(index, 1);
                                }
                              }
                            }, 15000); // 15 second delay to prevent premature revocation

                            // Call original onload if it exists
                            if (originalOnLoad) {
                              originalOnLoad.call(this);
                            }
                          };

                          e.target.src = newUrl;
                          return;
                        } catch (blobError) {
                          console.error('Failed to recover modal image from blob:', blobError);
                        }
                      }
                      // Fallback to placeholder
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>
                <div className="md:w-1/3 p-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Prompt
                    </h4>
                    <div className="text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-inner">
                      {selectedItem.prompt || 'No prompt available'}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created
                    </h4>
                    <p className="text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">{formatDate(selectedItem.createdAt)}</p>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Type
                    </h4>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                      {getTypeDisplayName(selectedItem.type)}
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-8">
                    <button
                      onClick={() => handleDownload(selectedItem)}
                      className="flex-1 flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Image
                    </button>
                    <button
                      onClick={() => handleDeleteItem(selectedItem.id)}
                      className="flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:border-red-300 dark:hover:border-red-500"
                    >
                      <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasonryGallery;
