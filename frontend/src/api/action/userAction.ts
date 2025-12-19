import { API } from "../../service/axios";
import userRouterEndPoints from "../../types/endpoints/userEndPoint";

export const uploadTrip = async (formData: FormData) => {
  const response = await API.post(
    userRouterEndPoints.userUploadTrip,
    formData
  );
  return response.data;
};

export const trips = async (page: number = 1, limit: number = 10) => {
  const response = await API.get(userRouterEndPoints.userGetTrip, {
    params: { page, limit },
  });
  return response.data;
};

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

export const getMultipleTripsVisualization = async (tripIds: string[]) => {
  const response = await API.post(
    userRouterEndPoints.userGetMultipleTripsVisualization,
    {
      tripIds,
    }
  );
  return response.data;
};

export const deleteTrip = async (tripId: string) => {
  const response = await API.delete(
    `${userRouterEndPoints.userDeleteTrip}/${tripId}`
  );
  return response.data;
};