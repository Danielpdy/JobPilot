import { API_BASE_URL } from "@/lib/api";
import { apiRequest } from "@/lib/httpClient";

{/*export const uploadResumeRequest = async (file, accessToken) =>{
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
}*/}

export const getResume = async (accessToken) => {
    const res = await fetch(`${API_BASE_URL}/resumeanalyzer/preview`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        method: "GET"
    });

    if (!res.ok){
        let message = `Request failed ${res.status}`
        try{
            const errorData = await res.json();
            message = errorData.message || message
        } catch{}
        const error = new Error(message);
        error.status = res.status;
        throw error;
    }

    const fileSize = res.headers.get('X-File-Size');
    const fileName = res.headers.get('X-File-Name');
    const blob = await res.blob();
    const pdfUrl = URL.createObjectURL(blob);

    return { pdfUrl, fileSize, fileName };
}

export const analyzeResume = async (file, accessToken) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/resumeanalyzer/analyze`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        let message = `Request failed ${res.status}`;
        try {
            const errorData = await res.json();
            message = errorData.message || message;
        } catch {}
        const error = new Error(message);
        error.status = res.status;
        throw error;
    }

    return await res.json();
}

export const getAnalysis = async (accessToken) => {
    const res = await fetch(`${API_BASE_URL}/resumeanalyzer/resumeanalysis`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        method: "GET"
    });

    if (!res.ok) {
        let message = `Request failed ${res.status}`;
        try {
            const errorData = await res.json();
            message = errorData.message || message;
        } catch {}
        const error = new Error(message);
        error.status = res.status;
        throw error;
    }

    return await res.json();
} 

export const existResume = async (accessToken) => {
    return apiRequest("/resumeanalyzer/existsresume", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        method: "GET"
    })
}

export const getLastAnalysisDate = async (accessToken) => {
    return apiRequest("/resumeanalyzer/lastanalysisdate", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        method: "GET"
    })
}