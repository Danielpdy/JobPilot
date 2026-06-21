import { apiRequest } from "@/lib/httpClient";

export const startInterview = ({ jobTitle, interviewType, difficulty, questionCount, resumeText, jobDescriptionText, accessToken }) =>
    apiRequest("/interview/start", {
        headers: { "Authorization": `Bearer ${accessToken}` },
        method: "POST",
        body: JSON.stringify({ jobTitle, interviewType, difficulty, questionCount, resumeText, jobDescriptionText }),
    });

export const submitAnswer = ({ interviewId, questionNumber, answerText, durationSeconds, accessToken }) =>
    apiRequest("/interview/submitanswer", {
        headers: { "Authorization": `Bearer ${accessToken}` },
        method: "POST",
        body: JSON.stringify({ interviewId, questionNumber, answerText, durationSeconds }),
    });
