import {create} from 'zustand';

export interface Step1Data {
  nomad_type: string;
  travel_style: string;
  relationship_intent: string[];
  current_location: string;
  movement_pattern: string;
}

export interface Step2Data {
  age: number;
  gender: string;
  pronouns: string;
  bio: string;
  profile_picture_url: string;
  years_in_van_life: number;
}

export interface Step3Data {
  hobbies: string[];
  skills: string[];
  lifestyle_tags: string[];
  favorite_activities: string[];
}

export interface Step4Data {
  photos: {
    uri: string;
    type: 'van' | 'travel' | 'lifestyle';
  }[];
}

interface ProfileStore {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  setStep1: (data: Step1Data) => void;
  setStep2: (data: Step2Data) => void;
  setStep3: (data: Step3Data) => void;
  setStep4: (data: Step4Data) => void;
  resetProfile: () => void;
}

const initialStep1: Step1Data = {
  nomad_type: '',
  travel_style: '',
  relationship_intent: [],
  current_location: '',
  movement_pattern: ''
};

const initialStep2: Step2Data = {
  age: 0,
  gender: '',
  pronouns: '',
  bio: '',
  profile_picture_url: '',
  years_in_van_life: 0
};

const initialStep3: Step3Data = {
  hobbies: [],
  skills: [],
  lifestyle_tags: [],
  favorite_activities: []
};

const initialStep4: Step4Data = {
  photos: []
};

export const useProfileStore = create<ProfileStore>(set => ({
  step1: initialStep1,
  step2: initialStep2,
  step3: initialStep3,
  step4: initialStep4,
  setStep1: (data: Step1Data) => set({step1: data}),
  setStep2: (data: Step2Data) => set({step2: data}),
  setStep3: (data: Step3Data) => set({step3: data}),
  setStep4: (data: Step4Data) => set({step4: data}),
  resetProfile: () =>
    set({
      step1: initialStep1,
      step2: initialStep2,
      step3: initialStep3,
      step4: initialStep4
    })
}));
