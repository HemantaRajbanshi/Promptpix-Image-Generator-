import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PortraitPromptAssistant = ({ onPromptGenerated }) => {
  // Categories for prompt building
  const categories = {
    subject: [
      { label: 'Elegant woman', value: 'elegant woman with soft flowing hair' },
      { label: 'Stylish man', value: 'stylish man with defined features' },
      { label: 'Cyberpunk character', value: 'cyberpunk character with neon accents' },
      { label: 'Fantasy warrior', value: 'fantasy warrior with intricate armor' },
      { label: 'Business professional', value: 'professional business person in formal attire' },
      { label: 'Artistic model', value: 'artistic model with unique features' },
      { label: 'Vintage portrait', value: 'vintage-style portrait subject' },
      { label: 'Futuristic being', value: 'futuristic being with otherworldly features' },
    ],
    camera: [
      { label: '85mm f/1.4', value: 'shot on 85mm telephoto lens with f/1.4 aperture, shallow depth of field' },
      { label: '50mm f/1.8', value: 'shot on 50mm lens with f/1.8 aperture, natural perspective' },
      { label: '135mm f/2', value: 'shot on 135mm telephoto lens with f/2 aperture, compressed perspective' },
      { label: '35mm f/2', value: 'shot on 35mm lens with f/2 aperture, wider field of view' },
      { label: 'Portrait lens', value: 'shot with professional portrait lens, beautiful bokeh' },
      { label: 'Cinematic', value: 'cinematic camera setup, anamorphic lens, film look' },
    ],
    lighting: [
      { label: 'Golden hour', value: 'golden hour lighting, warm sunset glow' },
      { label: 'Studio softbox', value: 'professional studio lighting with softbox, even illumination' },
      { label: 'Rim light', value: 'dramatic rim lighting, highlighting contours' },
      { label: 'Natural window', value: 'soft natural window lighting' },
      { label: 'Dramatic', value: 'dramatic lighting with strong shadows' },
      { label: 'Butterfly', value: 'butterfly lighting setup, flattering for portraits' },
      { label: 'Rembrandt', value: 'Rembrandt lighting with triangle light pattern' },
    ],
    style: [
      { label: 'Fashion editorial', value: 'high-end fashion editorial style, magazine quality' },
      { label: 'Cinematic', value: 'cinematic style, movie still quality' },
      { label: 'Fine art', value: 'fine art portrait, gallery quality' },
      { label: 'Minimalist', value: 'minimalist style, clean background' },
      { label: 'Vogue cover', value: 'Vogue magazine cover style' },
      { label: 'Fantasy', value: 'fantasy themed, ethereal quality' },
      { label: 'Vintage film', value: 'vintage film look, analog aesthetic' },
    ],
    details: [
      { label: 'Sharp eyes', value: 'sharp detailed eyes, high resolution' },
      { label: 'Skin texture', value: 'ultra-realistic skin texture, pores visible' },
      { label: 'Hair detail', value: 'detailed hair strands, natural flow' },
      { label: 'DSLR quality', value: 'DSLR quality, high resolution' },
      { label: 'Soft bokeh', value: 'soft bokeh background, subject isolation' },
      { label: 'Depth of field', value: 'beautiful depth of field, professional photography' },
    ],
  };

  // State for selected options
  const [selections, setSelections] = useState({
    subject: '',
    camera: 'shot on 85mm telephoto lens with f/1.4 aperture, shallow depth of field',
    lighting: '',
    style: '',
    details: '',
  });

  // State for the final prompt
  const [finalPrompt, setFinalPrompt] = useState('');

  // Update the final prompt when selections change
  useEffect(() => {
    const promptParts = [
      selections.subject,
      selections.camera,
      selections.lighting,
      selections.style,
      selections.details,
    ].filter(Boolean);

    setFinalPrompt(promptParts.join(', '));
  }, [selections]);

  // Handle selection change
  const handleSelectionChange = (category, value) => {
    setSelections(prev => ({
      ...prev,
      [category]: value
    }));
  };

  // Handle generate button click
  const handleGenerateClick = () => {
    if (onPromptGenerated) {
      onPromptGenerated({
        prompt: finalPrompt
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Portrait Prompt Assistant</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Build a professional portrait prompt with telephoto lens aesthetic and beautiful depth of field.
      </p>

      {/* Categories */}
      <div className="space-y-6">
        {Object.entries(categories).map(([category, options]) => (
          <div key={category} className="mb-4">
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2 capitalize">
              {category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <motion.button
                  key={option.label}
                  onClick={() => handleSelectionChange(
                    category,
                    selections[category] === option.value ? '' : option.value
                  )}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selections[category] === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  } transition-colors`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Generated Prompt</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm">
          {finalPrompt || 'Select options above to generate a prompt'}
        </p>
      </div>

      {/* Generate Button */}
      <div className="mt-6 flex justify-end">
        <motion.button
          onClick={handleGenerateClick}
          disabled={!finalPrompt}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Use This Prompt
        </motion.button>
      </div>
    </div>
  );
};

export default PortraitPromptAssistant;
