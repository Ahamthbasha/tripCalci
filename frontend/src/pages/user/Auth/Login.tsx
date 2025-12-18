import React, { useState } from 'react';
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

// Strong password validation schema
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .trim()
    .email("Please enter a valid email address")
    .max(254, "Email is too long")
    .test("no-consecutive-dots", "Email cannot contain consecutive dots", (value) => {
      if (!value) return true;
      return !value.includes("..");
    })
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address"
    ),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password is too long (maximum 128 characters)")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/]/,  // ← Fixed: removed unnecessary escapes
      "Password must contain at least one special character (@$!%*?&#^()_+-=[]{};':\"\\|,.<>/)"
    )
    .test(
      "no-common-passwords",
      "Password is too common. Please choose a stronger password",
      (value) => {
        if (!value) return true;
        const weakPasswords = [
          "password",
          "12345678",
          "qwerty123",
          "abc123456",
          "password1",
          "password123",
        ];
        return !weakPasswords.some((weak) =>
          value.toLowerCase().includes(weak)
        );
      }
    ),
});

// Rest of the component remains unchanged
const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const initialValues: Login = {
    email: "",
    password: "",
    role: "user",
  };

  const onSubmit = async (data: Login) => {
    try {
      const response = await login({
        email: data.email.trim().toLowerCase(),
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
          {({ isSubmitting, errors, touched }) => (
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
                  placeholder="example@email.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.email && touched.email
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-gray-400"
                  }`}
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
                <div className="relative">
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter strong password"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition pr-12 ${
                      errors.password && touched.password
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-gray-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
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
                {isSubmitting ? "Logging in..." : "Log in"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginPage;