import { apiRequest } from "@/lib/httpClient";

export const GetNewJobs = (accessToken) => {
    return apiRequest("/job/jobs", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        method: "GET"
    })
};