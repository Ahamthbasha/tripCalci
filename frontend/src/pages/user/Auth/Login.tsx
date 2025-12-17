import React from 'react';
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { login } from "../../../api/auth/userAuth";
import { setUser } from "../../../redux/slices/userSlice";
import type { Login } from "../../../types/interface/userInterface";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialValues: Login = {
    email: "",
    password: "",
    role: "user",
  };

  const onSubmit = async (data: Login) => {
    try {
      const response = await login({
        email: data.email,
        password: data.password,
        role: "user",
      });

      if (response.success) {
        const user = response.user;
        
        localStorage.setItem("user", JSON.stringify(user));
        
        dispatch(
          setUser({
            _id: user.id,
            email: user.email,
            role: user.role,
          })
        );

        toast.success(response.message || "Login successful!");
        navigate("/");
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || "Login failed. Please try again";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-200 via-blue-100 to-blue-300">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Logo and Title */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="relative w-12 h-12">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#000"
                strokeWidth="4"
                fill="white"
              />
              <line x1="50" y1="10" x2="50" y2="20" stroke="#000" strokeWidth="3" />
              <line x1="78" y1="22" x2="72" y2="28" stroke="#000" strokeWidth="3" />
              <line x1="90" y1="50" x2="80" y2="50" stroke="#000" strokeWidth="3" />
              <line x1="78" y1="78" x2="72" y2="72" stroke="#000" strokeWidth="3" />
              <line x1="22" y1="22" x2="28" y2="28" stroke="#000" strokeWidth="3" />
              <line x1="10" y1="50" x2="20" y2="50" stroke="#000" strokeWidth="3" />
              <line x1="22" y1="78" x2="28" y2="72" stroke="#000" strokeWidth="3" />
              <circle cx="50" cy="50" r="6" fill="#000" />
              <line
                x1="50"
                y1="50"
                x2="75"
                y2="30"
                stroke="#000"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Speedo</h1>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="Example@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <Field
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Log in..." : "Log in"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginPage;