// slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

 export interface  LayData{
  overlay: string;

}

interface AppState {
  laydata: LayData;
}

const initialState: LayData = {
  overlay: "",
  
};




const overlaySlice= createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLaydata:(state, action: PayloadAction<string>) => {
      console.log(action.payload)
      state.overlay = action.payload;
    },
  }
});

export const { setLaydata } = overlaySlice.actions;
export default overlaySlice.reducer;

// usage in component

