import { apiRequest } from "@/lib/httpClient";

export const CreateCoverLetter = async ({ company, jobTitle, jobDescription, tone, file, accessToken }) => {
    const formData = new FormData();

    if(file) formData.append("File", file);
    formData.append("Company", company);
    formData.append("JobTitle", jobTitle);
    formData.append("JobDescription", jobDescription);
    formData.append("Tone", tone);

    return apiRequest("/coverletter/coverletterpreview", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        method: "POST",
        body: formData,
    });
};