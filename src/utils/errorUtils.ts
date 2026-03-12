import { AxiosError } from 'axios';

/**
 * Normalizes any unknown error into a user-friendly string message.
 * Extracts message from Axios errors, native Error objects, or falls back to a default.
 */
export function normalizeError(error: unknown, defaultMessage = "We couldn’t fetch data from the API. Please try again."): string {
    if (!error) return defaultMessage;

    // Handle Axios Error
    if (error instanceof AxiosError) {
        // Network errors or CORS
        if (error.code === 'ERR_NETWORK') {
            return 'Network error. Please check your internet connection.';
        }
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            return 'Request timed out. The server took too long to respond.';
        }

        // API response error with a message
        if (error.response?.data?.message) {
            return error.response.data.message;
        }

        // HTTP Status-based fallbacks
        if (error.response?.status === 401) {
            return 'You are not authorized to view this data.';
        }
        if (error.response?.status === 403) {
            return 'You do not have permission to access this resource.';
        }
        if (error.response?.status === 404) {
            return 'The requested resource was not found.';
        }
        if (error.response?.status && error.response.status >= 500) {
            return 'Server error. Please try again later.';
        }

        return error.message || defaultMessage;
    }

    // Handle standard Error
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes('failed to fetch')) {
            return 'Network error. Please check your internet connection.';
        }
        return error.message;
    }

    // Handle string errors
    if (typeof error === 'string') {
        return error;
    }

    return defaultMessage;
}
