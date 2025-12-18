import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios";
import { toast } from "react-toastify";
import { clearUserDetails } from "../redux/slices/userSlice"; 
import { type NavigateFunction } from "react-router-dom";
import { type AnyAction, type Dispatch } from "@reduxjs/toolkit";
import { StatusCode } from "../utils/enums";

export const API: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASEURL || "http://localhost:3000",
  withCredentials: true,
});

export const configureAxiosInterceptors = (
  dispatch: Dispatch<AnyAction>,
  navigate: NavigateFunction
) => {
  API.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
      }
      return config;
    },
    (error: AxiosError) => {
      console.error("Request Interceptor Error:", error);
      return Promise.reject(error);
    }
  );

  API.interceptors.response.use(
    (response: AxiosResponse) => {
      // Check if token was refreshed
      if (response.headers["x-token-refreshed"] === "true") {
        console.log("✅ Token automatically refreshed");
      }
      return response;
    },
    async (error: AxiosError<{ message?: string; failToken?: boolean }>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized
      if (error.response?.status === StatusCode.UNAUTHORIZED) {
        const errorData = error.response.data;
        
        // Check if this is a token refresh failure
        if (errorData?.failToken === true) {
          // Check if we haven't already retried
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              // The backend middleware should have already attempted refresh
              // So we retry the original request once
              console.log("🔄 Retrying request after potential token refresh...");
              return API(originalRequest);
            } catch (retryError) {
              // If retry fails, logout the user
              console.warn("🚫 Retry failed: Session expired");
              dispatch(clearUserDetails());
              toast.error("Session expired. Please login again.");
              navigate("/login");
              return Promise.reject(retryError);
            }
          } else {
            // Already retried, now logout
            console.warn("🚫 Authentication failed after retry: Session expired");
            dispatch(clearUserDetails());
            toast.error("Session expired. Please login again.");
            navigate("/login");
          }
        }
      } else if (error.response?.status === StatusCode.INTERNAL_SERVER_ERROR) {
        toast.error("Server error occurred. Please try again.");
      }

      return Promise.reject(error);
    }
  );
};