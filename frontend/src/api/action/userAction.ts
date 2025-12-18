// api/action/userAction.ts
import { API } from "../../service/axios";
import userRouterEndPoints from "../../types/endpoints/userEndPoint";

// ==================== TRIP UPLOAD ====================
export const uploadTrip = async (formData: FormData) => {
  const response = await API.post(
    userRouterEndPoints.userUploadTrip,
    formData
  );
  return response.data;
};

// ==================== GET ALL TRIPS ====================
export const trips = async (page: number = 1, limit: number = 10) => {
  const response = await API.get(userRouterEndPoints.userGetTrip, {
    params: { page, limit },
  });
  return response.data;
};

// ==================== GET SPECIFIC TRIP (RAW DATA) ====================
export const getSpecificTrip = async (tripId: string) => {
  const response = await API.get(
    `${userRouterEndPoints.userGetSpecificTrip}/${tripId}`
  );
  return response.data;
};

// ==================== GET TRIP VISUALIZATION (FORMATTED FOR DISPLAY) ====================
export const getTripVisualization = async (
  tripId: string,
  page: number = 1,
  pageSize: number = 10
) => {
  const response = await API.get(
    `${userRouterEndPoints.userGetTripVisualization}/${tripId}/visualization`,
    {
      params: { page, pageSize },
    }
  );
  return response.data;
};

// ==================== GET MULTIPLE TRIPS ====================
export const multipleTripDetail = async (tripIds: string[]) => {
  const response = await API.post(userRouterEndPoints.userGetMultipleTrip, {
    tripIds,
  });
  return response.data;
};

// ==================== GET MULTIPLE TRIPS VISUALIZATION (FOR MAP OVERLAY) ====================
export const getMultipleTripsVisualization = async (tripIds: string[]) => {
  const response = await API.post(
    userRouterEndPoints.userGetMultipleTripsVisualization,
    {
      tripIds,
    }
  );
  return response.data;
};

// ==================== DELETE TRIP ====================
export const deleteTrip = async (tripId: string) => {
  const response = await API.delete(
    `${userRouterEndPoints.userDeleteTrip}/${tripId}`
  );
  return response.data;
};