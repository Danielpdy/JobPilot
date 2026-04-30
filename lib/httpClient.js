
import { API_BASE_URL } from "./api";

export async function apiRequest(path, options = {}) {
    const isFormData = options.body instanceof FormData;
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(!isFormData && { "Content-Type": "application/json" }),
        },
    });

    if (!res.ok){
        let message = `Request failed ${res.status}`;
        try {
            const errorData = await res.json();
            message = errorData.message || message;
        } catch {}
        const error = new Error(message);
        error.status = res.status;
        throw error;
    }

    try{
        return await res.json();
    } catch{
        return null;
    }
}