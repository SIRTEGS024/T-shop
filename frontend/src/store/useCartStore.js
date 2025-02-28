import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
	cart: [],
	cartStoreLoading: false,
	coupon: null,
	total: 0,
	subtotal: 0,
	isCouponApplied: false,

	getMyCoupon: async () => {
		try {
			const response = await axios.get("/coupons");
			set({ coupon: response.data });
		} catch (error) {
			console.error("Error fetching coupon");
		}
	},

	createCoupon: async (userId) => {
		try {
			await axios.post("/coupons/create", { userId });
			toast.success("You got a free Coupon ");
		} catch (error) {
			console.error("Error creating coupon");
		}
	},

	applyCoupon: async (code) => {
		try {
			const response = await axios.post("/coupons/validate", { code });
			set({ coupon: response.data, isCouponApplied: true });
			get().calculateTotals();
			toast.success("Coupon applied successfully",{id:"couponTrue"});
		} catch (error) {
			set({isCouponApplied: false});
			get().calculateTotals();
			toast.error(error.response.data.message,{id:"couponFalse"});
		}
	},

	removeCoupon: () => {
		set({isCouponApplied: false });
		get().calculateTotals();
		toast.success("Coupon removed");
	},

	getCartItems: async () => {
		try {
			set({ cartStoreLoading: true });
			const res = await axios.get("/cart");
			set({ cart: res.data });
			get().calculateTotals();
		} catch (error) {
			set({ cart: [] });
			set({ cartStoreLoading: false });
		} finally {
			set({ cartStoreLoading: false });
		}
	},
	clearCart: async () => {
		try {
			await axios.delete("/cart", {});
			set({ cart: [], coupon: null, total: 0, subtotal: 0 });
		} catch (error) {
			console.error(error);
		}
	},
	addToCart: async (product) => {
		try {
			set({ cartStoreLoading: true });
			await axios.post("/cart", { productId: product._id });
			set((prevState) => {
				const existingItem = prevState.cart.find((item) => item._id.toString() === product._id.toString());
				const newCart = existingItem
					? prevState.cart.map((item) =>
						item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
					)
					: [...prevState.cart, { ...product, quantity: 1 }];
				return { cart: newCart };
			});
			get().calculateTotals();
			toast.success("Product added to cart");
		} catch (error) {
			toast.error(error.response.data.message || "An error occurred");
		}finally{
			set({ cartStoreLoading: false });
		}
	},
	removeFromCart: async (productId) => {
		await axios.delete(`/cart`, { productId });
		set((prevState) => ({ cart: prevState.cart.filter((item) => item._id.toString() !== productId.toString()) }));
		get().calculateTotals();
		toast.success("Product removed from cart");
	},
	updateQuantity: async (productId, quantity) => {
		if (quantity === 0) {
			get().removeFromCart(productId);
			return;
		}

		await axios.put(`/cart/${productId}`, { quantity });
		set((prevState) => ({
			cart: prevState.cart.map((item) => (item._id.toString() === productId.toString() ? { ...item, quantity } : item)),
		}));
		get().calculateTotals();
	},
	calculateTotals: () => {
		const { cart, coupon, isCouponApplied } = get();
		const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
		let total = subtotal;

		if (coupon && isCouponApplied) {
			const discount = subtotal * (coupon.discountPercentage / 100);
			total = subtotal - discount;
		}

		set({ subtotal, total });
	},
}));
