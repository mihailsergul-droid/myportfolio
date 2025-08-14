import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import CreatePost from '../components/post/CreatePost';
import PostCard from '../components/post/PostCard';
import { postsAPI } from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    fetchPosts();
  }, [isAuthenticated]);

  const fetchPosts = async (pageNum = 1) => {
    try {
      const response = await postsAPI.getFeed(pageNum);
      const newPosts = response.data;
      
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 10);
      setPage(pageNum);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      fetchPosts(page + 1);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Social Media Platform</title>
        <meta name="description" content="Connect with friends and share moments" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-2xl mx-auto px-4 py-6">
          {/* Create Post */}
          <div className="mb-6">
            <CreatePost onPostCreated={handlePostCreated} />
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={(postId, liked) => {
                  setPosts(prev =>
                    prev.map(p =>
                      p.id === postId
                        ? {
                            ...p,
                            isLiked: liked,
                            _count: {
                              ...p._count,
                              likes: liked ? p._count.likes + 1 : p._count.likes - 1
                            }
                          }
                        : p
                    )
                  );
                }}
              />
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          )}

          {/* Load More */}
          {!loading && hasMore && posts.length > 0 && (
            <div className="flex justify-center py-8">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
              >
                Load More
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && posts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-500">
                Follow some users or create your first post!
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}