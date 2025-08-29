import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useAccommodationLikes } from '@/hooks/useAccommodationLikes';
import { useToast } from '@/contexts/ToastContext';

const AccommodationLikeButton = ({ 
  accommodation, 
  size = 'md', 
  showText = false, 
  className = '',
  variant = 'default' // 'default', 'minimal', 'fab'
}) => {
  const { toggleAccommodationLike, isAccommodationLiked, isAuthenticated } = useAccommodationLikes();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(isAccommodationLiked(accommodation.id));

  // Sync with global state
  useEffect(() => {
    setIsLiked(isAccommodationLiked(accommodation.id));
  }, [isAccommodationLiked(accommodation.id)]);

  const handleToggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast.error('Please sign in to save accommodations to your favorites');
      return;
    }

    setIsLoading(true);

    try {
      const result = await toggleAccommodationLike(accommodation);
      
      if (result.success) {
        setIsLiked(result.isLiked);
        
        // Show specific notification based on the action performed
        if (result.action === 'liked') {
          toast.success(`✨ "${accommodation.name}" added to your favorites! 🏨`);
        } else if (result.action === 'unliked') {
          toast.success(`💔 "${accommodation.name}" removed from favorites`);
        } else {
          // Fallback based on final state
          if (result.isLiked) {
            toast.success(`✨ "${accommodation.name}" added to your favorites! 🏨`);
          } else {
            toast.success(`💔 "${accommodation.name}" removed from favorites`);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling accommodation like:', error);
      toast.error(error.message || 'Failed to update accommodation favorites');
    } finally {
      setIsLoading(false);
    }
  };

  // Size configurations
  const sizes = {
    sm: {
      icon: 16,
      padding: 'p-2',
      text: 'text-xs'
    },
    md: {
      icon: 20,
      padding: 'p-2.5',
      text: 'text-sm'
    },
    lg: {
      icon: 24,
      padding: 'p-3',
      text: 'text-base'
    }
  };

  const sizeConfig = sizes[size] || sizes.md;

  // Variant styles
  const variants = {
    default: `
      ${sizeConfig.padding}
      bg-white 
      border-2 
      ${isLiked ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'} 
      rounded-full 
      transition-all 
      duration-300 
      hover:scale-110 
      active:scale-95
      shadow-sm 
      hover:shadow-md
    `,
    minimal: `
      ${sizeConfig.padding}
      transition-all 
      duration-300 
      hover:scale-110 
      active:scale-95
      rounded-full
      hover:bg-gray-100
    `,
    fab: `
      ${sizeConfig.padding}
      bg-white 
      border-2 
      ${isLiked ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'} 
      rounded-full 
      transition-all 
      duration-300 
      hover:scale-110 
      active:scale-95
      shadow-lg 
      hover:shadow-xl
      fixed
      bottom-6
      right-6
      z-50
    `
  };

  const variantClass = variants[variant] || variants.default;

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={`
        group
        flex
        items-center
        justify-center
        space-x-2
        ${variantClass}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={
        !isAuthenticated() 
          ? 'Sign in to save accommodations' 
          : isLiked 
            ? 'Remove from favorites' 
            : 'Add to favorites'
      }
      aria-label={
        isLiked 
          ? `Remove ${accommodation.name} from favorites` 
          : `Add ${accommodation.name} to favorites`
      }
    >
      {isLoading ? (
        <Loader2 
          size={sizeConfig.icon} 
          className="animate-spin text-gray-400" 
        />
      ) : (
        <Heart
          size={sizeConfig.icon}
          className={`
            transition-all 
            duration-300 
            ${isLiked 
              ? 'text-red-500 fill-red-500 animate-pulse' 
              : 'text-gray-400 group-hover:text-red-400'
            }
            ${!isAuthenticated() ? 'text-gray-300' : ''}
          `}
        />
      )}
      
      {showText && (
        <span 
          className={`
            font-medium 
            transition-colors 
            duration-300
            ${sizeConfig.text}
            ${isLiked 
              ? 'text-red-600' 
              : 'text-gray-600 group-hover:text-red-500'
            }
            ${!isAuthenticated() ? 'text-gray-400' : ''}
          `}
        >
          {isLiked ? 'Liked' : 'Like'}
        </span>
      )}
    </button>
  );
};

export default AccommodationLikeButton;