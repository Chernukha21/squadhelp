import { createSelector, createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

export const EVENTS_STORAGE_KEY = 'brandingEvents';

const getStoredEvents = () => {
  try {
    const storedEvents = JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY));

    return Array.isArray(storedEvents) ? storedEvents : [];
  } catch {
    return [];
  }
};

const initialState = {
  events: getStoredEvents(),
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    addEvent: {
      reducer: (state, { payload }) => {
        state.events.push(payload);
      },

      prepare: ({ userId, name, eventAt, notifyBeforeMinutes }) => ({
        payload: {
          id: crypto.randomUUID(),
          userId: String(userId),
          name,
          eventAt,
          notifyBeforeMinutes,
          createdAt: moment().toISOString(),
        },
      }),
    },

    removeEvent: (state, { payload: { eventId, userId } }) => {
      if (userId == null) {
        return;
      }

      state.events = state.events.filter(
        event => event.id !== eventId || String(event.userId) !== String(userId)
      );
    },
  },
});

export const { addEvent, removeEvent } = eventsSlice.actions;

export const selectAllEvents = state => state.eventsStore.events;

const selectCurrentUserId = state => state.userStore.data?.id;

export const selectEvents = createSelector(
  [selectAllEvents, selectCurrentUserId],
  (events, userId) => {
    if (userId == null) {
      return [];
    }

    return events.filter(
      event => event.userId != null && String(event.userId) === String(userId)
    );
  }
);

export const selectSortedEvents = createSelector([selectEvents], events =>
  [...events].sort(
    (firstEvent, secondEvent) =>
      moment(firstEvent.eventAt).valueOf() -
      moment(secondEvent.eventAt).valueOf()
  )
);

export default eventsSlice.reducer;
