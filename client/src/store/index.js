import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducer';
import { initSocket } from '../api/ws/socketController';
import { EVENTS_STORAGE_KEY } from './slices/eventsSlice';

const store = configureStore({
  reducer: rootReducer,
});

let previousEvents = store.getState().eventsStore.events;

store.subscribe(() => {
  const currentEvents = store.getState().eventsStore.events;

  if (currentEvents === previousEvents) {
    return;
  }

  previousEvents = currentEvents;

  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(currentEvents));
  } catch (error) {
    console.error('Cannot save events to localStorage:', error);
  }
});

initSocket(store);

export default store;
