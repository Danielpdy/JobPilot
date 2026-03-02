
import { API_BASE_URL } from "./api";

export async function apiRequest(path, options = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            "Content-Type": "application/json",
        },
    });

    if (!res.ok){
        const errorData = await res.json();
        const error = new Error(errorData.message || `Request failed ${response.status}`);
        error.status = res.status;
        throw error;
    }

    try{
        return await response.json();
    } catch{
        return null;
    }
}