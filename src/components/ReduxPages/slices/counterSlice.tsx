// store/slices/counterSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface CounterState {
  value: string;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: CounterState = {
  value: "",
  status: 'idle',
};

// Async thunk example
export const incrementAsync = createAsyncThunk(
  'counter/incrementAsync',
  async (amount: number) => {
    // Simulate API call
    const response = await new Promise<number>((resolve) =>
      setTimeout(() => resolve(amount), 1000)
    );
    return response;
  }
);

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
     // console.log("Helloooo idahhh")
      state.value +=1;
    },
    decrement: (state) => {
      state.value +=1
    },
    incrementByAmount: (state, action: PayloadAction<string>) => {
      console.log("Capiyo")
      
      state.value += action.payload;
    },
    setdata:(state, action: PayloadAction<string>) => {
          console.log(action.payload)
          state.value = action.payload;
        },
    reset: (state) => {
      state.value = "chats";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(incrementAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(incrementAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.value += action.payload;
      })
      .addCase(incrementAsync.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

export default counterSlice.reducer;