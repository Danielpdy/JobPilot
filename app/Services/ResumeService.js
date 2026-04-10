import { API_BASE_URL } from "@/lib/api";

export const uploadResumeRequest = async (file, accessToken) =>{
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/user/uploadresume`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        method: "POST",
        body: formData
    });

    if (!res.ok){
        let message = `Request failed ${res.status}`
        try{
            const errorData = await res.json();
            message = errorData.message || message;
        } catch{}
        const error = new Error(message);
        error.status = res.status;
        throw error;
    }

    try {
        return await res.json();
    } catch{
        return null;
    }
}