import { configureStore } from "@reduxjs/toolkit";
import tablesSlice from "./tablesSlice";

const store = configureStore({
    reducer: {
        tables: tablesSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
