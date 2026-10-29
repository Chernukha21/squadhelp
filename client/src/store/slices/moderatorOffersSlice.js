import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as restController from '../../api/rest/restController';

const SLICE_NAME = 'moderatorOffers';

const initialState = {
  offers: [],
  pagination: {
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 0,
  },
  isFetching: false,
  isUpdating: false,
  activeOfferId: null,
  error: null,
};

const getErrorPayload = error => ({
  data: error?.response?.data ?? 'Gateway Timeout',
  status: error?.response?.status ?? 504,
});

export const getModeratorOffers = createAsyncThunk(
  `${SLICE_NAME}/getOffers`,
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await restController.getModeratorOffers(params);

      return data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

export const moderateOffer = createAsyncThunk(
  `${SLICE_NAME}/moderateOffer`,
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await restController.moderateOffer(payload);

      return data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

const moderatorOffersSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    clearModeratorOffersError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(getModeratorOffers.pending, state => {
      state.isFetching = true;
      state.error = null;
    });

    builder.addCase(getModeratorOffers.fulfilled, (state, { payload }) => {
      state.isFetching = false;
      state.offers = payload.offers;
      state.pagination = payload.pagination;
    });

    builder.addCase(getModeratorOffers.rejected, (state, { payload }) => {
      state.isFetching = false;
      state.error = payload;
    });

    builder.addCase(moderateOffer.pending, (state, { meta }) => {
      state.isUpdating = true;
      state.activeOfferId = meta.arg.offerId;
      state.error = null;
    });

    builder.addCase(moderateOffer.fulfilled, (state, { payload }) => {
      state.isUpdating = false;
      state.activeOfferId = null;

      state.offers = state.offers.map(offer =>
        offer.id === payload.id ? payload : offer
      );
    });

    builder.addCase(moderateOffer.rejected, (state, { payload }) => {
      state.isUpdating = false;
      state.activeOfferId = null;
      state.error = payload;
    });
  },
});

export const { clearModeratorOffersError } = moderatorOffersSlice.actions;

export default moderatorOffersSlice.reducer;
