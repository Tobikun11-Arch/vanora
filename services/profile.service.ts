import * as FileSystem from 'expo-file-system/legacy';
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

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Convert base64 → Uint8Array
      const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

      // Upload binary data
      const {error} = await supabase.storage
        .from('profile-photos')
        .upload(fileName, byteArray, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const {data} = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      // Save reference in DB
      await supabase
        .from('profile_photos')
        .insert([{user_id: userId, step, photo_url: publicUrl}]);

      return {success: true, fileName, url: publicUrl};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  },

  async uploadGalleryPhoto(userId: string, photoUri: string, index: number) {
    try {
      const fileName = `${userId}/gallery-${index}-${Date.now()}.jpg`;
  
      // Read file as binary (not base64)
      const fileData = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      // Convert base64 → Uint8Array
      const byteArray = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
  
      const { error } = await supabase.storage
        .from('gallery-photos')
        .upload(fileName, byteArray, {
          contentType: 'image/jpeg',
          upsert: false,
        });
  
      if (error) throw error;
  
      const { data } = supabase.storage
        .from('gallery-photos')
        .getPublicUrl(fileName);
  
      return { success: true, url: data.publicUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
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
