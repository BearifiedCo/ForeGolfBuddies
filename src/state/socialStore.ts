import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Friendship, Post } from '../types/golf';

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
  likePost: (postId: string) => void;
  addComment: (postId: string, comment: any) => void;
  
  setLoading: (loading: boolean) => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set) => ({
      friends: [],
      friendRequests: [],
      posts: [],
      isLoading: false,
      
      addFriend: (friend: User) => {
        set(state => ({
          friends: [...state.friends, friend]
        }));
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
      },
      
      likePost: (postId: string) => {
        set(state => ({
          posts: state.posts.map(post => 
            post.id === postId 
              ? { ...post, likes: post.likes + 1 }
              : post
          )
        }));
      },
      
      addComment: (postId: string, comment: any) => {
        set(state => ({
          posts: state.posts.map(post => 
            post.id === postId 
              ? { ...post, comments: [...post.comments, comment] }
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