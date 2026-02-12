import {supabase} from './supabase';

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    try {
      const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      // Create initial profile with display_name
      if (data.user) {
        const {error: profileError} = await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: fullName,
          // Set required fields with defaults (will be updated in profile setup steps)
          nomad_type: 'Not Set',
          travel_style: 'Not Set',
          relationship_intent: [],
          age: 0,
          gender: 'Not Set',
          hobbies: [],
          skills: [],
          lifestyle_tags: [],
          favorite_activities: []
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw here - user is already created, profile will be set up in steps
        }
      }

      return {success: true, data};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  },

  async signIn(email: string, password: string) {
    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return {success: true, data};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  },

  async signOut() {
    try {
      const {error} = await supabase.auth.signOut();
      if (error) throw error;
      return {success: true};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  },

  async getCurrentUser() {
    try {
      const {
        data: {user},
        error
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch {
      return null;
    }
  },

  async getSession() {
    try {
      const {
        data: {session},
        error
      } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch {
      return null;
    }
  },

  async signInWithGoogle() {
    try {
      // TODO: Implement Google OAuth flow with expo-auth-session
      // This requires proper OAuth configuration in Supabase console
      const {data, error} = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'vandora://auth/callback'
        }
      });

      if (error) throw error;
      return {success: true, data};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  },

  async signInWithAzure() {
    try {
      // TODO: Implement Azure OAuth flow with expo-auth-session
      const {data, error} = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: 'vandora://auth/callback'
        }
      });

      if (error) throw error;
      return {success: true, data};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  }
};
