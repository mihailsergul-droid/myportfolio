import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDistanceToNow } from 'date-fns';
import { postsAPI } from '../services/api';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const PostCard = ({ post, onLike }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post._count.likes);

  const handleLike = async () => {
    try {
      const response = await postsAPI.likePost(post.id);
      const liked = response.data.liked;
      
      setIsLiked(liked);
      setLikesCount(prev => liked ? prev + 1 : prev - 1);
      onLike?.(post.id, liked);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to like post',
      });
    }
  };

  const renderMedia = () => {
    if (!post.mediaUrls || post.mediaUrls.length === 0) return null;

    const mediaCount = post.mediaUrls.length;
    
    if (mediaCount === 1) {
      return (
        <FastImage
          source={{ uri: post.mediaUrls[0] }}
          style={styles.singleMedia}
          resizeMode={FastImage.resizeMode.cover}
        />
      );
    }

    return (
      <View style={styles.mediaGrid}>
        {post.mediaUrls.slice(0, 4).map((url, index) => (
          <View key={index} style={styles.mediaItem}>
            <FastImage
              source={{ uri: url }}
              style={styles.gridMedia}
              resizeMode={FastImage.resizeMode.cover}
            />
            {index === 3 && mediaCount > 4 && (
              <View style={styles.mediaOverlay}>
                <Text style={styles.mediaOverlayText}>+{mediaCount - 4}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {post.author.avatar ? (
              <FastImage
                source={{ uri: post.author.avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {post.author.displayName[0]}
              </Text>
            )}
          </View>
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{post.author.displayName}</Text>
              {post.author.verified && (
                <Icon name="checkmark-circle" size={16} color="#3B82F6" />
              )}
            </View>
            <Text style={styles.username}>@{post.author.username}</Text>
          </View>
        </View>
        <Text style={styles.timestamp}>
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </Text>
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Media */}
      {renderMedia()}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Icon
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? '#EF4444' : '#6B7280'}
          />
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="chatbubble-outline" size={24} color="#6B7280" />
          <Text style={styles.actionText}>{post._count.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginBottom: 8,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 4,
  },
  username: {
    fontSize: 14,
    color: '#6B7280',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  singleMedia: {
    width: width,
    height: 300,
    marginBottom: 12,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  mediaItem: {
    width: width / 2,
    height: 150,
    position: 'relative',
  },
  gridMedia: {
    width: '100%',
    height: '100%',
  },
  mediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaOverlayText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  likedText: {
    color: '#EF4444',
  },
});

export default PostCard;