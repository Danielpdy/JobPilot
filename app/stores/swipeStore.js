import { create } from "zustand";

const STORAGE_KEY = 'pendingSwipes';

export const useSwipesStore = create((set, get) => ({
    likedJobs: [],
    pendingQueue: JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'),

    hydrateLiked: (jobs) => set({ likedJobs: jobs }),

    addSwipe: (job, action) => {
        set(state => {
            const newQueue = [...state.pendingQueue, {jobId: job.id, action}];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
            return {
                pendingQueue: newQueue,
                likedJobs: action === 'liked' ? [job, ...state.likedJobs] : state.likedJobs
            };
        });
    },

    unlikeJob: (jobId) => {
        set(state => {
            const newQueue = [...state.pendingQueue, { jobId, action: 'passed' }];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
            return {
                pendingQueue: newQueue,
                likedJobs: state.likedJobs.filter(j => j.id !== jobId),
            };
        });
    },

    clearFlushed: (flushedBatch) => {
        set(state => {
            const remaining = state.pendingQueue.filter(e => !flushedBatch.includes(e))
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
            return { pendingQueue: remaining };
        });
    },
}));