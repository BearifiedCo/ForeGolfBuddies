import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, GolfCourse } from '../types/golf';

interface BookingState {
  bookings: Booking[];
  myBookings: Booking[];
  courses: GolfCourse[];
  isLoading: boolean;
  
  // Booking actions
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  cancelBooking: (bookingId: string) => void;
  joinBooking: (bookingId: string, userId: string) => void;
  leaveBooking: (bookingId: string, userId: string) => void;
  
  // Course actions
  setCourses: (courses: GolfCourse[]) => void;
  
  setLoading: (loading: boolean) => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      bookings: [],
      myBookings: [],
      courses: [],
      isLoading: false,
      
      addBooking: (booking: Booking) => {
        set(state => ({
          bookings: [booking, ...state.bookings],
          myBookings: [booking, ...state.myBookings]
        }));
      },
      
      updateBooking: (bookingId: string, updates: Partial<Booking>) => {
        set(state => ({
          bookings: state.bookings.map(b => 
            b.id === bookingId ? { ...b, ...updates } : b
          ),
          myBookings: state.myBookings.map(b => 
            b.id === bookingId ? { ...b, ...updates } : b
          )
        }));
      },
      
      cancelBooking: (bookingId: string) => {
        set(state => ({
          bookings: state.bookings.map(b => 
            b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
          ),
          myBookings: state.myBookings.map(b => 
            b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
          )
        }));
      },
      
      joinBooking: (bookingId: string, _userId: string) => {
        set(state => ({
          bookings: state.bookings.map(b => 
            b.id === bookingId && b.currentPlayers < b.maxPlayers
              ? { ...b, currentPlayers: b.currentPlayers + 1 }
              : b
          )
        }));
      },
      
      leaveBooking: (bookingId: string, _userId: string) => {
        set(state => ({
          bookings: state.bookings.map(b => 
            b.id === bookingId && b.currentPlayers > 0
              ? { ...b, currentPlayers: b.currentPlayers - 1 }
              : b
          )
        }));
      },
      
      setCourses: (courses: GolfCourse[]) => {
        set({ courses });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'booking-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);