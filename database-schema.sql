-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nomad_type VARCHAR(50) NOT NULL,
  travel_style VARCHAR(100) NOT NULL,
  relationship_intent TEXT[] NOT NULL,
  current_location VARCHAR(255) NOT NULL,
  movement_pattern VARCHAR(50) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(50) NOT NULL,
  pronouns VARCHAR(100),
  bio TEXT NOT NULL,
  profile_picture_url VARCHAR(500),
  years_in_van_life INTEGER NOT NULL,
  hobbies TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  lifestyle_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  favorite_activities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile_photos table
CREATE TABLE profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url VARCHAR(500) NOT NULL,
  photo_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create galleries table
CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add gallery_id column to profile_photos to link photos to galleries
ALTER TABLE profile_photos ADD COLUMN gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX profiles_user_id_idx ON profiles(id);
CREATE INDEX profile_photos_user_id_idx ON profile_photos(user_id);
CREATE INDEX galleries_user_id_idx ON galleries(user_id);
CREATE INDEX profile_photos_gallery_id_idx ON profile_photos(gallery_id);

-- Configure Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for profile_photos table
CREATE POLICY "Users can view their own profile photos"
  ON profile_photos FOR SELECT
  USING (auth.uid() = (SELECT id FROM profiles WHERE id = user_id));

CREATE POLICY "Users can insert their own profile photos"
  ON profile_photos FOR INSERT
  WITH CHECK (auth.uid() = (SELECT id FROM profiles WHERE id = user_id));

-- RLS Policy for galleries
CREATE POLICY "Users can view their own galleries"
  ON galleries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own galleries"
  ON galleries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create galleries"
  ON galleries FOR INSERT
  WITH CHECK (auth.uid() = user_id);
