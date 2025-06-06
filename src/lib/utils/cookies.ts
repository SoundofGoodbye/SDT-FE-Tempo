// src/lib/utils/cookies.ts
import {parse, serialize} from 'cookie';

export interface CookieOptions {
    maxAge?: number;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    path?: string;
    domain?: string;
}

const defaultCookieOptions: CookieOptions = {
    httpOnly: false, // Set to false for client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 // 30 days
};

export const cookieUtils = {
    // Client-side cookie operations
    get(name: string): string | undefined {
        if (typeof window === 'undefined') return undefined;

        const cookies = parse(document.cookie);
        return cookies[name];
    },

    set(name: string, value: string, options?: CookieOptions): void {
        if (typeof window === 'undefined') return;

        const opts = { ...defaultCookieOptions, ...options };
        document.cookie = serialize(name, value, opts);
    },

    remove(name: string, options?: CookieOptions): void {
        if (typeof window === 'undefined') return;

        const opts = { ...options, maxAge: -1, expires: new Date(0) };
        cookieUtils.set(name, '', opts);
    },

    getAll(): Record<string, string | undefined> {
        if (typeof window === 'undefined') return {};

        return parse(document.cookie);
    },

    // Server-side cookie operations (for Next.js API routes)
    parse(cookieHeader: string): Record<string, string | undefined> {
        return parse(cookieHeader || '');
    },

    serialize(name: string, value: string, options?: CookieOptions): string {
        const opts = { ...defaultCookieOptions, ...options };
        return serialize(name, value, opts);
    }
};

// Helper functions for auth-specific cookies
export const authCookies = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_ID: 'userId',
    USER_EMAIL: 'userEmail',
    USER_ROLES: 'userRoles',
    COMPANY_ID: 'companyId',
    SHOP_ID: 'shopId',
    AUTH_TOKEN: 'authToken', // backward compatibility

    setSecure(name: string, value: string, rememberMe: boolean = false): void {
        const options: CookieOptions = {
            ...defaultCookieOptions,
            httpOnly: false, // Client needs access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: rememberMe ? 30 * 24 * 60 * 60 : undefined, // 30 days if remember me, session otherwise
        };

        cookieUtils.set(name, value, options);
    },

    getSecure(name: string): string | undefined {
        return cookieUtils.get(name);
    },

    clearAll(): void {
        Object.values(authCookies).forEach(cookieName => {
            if (typeof cookieName === 'string') {
                cookieUtils.remove(cookieName);
            }
        });
    }
};