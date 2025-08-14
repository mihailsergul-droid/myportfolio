import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  HeartIcon, 
  ChatBubbleOvalLeftIcon, 
  ShareIcon,
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { postsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const PostCard = ({ post, onLike, onComment }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      const response = await postsAPI.likePost(post.id);
      setIsLiked(response.data.liked);
      setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
      onLike?.(post.id, response.data.liked);
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Post by ${post.author.displayName}`,
        text: post.content,
        url: `${window.location.origin}/post/${post.id}`
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link 
          href={`/profile/${post.author.username}`}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          {post.author.avatar ? (
            <Image
              src={post.author.avatar}
              alt={post.author.displayName}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {post.author.displayName[0]}
              </span>
            </div>
          )}
          <div>
            <div className="flex items-center space-x-1">
              <h3 className="font-semibold text-gray-900">
                {post.author.displayName}
              </h3>
              {post.author.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">@{post.author.username}</p>
          </div>
        </Link>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="relative">
          {post.mediaType === 'video' ? (
            <video
              src={post.mediaUrls[0]}
              controls
              className="w-full max-h-96 object-cover"
            />
          ) : (
            <div className={`grid gap-1 ${
              post.mediaUrls.length === 1 ? 'grid-cols-1' :
              post.mediaUrls.length === 2 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {post.mediaUrls.slice(0, 4).map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={url}
                    alt="Post media"
                    fill
                    className="object-cover"
                  />
                  {index === 3 && post.mediaUrls.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white text-xl font-semibold">
                        +{post.mediaUrls.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              {isLiked ? (
                <HeartSolidIcon className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <ChatBubbleOvalLeftIcon className="w-6 h-6" />
              <span className="text-sm font-medium">{post._count.comments}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
            >
              <ShareIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 p-4">
          <div className="text-sm text-gray-500 mb-2">Comments coming soon...</div>
        </div>
      )}
    </div>
  );
};

export default PostCard;