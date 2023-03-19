import { create } from 'zustand';

export interface InputStore {
    /**
     * Search term in main input
    */
    term: string;
    // Store last used term in separate field
    prevTerm: string;
    updateTerm: (term: string) => void;
    inputFocused: boolean;
    setInputFocused: (focused: boolean) => void;
}

export const useInputStore = create<InputStore>((set) => ({
  term: '',
  prevTerm: '',
  inputFocused: true,
  updateTerm: (term) => set((state) => ({ term, prevTerm: state.term })),
  setInputFocused: (focused) => set({ inputFocused: focused })
}));
