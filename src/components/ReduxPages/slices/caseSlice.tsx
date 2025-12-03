// slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CaseData {
  caseTitle: string;
  caseId: string;
  budget:  string;
}

interface AppState {
  caseData: CaseData;
}

const initialState: AppState = {
  caseData: {
    caseTitle: '',
    caseId: '',
    budget: ""
  }
};

const caseSlice= createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCaseData: (state, action: PayloadAction<CaseData>) => {
     console.log(action.payload)
      state.caseData = action.payload;
    }
  }
});

export const { setCaseData } = caseSlice.actions;
export default caseSlice.reducer;

// usage in component

