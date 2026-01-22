import { AuthProvider } from "@refinedev/core";
import { supabaseClient } from "../utils/supabase-client";

const supabase = supabaseClient;

export const authProvider: AuthProvider = {
    login: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return {
                success: false,
                error,
            };
        }

        return {
            success: true,
            redirectTo: "/",
        };
    },
    logout: async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return {
                success: false,
                error,
            };
        }

        return {
            success: true,
            redirectTo: "/login",
        };
    },
    check: async () => {
        const { data } = await supabase.auth.getSession();

        if (data.session) {
            return {
                authenticated: true,
            };
        }

        return {
            authenticated: false,
            redirectTo: "/login",
        };
    },
    getPermissions: async () => null,
    getIdentity: async () => {
        const { data } = await supabase.auth.getUser();

        if (data?.user) {
            return {
                id: data.user.id,
                name: data.user.email,
                avatar: data.user.user_metadata?.avatar_url,
            };
        }

        return null;
    },
    onError: async (error) => {
        console.error(error);
        const status = (error as any)?.statusCode;
        const message = (error as any)?.message;

        if (status === 401 || status === 403 || message === "Auth session missing!" || message?.includes("Tenant context required")) {
            return {
                logout: true,
                redirectTo: "/login",
            };
        }

        return { error };
    },
};
