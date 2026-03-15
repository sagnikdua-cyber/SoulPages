export type Mood = 'happy' | 'sad' | 'neutral' | 'anxious' | 'excited' | 'tired' | 'angry';

export interface User {
  id: string;
  username: string;
  password?: string; // Local storage "password"
  createdAt: number;
}

export interface DiaryEntry {
  id: string;
  userId: string;
  text: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mood: Mood;
  voiceNote?: string; // Data URL or reference
  summary: string;
  emotionalScore: number;
}

export interface Goal {
  id: string;
  userId: string;
  text: string;
  type: 'short' | 'long';
  completed: boolean;
  createdAt: number;
  plan?: string;
  motivation?: string;
}

export interface Memory {
  id: string;
  userId: string;
  text: string;
  image?: string; // Data URL
  song?: {
    id: string;
    title: string;
    thumbnail: string;
  };
  date: string;
}

export interface TodoTask {
  id: string;
  userId: string;
  task: string;
  priority: 'low' | 'medium' | 'high';
  date: string;
  completed: boolean;
}

export interface Mistake {
  id: string;
  userId: string;
  mistake: string;
  lesson: string;
  resolved: boolean;
  advice?: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  completedDates: string[]; // Array of YYYY-MM-DD
  streak: number;
}

export interface Secret {
  id: string;
  userId: string;
  title: string;
  content: string; // Encrypted string
  createdAt: number;
}

export interface Achievement {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: number;
}

export interface Streak {
  id: string;
  userId: string;
  name: string;
  targetDays: number;
  startDate: string; // YYYY-MM-DD
  completedDates: string[]; // Array of YYYY-MM-DD when "I did it" was clicked
}
export interface ProductivitySlot {
  id: string;
  userId: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  activeSecondsToday: number;
  lastUpdated: string; // ISO string to track active time within current session
}

export interface ProductivityHistory {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  totalProductivityPercentage: number;
  slotsDetails: {
    name: string;
    percentage: number;
  }[];
}
