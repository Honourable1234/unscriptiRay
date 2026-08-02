'use client';

import { createContext, use, useState } from 'react';

type AppearanceSelections = Partial<Record<string, string>>;

export type CreateState = {
  style: string | null;
  appearance: AppearanceSelections;
  name: string;
  age: string;
  gender: string;
  voice: string;
  personality: string;
  relationship: string;
  kinks: string[];
  socialRole: string;
  backstory: string;
  scenario: string;
  personalityDetails: string;
  customPhysical: string;
  customFaceDetails: string;
  greeting: string;
  tags: string[];
};

type CreateContextValue = {
  data: CreateState;
  setStyle: (value: string) => void;
  setAppearance: (key: string, value: string) => void;
  setName: (value: string) => void;
  setAge: (value: string) => void;
  setGender: (value: string) => void;
  setVoice: (value: string) => void;
  setPersonality: (value: string) => void;
  setRelationship: (value: string) => void;
  setKinks: (value: string[]) => void;
  setSocialRole: (value: string) => void;
  setBackstory: (value: string) => void;
  setScenario: (value: string) => void;
  setPersonalityDetails: (value: string) => void;
  setCustomPhysical: (value: string) => void;
  setCustomFaceDetails: (value: string) => void;
  setGreeting: (value: string) => void;
  setTags: (value: string[]) => void;
};

const SESSION_KEY = 'create_form';

const defaultState: CreateState = {
  style: null,
  appearance: {},
  name: '',
  age: '',
  gender: '',
  voice: '',
  personality: '',
  relationship: '',
  kinks: [],
  socialRole: '',
  backstory: '',
  scenario: '',
  personalityDetails: '',
  customPhysical: '',
  customFaceDetails: '',
  greeting: '',
  tags: [],
};

const readSession = (): CreateState => {
  if (typeof window === 'undefined') {
    return defaultState;
  }
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return defaultState;
    }
    const parsed = JSON.parse(raw) as CreateState & { kinks: string | string[] };
    // Sessions saved before kinks became multi-select stored a single string.
    const kinks = Array.isArray(parsed.kinks) ? parsed.kinks : (parsed.kinks ? [parsed.kinks] : []);
    return { ...defaultState, ...parsed, kinks };
  } catch {
    return defaultState;
  }
};

const CreateContext = createContext<CreateContextValue>({} as CreateContextValue);

/**
 * Holds the character form state shared by the create steps.
 * @param props - Provider props.
 * @param props.children - Steps that read and write the form state.
 * @param props.initial - Seed state, e.g. an existing character being edited; falls back to the saved draft.
 * @param props.persist - Whether edits are written to the session draft. Off for flows that must not overwrite a create in progress.
 */
export const CreateProvider = (props: { children: React.ReactNode; initial?: CreateState; persist?: boolean }) => {
  const [data, setData] = useState<CreateState>(() => props.initial ?? readSession());
  const persist = props.persist ?? true;

  const update = (patch: Partial<CreateState>) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      if (persist) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const setStyle = (value: string) => update({ style: value });
  const setAppearance = (key: string, value: string) =>
    update({ appearance: { ...data.appearance, [key]: data.appearance[key] === value ? undefined : value } });
  const setName = (value: string) => update({ name: value });
  const setAge = (value: string) => update({ age: value });
  const setGender = (value: string) => update({ gender: value });
  const setVoice = (value: string) => update({ voice: value });
  const setPersonality = (value: string) => update({ personality: value });
  const setRelationship = (value: string) => update({ relationship: value });
  const setKinks = (value: string[]) => update({ kinks: value });
  const setSocialRole = (value: string) => update({ socialRole: value });
  const setBackstory = (value: string) => update({ backstory: value });
  const setScenario = (value: string) => update({ scenario: value });
  const setPersonalityDetails = (value: string) => update({ personalityDetails: value });
  const setCustomPhysical = (value: string) => update({ customPhysical: value });
  const setCustomFaceDetails = (value: string) => update({ customFaceDetails: value });
  const setGreeting = (value: string) => update({ greeting: value });
  const setTags = (value: string[]) => update({ tags: value });

  return (
    <CreateContext value={{ data, setStyle, setAppearance, setName, setAge, setGender, setVoice, setPersonality, setRelationship, setKinks, setSocialRole, setBackstory, setScenario, setPersonalityDetails, setCustomPhysical, setCustomFaceDetails, setGreeting, setTags }}>
      {props.children}
    </CreateContext>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCreate = () => use(CreateContext);
