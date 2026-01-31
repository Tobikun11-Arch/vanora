-- =============================================
-- VANORA DATABASE SCHEMA
-- Complete schema - Run this fresh in Supabase SQL Editor
-- =============================================

-- =============================================
-- ENUMS (Create these first)
-- =============================================

CREATE TYPE post_type AS ENUM ('feed', 'poll', 'image_poll');
CREATE TYPE post_visibility AS ENUM ('everyone', 'followers');
CREATE TYPE photo_type AS ENUM ('profile', 'gallery', 'cover');
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE signal_status AS ENUM ('emergency', 'urgent', 'normal');
CREATE TYPE notification_type AS ENUM ('mechanic_request', 'signal_request', 'general');

-- =============================================
-- PROFILES TABLE (Core user data)
-- =============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  nomad_type VARCHAR(50) NOT NULL,
  travel_style VARCHAR(100) NOT NULL,
  relationship_intent TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  current_location VARCHAR(255),
  movement_pattern VARCHAR(50),
  mechanic_whatsapp VARCHAR(30),
  mechanic_email VARCHAR(255),
  mechanic_instagram VARCHAR(100),
  age INTEGER NOT NULL,
  gender VARCHAR(50) NOT NULL,
  pronouns VARCHAR(100),
  bio TEXT,
  profile_picture_url VARCHAR(500),
  cover_picture_url VARCHAR(500),
  gallery_photos TEXT[] DEFAULT ARRAY[]::TEXT[],  -- ADD THIS LINE
  years_in_van_life INTEGER DEFAULT 0,
  hobbies TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  lifestyle_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  favorite_activities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- USER FOLLOWS (Followers/Following System)
-- =============================================

CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- Prevent self-follow
);

-- =============================================
-- HELP SIGNALS (User assistance requests)
-- =============================================

CREATE TABLE help_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location VARCHAR(255) NOT NULL,
  status signal_status NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS (User to user alerts)
-- =============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type notification_type NOT NULL DEFAULT 'general',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- GALLERIES (User photo albums)
-- =============================================

CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_photo_url VARCHAR(500),
  is_public BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PROFILE PHOTOS (All user photos including gallery photos)
-- =============================================

CREATE TABLE profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gallery_id UUID REFERENCES galleries(id) ON DELETE SET NULL,
  photo_url VARCHAR(500) NOT NULL,
  photo_type photo_type NOT NULL DEFAULT 'gallery',
  caption TEXT,
  location VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE, -- For profile photo selection
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- POSTS TABLE (Main posts - feed, poll, image_poll)
-- =============================================

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_type post_type NOT NULL,
  caption TEXT,
  location VARCHAR(255),
  visibility post_visibility NOT NULL DEFAULT 'everyone',
  category VARCHAR(100),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- POST MEDIA (Images/Videos attached to posts)
-- =============================================

CREATE TABLE post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  media_url VARCHAR(500) NOT NULL,
  media_type media_type NOT NULL DEFAULT 'image',
  thumbnail_url VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- POST TAGS (Tagging other users in posts)
-- =============================================

CREATE TABLE post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tagged_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, tagged_user_id)
);

-- =============================================
-- POST GEAR TAGS (Gear/equipment tags on posts)
-- =============================================

CREATE TABLE post_gear_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  gear_name VARCHAR(100) NOT NULL,
  gear_brand VARCHAR(100),
  gear_link VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- POLL DETAILS (For poll and image_poll posts)
-- =============================================

CREATE TABLE poll_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
  duration_hours INTEGER NOT NULL DEFAULT 48,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_multiple_choice BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- POLL OPTIONS (Options for polls)
-- =============================================

CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES poll_details(id) ON DELETE CASCADE,
  option_text VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- POLL VOTES (User votes on polls)
-- =============================================

CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES poll_details(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- =============================================
-- POST LIKES
-- =============================================

CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- =============================================
-- POST COMMENTS (with reply support)
-- =============================================

CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COMMENT LIKES
-- =============================================

CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- =============================================
-- POST SHARES
-- =============================================

CREATE TABLE post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  share_caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- POST SAVES (Bookmarks)
-- =============================================

CREATE TABLE post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles
CREATE INDEX profiles_username_idx ON profiles(username);
CREATE INDEX profiles_location_idx ON profiles(current_location);

-- Follows
CREATE INDEX user_follows_follower_idx ON user_follows(follower_id);
CREATE INDEX user_follows_following_idx ON user_follows(following_id);

-- Help signals
CREATE INDEX help_signals_user_id_idx ON help_signals(user_id);
CREATE INDEX help_signals_status_idx ON help_signals(status);
CREATE INDEX help_signals_created_at_idx ON help_signals(created_at DESC);

-- Notifications
CREATE INDEX notifications_recipient_id_idx ON notifications(recipient_id);
CREATE INDEX notifications_actor_id_idx ON notifications(actor_id);
CREATE INDEX notifications_created_at_idx ON notifications(created_at DESC);
CREATE INDEX notifications_read_at_idx ON notifications(read_at);

-- Galleries & Photos
CREATE INDEX galleries_user_id_idx ON galleries(user_id);
CREATE INDEX profile_photos_user_id_idx ON profile_photos(user_id);
CREATE INDEX profile_photos_gallery_id_idx ON profile_photos(gallery_id);

-- Posts
CREATE INDEX posts_user_id_idx ON posts(user_id);
CREATE INDEX posts_type_idx ON posts(post_type);
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX posts_visibility_idx ON posts(visibility);

-- Post related
CREATE INDEX post_media_post_id_idx ON post_media(post_id);
CREATE INDEX post_tags_post_id_idx ON post_tags(post_id);
CREATE INDEX post_tags_user_id_idx ON post_tags(tagged_user_id);
CREATE INDEX post_gear_tags_post_id_idx ON post_gear_tags(post_id);

-- Polls
CREATE INDEX poll_details_post_id_idx ON poll_details(post_id);
CREATE INDEX poll_options_poll_id_idx ON poll_options(poll_id);
CREATE INDEX poll_votes_poll_id_idx ON poll_votes(poll_id);
CREATE INDEX poll_votes_user_id_idx ON poll_votes(user_id);

-- Engagement
CREATE INDEX post_likes_post_id_idx ON post_likes(post_id);
CREATE INDEX post_likes_user_id_idx ON post_likes(user_id);
CREATE INDEX post_comments_post_id_idx ON post_comments(post_id);
CREATE INDEX post_comments_user_id_idx ON post_comments(user_id);
CREATE INDEX comment_likes_comment_id_idx ON comment_likes(comment_id);
CREATE INDEX post_shares_post_id_idx ON post_shares(post_id);
CREATE INDEX post_saves_user_id_idx ON post_saves(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_gear_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - PROFILES
-- =============================================

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- RLS POLICIES - FOLLOWS
-- =============================================

CREATE POLICY "Anyone can view follows"
  ON user_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- =============================================
-- RLS POLICIES - HELP SIGNALS
-- =============================================

CREATE POLICY "Anyone can view help signals"
  ON help_signals FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own help signals"
  ON help_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own help signals"
  ON help_signals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own help signals"
  ON help_signals FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - NOTIFICATIONS
-- =============================================

CREATE POLICY "Recipients can view their notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can create notifications they send"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

CREATE POLICY "Recipients can update their notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = recipient_id);

CREATE POLICY "Recipients can delete their notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = recipient_id);

-- =============================================
-- RLS POLICIES - GALLERIES
-- =============================================

CREATE POLICY "Public galleries are viewable"
  ON galleries FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own galleries"
  ON galleries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own galleries"
  ON galleries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own galleries"
  ON galleries FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - PROFILE PHOTOS
-- =============================================

CREATE POLICY "Profile photos viewable based on gallery"
  ON profile_photos FOR SELECT
  USING (
    auth.uid() = user_id 
    OR gallery_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM galleries g 
      WHERE g.id = profile_photos.gallery_id AND g.is_public = true
    )
  );

CREATE POLICY "Users can add their own photos"
  ON profile_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos"
  ON profile_photos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
  ON profile_photos FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - POSTS
-- =============================================

CREATE POLICY "Users can view posts based on visibility"
  ON posts FOR SELECT
  USING (
    visibility = 'everyone' 
    OR user_id = auth.uid()
    OR (visibility = 'followers' AND EXISTS (
      SELECT 1 FROM user_follows 
      WHERE follower_id = auth.uid() AND following_id = posts.user_id
    ))
  );

CREATE POLICY "Users can create their own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - POST MEDIA
-- =============================================

CREATE POLICY "Post media viewable with post"
  ON post_media FOR SELECT
  USING (EXISTS (SELECT 1 FROM posts WHERE posts.id = post_media.post_id));

CREATE POLICY "Users can add media to their posts"
  ON post_media FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_media.post_id AND posts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their post media"
  ON post_media FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_media.post_id AND posts.user_id = auth.uid()
  ));

-- =============================================
-- RLS POLICIES - POST TAGS
-- =============================================

CREATE POLICY "Anyone can view post tags"
  ON post_tags FOR SELECT USING (true);

CREATE POLICY "Users can tag in their posts"
  ON post_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_tags.post_id AND posts.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove tags from their posts"
  ON post_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_tags.post_id AND posts.user_id = auth.uid()
  ));

-- =============================================
-- RLS POLICIES - GEAR TAGS
-- =============================================

CREATE POLICY "Anyone can view gear tags"
  ON post_gear_tags FOR SELECT USING (true);

CREATE POLICY "Users can add gear tags to their posts"
  ON post_gear_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_gear_tags.post_id AND posts.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove gear tags from their posts"
  ON post_gear_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_gear_tags.post_id AND posts.user_id = auth.uid()
  ));

-- =============================================
-- RLS POLICIES - POLLS
-- =============================================

CREATE POLICY "Anyone can view poll details"
  ON poll_details FOR SELECT USING (true);

CREATE POLICY "Users can create polls for their posts"
  ON poll_details FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM posts WHERE posts.id = poll_details.post_id AND posts.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view poll options"
  ON poll_options FOR SELECT USING (true);

CREATE POLICY "Users can create poll options"
  ON poll_options FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM poll_details pd
    JOIN posts p ON p.id = pd.post_id
    WHERE pd.id = poll_options.poll_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view poll votes"
  ON poll_votes FOR SELECT USING (true);

CREATE POLICY "Users can vote on polls"
  ON poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their vote"
  ON poll_votes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - LIKES
-- =============================================

CREATE POLICY "Anyone can view post likes"
  ON post_likes FOR SELECT USING (true);

CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT USING (true);

CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - COMMENTS
-- =============================================

CREATE POLICY "Anyone can view comments"
  ON post_comments FOR SELECT USING (true);

CREATE POLICY "Users can create comments"
  ON post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their comments"
  ON post_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their comments"
  ON post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - SHARES & SAVES
-- =============================================

CREATE POLICY "Anyone can view shares"
  ON post_shares FOR SELECT USING (true);

CREATE POLICY "Users can share posts"
  ON post_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their saves"
  ON post_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
  ON post_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts"
  ON post_saves FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- HELPER VIEWS
-- =============================================

-- Posts with engagement counts
CREATE OR REPLACE VIEW posts_with_stats AS
SELECT 
  p.*,
  pr.username,
  pr.display_name,
  pr.profile_picture_url as author_avatar,
  (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
  (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count,
  (SELECT COUNT(*) FROM post_shares WHERE post_id = p.id) as shares_count,
  (SELECT COUNT(*) FROM post_saves WHERE post_id = p.id) as saves_count
FROM posts p
JOIN profiles pr ON pr.id = p.user_id;

-- Profiles with follower/following counts
CREATE OR REPLACE VIEW profiles_with_stats AS
SELECT 
  p.*,
  (SELECT COUNT(*) FROM user_follows WHERE following_id = p.id) as followers_count,
  (SELECT COUNT(*) FROM user_follows WHERE follower_id = p.id) as following_count,
  (SELECT COUNT(*) FROM posts WHERE user_id = p.id) as posts_count
FROM profiles p;

-- Poll with vote counts per option
CREATE OR REPLACE VIEW poll_results AS
SELECT 
  po.id as option_id,
  po.poll_id,
  po.option_text,
  po.display_order,
  pd.post_id,
  pd.ends_at,
  (SELECT COUNT(*) FROM poll_votes pv WHERE pv.option_id = po.id) as vote_count,
  (SELECT COUNT(*) FROM poll_votes pv WHERE pv.poll_id = po.poll_id) as total_votes
FROM poll_options po
JOIN poll_details pd ON pd.id = po.poll_id;

-- =============================================
-- FUNCTIONS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_galleries_updated_at
  BEFORE UPDATE ON galleries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create the profiles bucket for user content (profile pics, posts, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profiles bucket
CREATE POLICY "Anyone can view profile files"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Authenticated users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
