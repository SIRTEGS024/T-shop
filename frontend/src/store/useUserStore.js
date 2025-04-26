import toast from "react-hot-toast";
import { create } from "zustand";
import axios from "../lib/axios";


export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,
	signup: async ({ name, email, password }) => {
		set({ loading: true });
		try {
			const res = await axios.post("/auth/signup", { name, email, password });
			set({ user: res.data, loading: false })
		} catch (error) {
			 set({ loading: false });
			 toast.error(error?.response?.data?.message || "An error occured");
			 throw new Error
		}
	},
	login: async (email, password) => {
		set({ loading: true });
		try {
			const res = await axios.post("/auth/login", { email, password });
			set({ user: res.data, loading: false });
		} catch (error) {
			set({ loading: false });
			toast.error(error?.response?.data?.message || "An error occured");
		}
	},
	logout: async () => {
		set({ loading: true });
		try {
			await axios.post("/auth/logout");
			set({ user: null, loading: false });
			toast.success("Logged out successfully");
		} catch (error) {
			set({ loading: false });
			toast.error(error?.response?.data?.message || "An error occured");
		}
	},
	checkAuth: async () => {
		try {
			const res = await axios.post("/auth/profile");
			set({ user: res.data, checkingAuth: false });
		} catch (error) {
			set({ user: null, checkingAuth: false });
		}
	},

	refreshToken: async () => {
		// Prevent multiple simultaneous refresh attempts
		if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},

	verifyEmail: async (code) => {
		set({ isLoading: true });
		try {
			const response = await axios.post("/auth/verify-email", { code });
			set({ user: response.data.user, isLoading: false });
			toast.success("Email verification successful");
		} catch (error) {
			set({ isLoading: false });
			toast.error(error?.response?.data?.message || "Email verification failed.");
		}
	},

	sendVerificationCode: async () => {
		set({ isLoading: true });
		try {
			await axios.post("/auth/refresh-verification-token");
			set({ isLoading: false });
			toast.success("Verification code sent to your email.");
		} catch (error) {
			set({ loading: false });
			toast.error(error?.response?.data?.message || "Error sending verification Email");
		}
	},

	forgotPassword: async (email) => {
		set({ isLoading: true });
		try {
			await axios.post("/auth/forgot-password", { email });
			set({ isLoading: false });
			toast.success("Password reset link sent.");
		} catch (error) {
			set({ isLoading: false });
		}
	},

	resetPassword: async (token, password) => {
		set({ isLoading: true });
		try {
			await axios.post(`/auth/reset-password/${token}`, { password });
			set({ isLoading: false });
			toast.success("Password reset successful.");
		} catch (error) {
			set({ isLoading: false, });
			toast.error(error?.response?.data?.message || "Failed to reset password. Something went wrong");
			throw new error
		}
	},
}));



let refreshPromise = null;

axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// If a refresh is already in progress, wait for it to complete
				if (refreshPromise) {
					await refreshPromise;
					return axios(originalRequest);
				}

				// Start a new refresh process
				refreshPromise = useUserStore.getState().refreshToken();
				await refreshPromise;
				refreshPromise = null;

				return axios(originalRequest);
			} catch (refreshError) {
				// If refresh fails, redirect to login or handle as needed
				useUserStore.getState().logout();
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);
