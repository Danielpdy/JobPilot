import { apiRequest } from "@/lib/httpClient";


export const LoginCredentials = (credentials) => {
    return apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
    });
};

export const LoginProvider = (provider) => {
    return apiRequest("/auth/oauth", {
        method: "POST",
        body: JSON.stringify(provider)
    });
};

export const RefreshToken = (refreshToken) => {
    return apiRequest("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken })
    });
};

export const Register = (userData) => {
    return apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData)
    });
};

export const RegisterProfile = (userInformation, accessToken) => {
    return apiRequest("/user/registerprofile", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        method: "POST",
        body: JSON.stringify(userInformation)
    });
};

export const GetUserProfile = (accessToken) => {
    return apiRequest("/user/userprofile", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        method: "GET"
    });
};

export const GetJobRefreshesLeft = (accessToken) => {
    return apiRequest("/user/jobrefreshesleft", {
        headers: { "Authorization": `Bearer ${accessToken}` },
        method: "GET"
    });
};

export const GetAnalysesUsed = (accessToken) => {
    return apiRequest("/user/analysesused", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        method: "GET"
    });
};

