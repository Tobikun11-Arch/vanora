import {supabase} from '@/services/supabase';
import {create} from 'zustand';

export interface MechanicProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  current_location: string | null;
  profile_picture_url: string | null;
  is_verified: boolean | null;
  nomad_type: string | null;
  skills: string[] | null;
  mechanic_whatsapp: string | null;
  mechanic_email: string | null;
  mechanic_instagram: string | null;
}

interface FetchOptions {
  force?: boolean;
}

interface FindTechStore {
  mechanics: MechanicProfile[];
  loading: boolean;
  error: string | null;
  hasLoaded: boolean;
  followingIds: string[];
  fetchMechanics: (options?: FetchOptions) => Promise<void>;
  toggleFollow: (mechanicId: string) => Promise<void>;
}

export const useFindTechStore = create<FindTechStore>((set, get) => ({
  mechanics: [],
  loading: false,
  error: null,
  hasLoaded: false,
  followingIds: [],
  fetchMechanics: async (options?: FetchOptions) => {
    const {hasLoaded} = get();
    if (hasLoaded && !options?.force) return;

    set({loading: true, error: null});
    try {
      const {
        data: {user}
      } = await supabase.auth.getUser();
      if (!user) {
        set({loading: false});
        return;
      }

      const {data: followingData, error: followingError} = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followingError) throw followingError;

      const {data: mechanicData, error: mechanicError} = await supabase
        .from('profiles')
        .select(
          `
          id,
          username,
          display_name,
          bio,
          current_location,
          profile_picture_url,
          is_verified,
          nomad_type,
          skills,
          mechanic_whatsapp,
          mechanic_email,
          mechanic_instagram
        `
        )
        .eq('is_verified', true)
        .ilike('nomad_type', 'mechanic')
        .neq('id', user.id)
        .order('created_at', {ascending: false})
        .limit(3);

      if (mechanicError) throw mechanicError;

      set({
        mechanics: mechanicData || [],
        followingIds: followingData?.map(item => item.following_id) || [],
        hasLoaded: true
      });
    } catch (error: any) {
      console.error('Error fetching mechanics:', error);
      set({error: error?.message ?? 'Failed to load mechanics'});
    } finally {
      set({loading: false});
    }
  },
  toggleFollow: async (mechanicId: string) => {
    const {
      data: {user}
    } = await supabase.auth.getUser();
    if (!user) return;

    const {followingIds} = get();
    const isFollowing = followingIds.includes(mechanicId);

    if (isFollowing) {
      const {error} = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', mechanicId);

      if (error) throw error;

      set({
        followingIds: followingIds.filter(id => id !== mechanicId)
      });
      return;
    }

    const {error} = await supabase.from('user_follows').insert({
      follower_id: user.id,
      following_id: mechanicId
    });

    if (error) throw error;

    set({
      followingIds: [...followingIds, mechanicId]
    });
  }
}));
