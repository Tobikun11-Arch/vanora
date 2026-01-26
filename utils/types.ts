export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  nomad_type: string;
  travel_style: string;
  relationship_intent: string[];
  current_location: string;
  movement_pattern: string;
  age: number;
  gender: string;
  pronouns?: string;
  bio: string;
  profile_picture_url?: string;
  years_in_van_life: number;
  hobbies: string[];
  skills: string[];
  lifestyle_tags: string[];
  favorite_activities: string[];
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
  user: User | null;
  profileComplete: boolean;
}

export interface IdentityData {
  nomad_type: string;
  travel_style: string;
  relationship_intent: string[];
  current_location: string;
  movement_pattern: string;
}

export interface PersonalDetailsData {
  age: number;
  gender: string;
  pronouns?: string;
  bio: string;
  profile_picture_url?: string;
  years_in_van_life: number;
}

export interface InterestsData {
  hobbies: string[];
  skills: string[];
  lifestyle_tags: string[];
  favorite_activities: string[];
}

export interface PhotosData {
  photos: string[];
}
