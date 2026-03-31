import { apiRequest } from "@/lib/httpClient";

export const GetNewJobs = (accessToken) => {
    return apiRequest("/job/jobs", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        method: "GET"
    })
};

export const GetLikedJobs = (accessToken) => {
    return apiRequest("/job/likedjobs", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        method: "GET"
    });
};

export const SaveSwipeBatch = (swipes, accessToken) => {
  return apiRequest("/job/swipes", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "POST",
    body: JSON.stringify(swipes),
  });
};
