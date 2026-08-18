import { create } from 'zustand';
import api from '../lib/axios/axios';
import { API_ROUTES } from '../lib/api';

interface CartItem {
    id: string;
    chapterId: string;
    chapter: {
        id: string;
        title: string;
        price: number;
        tumbnailUrl?: string | null;
        module: {
            title: string;
            expertise: {
                name: string;
                skillCategory: {
                    name: string;
                    course: {
                        id: string;
                        title: string;
                        tumbnailUrl?: string | null;
                    };
                };
            };
        };
    };
    createdAt: string;
}

interface CartState {
    items: CartItem[];
    total: number;
    itemCount: number;
    isLoading: boolean;
    error: string | null;

    fetchCart: () => Promise<void>;
    addToCart: (chapterId: string) => Promise<boolean>;
    removeFromCart: (chapterId: string) => Promise<boolean>;
    clearCart: () => Promise<void>;
    checkout: () => Promise<{ success: boolean; message: string }>;
    isInCart: (chapterId: string) => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    total: 0,
    itemCount: 0,
    isLoading: false,
    error: null,

    fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get(API_ROUTES.CART.GET);
            const { items, total, itemCount } = res.data.data;
            set({ items, total, itemCount, isLoading: false });
        } catch (err: any) {
            set({
                error: err?.response?.data?.message || 'Failed to fetch cart',
                isLoading: false
            });
        }
    },

    addToCart: async (chapterId: string) => {
        try {
            await api.post(API_ROUTES.CART.ADD, { chapterId });
            await get().fetchCart();
            return true;
        } catch (err: any) {
            set({ error: err?.response?.data?.message || 'Failed to add to cart' });
            return false;
        }
    },

    removeFromCart: async (chapterId: string) => {
        try {
            await api.delete(API_ROUTES.CART.REMOVE(chapterId));
            await get().fetchCart();
            return true;
        } catch (err: any) {
            set({ error: err?.response?.data?.message || 'Failed to remove from cart' });
            return false;
        }
    },

    clearCart: async () => {
        try {
            await api.delete(API_ROUTES.CART.CLEAR);
            set({ items: [], total: 0, itemCount: 0 });
        } catch (err: any) {
            set({ error: err?.response?.data?.message || 'Failed to clear cart' });
        }
    },

    checkout: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post(API_ROUTES.CART.CHECKOUT);
            set({ items: [], total: 0, itemCount: 0, isLoading: false });
            return {
                success: true,
                message: res.data.message || 'Purchase completed successfully!'
            };
        } catch (err: any) {
            set({
                error: err?.response?.data?.message || 'Checkout failed',
                isLoading: false
            });
            return {
                success: false,
                message: err?.response?.data?.message || 'Checkout failed'
            };
        }
    },

    isInCart: (chapterId: string) => {
        return get().items.some(item => item.chapterId === chapterId);
    },
}));
