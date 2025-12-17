import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios";
import { toast } from "react-toastify";
import { clearUserDetails } from "../redux/slices/userSlice"; 
import { type NavigateFunction } from "react-router-dom";
import { type AnyAction, type Dispatch } from "@reduxjs/toolkit";
import { StatusCode } from "../utils/enums";

export const API: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASEURL || "http://localhost:3000",
  withCredentials: true, // This automatically sends cookies with requests
});

export const configureAxiosInterceptors = (
  dispatch: Dispatch<AnyAction>,
  navigate: NavigateFunction
) => {
  API.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Set content type for non-FormData requests
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
    (response: AxiosResponse) => response,
    (error: AxiosError<{ message?: string }>) => {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response?.status === StatusCode.UNAUTHORIZED) {
        console.warn("401 Unauthorized: Session expired");
        
        // Clear user data from Redux
        dispatch(clearUserDetails());
        
        // Show toast notification
        toast.error("Token expired. Please login again.");
        
        // Redirect to login
        navigate("/login");
      } else {
        // Log other errors
        console.error("Axios error:", error);
      }

      return Promise.reject(error);
    }
  );
};