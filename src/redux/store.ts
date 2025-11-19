import { configureStore } from '@reduxjs/toolkit'
import { createLogger } from 'redux-logger'

// Slices
import counterReducer from './slices/counterSlice'

// Configure logger middleware (only for development)
const logger = createLogger({
  collapsed: true,
  diff: true,
})

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    import.meta.env.MODE !== 'production'
      ? getDefaultMiddleware().concat(logger)
      : getDefaultMiddleware(),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
