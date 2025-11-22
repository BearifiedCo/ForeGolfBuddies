import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Friendship, Post, Comment, Reply } from '../types/golf';
import { mockPosts } from '../data/mockData';
import { trackPostCreated, trackLikeReceived, trackCommentMade, trackFriendAdded } from '../services/rewardsService';

interface SocialState {
  friends: User[];
  friendRequests: Friendship[];
  posts: Post[];
  isLoading: boolean;
  
  // Friends actions
  addFriend: (friend: User) => void;
  removeFriend: (friendId: string) => void;
  addFriendRequest: (request: Friendship) => void;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  
  // Posts actions
  addPost: (post: Post) => void;
  likePost: (postId: string, userId: string) => void;
  deletePost: (postId: string) => void;
  
  // Comments actions
  addComment: (postId: string, comment: Comment) => void;
  likeComment: (postId: string, commentId: string, userId: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  
  // Replies actions
  addReply: (postId: string, commentId: string, reply: Reply) => void;
  likeReply: (postId: string, commentId: string, replyId: string, userId: string) => void;
  deleteReply: (postId: string, commentId: string, replyId: string) => void;
  
  setLoading: (loading: boolean) => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set) => ({
      friends: [],
      friendRequests: [],
      posts: mockPosts,
      isLoading: false,
      
      addFriend: (friend: User) => {
        set(state => ({
          friends: [...state.friends, friend]
        }));
        // Track reward for adding friends
        trackFriendAdded();
      },
      
      removeFriend: (friendId: string) => {
        set(state => ({
          friends: state.friends.filter(f => f.id !== friendId)
        }));
      },
      
      addFriendRequest: (request: Friendship) => {
        set(state => ({
          friendRequests: [...state.friendRequests, request]
        }));
      },
      
      acceptFriendRequest: (requestId: string) => {
        set(state => ({
          friendRequests: state.friendRequests.filter(r => r.id !== requestId)
        }));
      },
      
      declineFriendRequest: (requestId: string) => {
        set(state => ({
          friendRequests: state.friendRequests.filter(r => r.id !== requestId)
        }));
      },
      
      addPost: (post: Post) => {
        set(state => ({
          posts: [post, ...state.posts]
        }));
        // Track reward for post creation
        trackPostCreated(post);
      },
      
      likePost: (postId: string, userId: string) => {
        set(state => ({
          posts: state.posts.map(post => 
            post.id === postId 
              ? {
                  ...post,
                  likes: (post.likedBy || []).includes(userId) 
                    ? post.likes - 1 
                    : post.likes + 1,
                  likedBy: (post.likedBy || []).includes(userId)
                    ? (post.likedBy || []).filter(id => id !== userId)
                    : [...(post.likedBy || []), userId],
                  updatedAt: new Date()
                }
              : post
          )
        }));
        // Track reward for receiving likes (only if not already liked)
        const post = get().posts.find(p => p.id === postId);
        if (post && !(post.likedBy || []).includes(userId)) {
          trackLikeReceived();
        }
      },

      deletePost: (postId: string) => {
        set(state => ({
          posts: state.posts.filter(post => post.id !== postId)
        }));
      },
      
      addComment: (postId: string, comment: Comment) => {
        set(state => ({
          posts: state.posts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  comments: [...(post.comments || []), comment],
                  updatedAt: new Date()
                }
              : post
          )
        }));
        // Track reward for making comments
        trackCommentMade();
      },

      likeComment: (postId: string, commentId: string, userId: string) => {
        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  comments: (post.comments || []).map(comment =>
                    comment.id === commentId
                      ? {
                          ...comment,
                          likes: (comment.likedBy || []).includes(userId)
                            ? comment.likes - 1
                            : comment.likes + 1,
                          likedBy: (comment.likedBy || []).includes(userId)
                            ? (comment.likedBy || []).filter(id => id !== userId)
                            : [...(comment.likedBy || []), userId],
                          updatedAt: new Date()
                        }
                      : comment
                  ),
                  updatedAt: new Date()
                }
              : post
          )
        }));
      },

      deleteComment: (postId: string, commentId: string) => {
        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  comments: (post.comments || []).filter(comment => comment.id !== commentId),
                  updatedAt: new Date()
                }
              : post
          )
        }));
      },

      addReply: (postId: string, commentId: string, reply: Reply) => {
        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  comments: post.comments.map(comment =>
                    comment.id === commentId
                      ? {
                          ...comment,
                          replies: [...comment.replies, reply],
                          updatedAt: new Date()
                        }
                      : comment
                  ),
                  updatedAt: new Date()
                }
              : post
          )
        }));
      },

      likeReply: (postId: string, commentId: string, replyId: string, userId: string) => {
        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  comments: post.comments.map(comment =>
                    comment.id === commentId
                      ? {
                          ...comment,
                          replies: comment.replies.map(reply =>
                            reply.id === replyId
                              ? {
                                  ...reply,
                                  likes: reply.likedBy.includes(userId)
                                    ? reply.likes - 1
                                    : reply.likes + 1,
                                  likedBy: reply.likedBy.includes(userId)
                                    ? reply.likedBy.filter(id => id !== userId)
                                    : [...reply.likedBy, userId]
                                }
                              : reply
                          )
                        }
                      : comment
                  ),
                  updatedAt: new Date()
                }
              : post
          )
        }));
      },

      deleteReply: (postId: string, commentId: string, replyId: string) => {
        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  comments: post.comments.map(comment =>
                    comment.id === commentId
                      ? {
                          ...comment,
                          replies: comment.replies.filter(reply => reply.id !== replyId)
                        }
                      : comment
                  ),
                  updatedAt: new Date()
                }
              : post
          )
        }));
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'social-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);