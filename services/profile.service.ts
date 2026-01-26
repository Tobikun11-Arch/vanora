import {supabase} from './supabase';

export const profileService = {
  async createProfile(userId: string, profileData: any) {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            ...profileData,
            created_at: new Date()
          }
        ])
        .select();

      if (error) throw error;
      return {success: true, data};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  },

  async updateProfile(userId: string, profileData: any) {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select();

      if (error) throw error;
      return {success: true, data};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  },

  async getProfile(userId: string) {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return {success: true, data};
    } catch (error: any) {
      return {success: false, error: error.message, data: null};
    }
  },

  async uploadProfilePhoto(userId: string, photoUri: string, step: number) {
    try {
      const fileName = `${userId}/${step}-${Date.now()}.jpg`;
      const response = await fetch(photoUri);
      const blob = await response.blob();

      const {error} = await supabase.storage
        .from('profile-photos')
        .upload(fileName, blob, {cacheControl: '3600', upsert: false});

      if (error) throw error;

      const {data: publicUrlData} = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      await supabase
        .from('profile_photos')
        .insert([{user_id: userId, step, photo_url: publicUrlData.publicUrl}]);

      return {success: true, fileName, url: publicUrlData.publicUrl};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  },

  async uploadGalleryPhoto(userId: string, photoUri: string, index: number) {
    try {
      const fileName = `${userId}/gallery-${index}-${Date.now()}.jpg`;
      const response = await fetch(photoUri);
      const blob = await response.blob();

      const {error} = await supabase.storage
        .from('gallery-photos')
        .upload(fileName, blob, {cacheControl: '3600', upsert: false});

      if (error) throw error;

      const {data: publicUrlData} = supabase.storage
        .from('gallery-photos')
        .getPublicUrl(fileName);

      return {success: true, url: publicUrlData.publicUrl};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  },

  async getProfilePhotos(userId: string) {
    try {
      const {data, error} = await supabase
        .from('profile_photos')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return {success: true, data};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  }
};
