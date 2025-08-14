import { useState, useRef } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  XMarkIcon,
  FaceSmileIcon 
} from '@heroicons/react/24/outline';
import { postsAPI } from '../../utils/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const textareaRef = useRef(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('video') ? 'video' : 'image'
      }));
      setFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }
  });

  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && files.length === 0) {
      toast.error('Please add some content or media');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      
      files.forEach(({ file }) => {
        formData.append('media', file);
      });

      const response = await postsAPI.createPost(formData);
      
      setContent('');
      setFiles([]);
      onPostCreated?.(response.data);
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        {/* User Info */}
        <div className="flex items-start space-x-3 mb-4">
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.displayName}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {user?.displayName?.[0]}
              </span>
            </div>
          )}

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                adjustTextareaHeight();
              }}
              placeholder="What's happening?"
              className="w-full resize-none border-none outline-none text-lg placeholder-gray-500 min-h-[60px]"
              rows={1}
            />
          </div>
        </div>

        {/* Media Preview */}
        {files.length > 0 && (
          <div className="mb-4">
            <div className={`grid gap-2 ${
              files.length === 1 ? 'grid-cols-1' :
              files.length === 2 ? 'grid-cols-2' :
              'grid-cols-3'
            }`}>
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  {file.type === 'video' ? (
                    <video
                      src={file.preview}
                      className="w-full h-32 object-cover rounded-lg"
                      controls
                    />
                  ) : (
                    <Image
                      src={file.preview}
                      alt="Preview"
                      width={200}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Upload Area */}
        {files.length < 5 && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors mb-4 ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <PhotoIcon className="w-6 h-6" />
              <VideoCameraIcon className="w-6 h-6" />
              <span>
                {isDragActive
                  ? 'Drop files here...'
                  : 'Drag & drop media or click to select'
                }
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              <FaceSmileIcon className="w-5 h-5" />
              <span className="text-sm">Emoji</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!content.trim() && files.length === 0)}
            className="px-6 py-2 bg-primary-500 text-white rounded-full font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;