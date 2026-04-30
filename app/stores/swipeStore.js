import { create } from "zustand";

const STORAGE_KEY = 'pendingSwipes';

export const useSwipesStore = create((set) => ({
    likedJobs: [],
    pendingQueue: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') : [],

    hydrateLiked: (jobs) => set(state => {
        const pendingPassed = new Set(
            state.pendingQueue.filter(j => j.action === 'passed').map(j => j.id)
        );
        const pendingLiked = state.pendingQueue
            .filter(j => j.action === 'liked')
            .filter(j => !jobs.some(bj => bj.id === j.id));
        const merged = [
            ...pendingLiked,
            ...jobs.filter(j => !pendingPassed.has(j.id)),
        ];
        return { likedJobs: merged };
    }),

    addSwipe: (job, action) => {
        set(state => {
            const newQueue = [...state.pendingQueue, { ...job, action }];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
            return {
                pendingQueue: newQueue,
                likedJobs: action === 'liked' ? [job, ...state.likedJobs] : state.likedJobs,
            };
        });
    },

    unlikeJob: (jobId) => {
        set(state => {
            const job = state.likedJobs.find(j => j.id === jobId);
            const newQueue = job
                ? [...state.pendingQueue, { ...job, action: 'passed' }]
                : state.pendingQueue;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
            return {
                pendingQueue: newQueue,
                likedJobs: state.likedJobs.filter(j => j.id !== jobId),
            };
        });
    },

    clearFlushed: (flushedBatch) => {
        set(state => {
            const remaining = state.pendingQueue.filter(e => !flushedBatch.includes(e));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
            return { pendingQueue: remaining };
        });
    },

    updateQueueAction: (jobid, action) => {
        set(state => {
            const newQueue = state.pendingQueue.map(s =>
                s.id === jobid ? { ...s, action } : s
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
            return { pendingQueue: newQueue };
        });
    },
}));