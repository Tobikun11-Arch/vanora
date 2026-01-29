import {create} from 'zustand';

export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  profile_picture_url: string | null;
}

interface UserStore {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserStore>(set => ({
  profile: null,
  setProfile: profile => set({profile}),
  clearProfile: () => set({profile: null})
}));
