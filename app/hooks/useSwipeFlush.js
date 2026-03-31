import { useCallback, useRef } from "react";
import { useSwipesStore } from "../stores/swipeStore";
import { SaveSwipeBatch } from "../Services/JobService";

export const useSwipeFlush = (accessToken) => {
    const clearFlushed = useSwipesStore(s => s.clearFlushed);
    const timerRef = useRef(null);

    const flushQueue = useCallback(async () => {
      const batch = useSwipesStore.getState().pendingQueue;
      if (batch.length === 0) return;
      console.log("Sending batch:", JSON.stringify(batch)); 
      clearFlushed(batch);
      await SaveSwipeBatch(batch, accessToken);
    }, [accessToken]);

    const scheduleFlush = useCallback(() => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flushQueue, 3000);
    }, [flushQueue]);

    const cancelFlush = useCallback(() => {
      clearTimeout(timerRef.current);
    }, []);

    return { flushQueue, scheduleFlush, cancelFlush };
}