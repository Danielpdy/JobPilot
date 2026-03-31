# Swipe State Flow — Liked Jobs Consistency

This document explains how the store, the flush hook, and the components work together to keep liked jobs consistent — both on screen and in the database.

---

## The problem this solves

When the user swipes right on a job, two things need to happen:

1. The job appears in Job Matches **immediately** — no waiting, no loading spinner
2. The job gets saved to the database **eventually** — so it's still there after a page refresh or new session

These two goals are in tension. Showing it immediately means not waiting for the API call. Saving it eventually means the API call still has to happen at some point. The solution is to split them: **update the UI instantly from local state, and sync to the DB in the background.**

---

## Files involved

| File | Role |
|---|---|
| `app/stores/swipeStore.js` | Global state — source of truth for the UI |
| `app/hooks/useSwipeFlush.js` | Sends pending swipes to the backend |
| `app/components/ui/SwipeCardStack/SwipeCardStack.jsx` | Calls the store on every swipe |
| `app/dashboard/jobmatches/page.jsx` | Reads liked jobs directly from the store |
| `app/dashboard/page.jsx` | Bootstraps the store on login, handles logout flush |

---

## The store — `swipeStore.js`

The store is a global box of state that any component can read or write without passing props. It holds:

```js
likedJobs: []         // jobs shown in Job Matches right now
pendingQueue: []      // swipes waiting to be sent to the backend
```

`pendingQueue` is also saved to `localStorage` every time it changes. That means if the browser crashes or the tab is force-closed, the unsent swipes survive and can be retried on the next login.

### `addSwipe(job, action)`

Called every time the user swipes a card.

```js
addSwipe: (job, action) => {
    set(state => {
        const newQueue = [...state.pendingQueue, { jobId: job.id, action }];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
        return {
            pendingQueue: newQueue,
            likedJobs: action === 'liked' ? [job, ...state.likedJobs] : state.likedJobs
        };
    });
},
```

In one atomic update it does three things:
- Adds `{ jobId, action }` to `pendingQueue` so the flush hook knows about it
- Saves the new queue to `localStorage` for crash safety
- If the action was `liked`, prepends the full job object to `likedJobs` — this is what makes Job Matches update instantly

### `unlikeJob(jobId)`

Called when the user clicks Unlike in Job Matches.

```js
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
```

Same pattern — removes the job from `likedJobs` immediately on screen, and queues a `passed` action to tell the backend.

### `hydrateLiked(jobs)`

```js
hydrateLiked: (jobs) => set({ likedJobs: jobs }),
```

Simple. On fresh login, the dashboard fetches liked jobs from the DB and calls this to load them into the store. After this point, all updates come from `addSwipe` and `unlikeJob` — no more DB fetches needed during the session.

### `clearFlushed(flushedBatch)`

```js
clearFlushed: (flushedBatch) => {
    set(state => {
        const remaining = state.pendingQueue.filter(e => !flushedBatch.includes(e));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
        return { pendingQueue: remaining };
    });
},
```

Called after a successful API call. It removes only the entries that were just sent. The reason it filters by reference (`!flushedBatch.includes(e)`) instead of just clearing everything is safety — new swipes could arrive while the API call was in flight, and those should not be lost.

---

## The flush hook — `useSwipeFlush.js`

This hook is responsible for actually sending the queue to the backend. It does not hold any state itself — it just reads from the store and calls the API.

```js
export const useSwipeFlush = (accessToken) => {
    const clearFlushed = useSwipesStore(s => s.clearFlushed);
    const timerRef = useRef(null);
    ...
}
```

`timerRef` holds the debounce timer. `useRef` is used because changing the timer should not cause a re-render.

### `flushQueue()`

```js
const flushQueue = useCallback(async () => {
    const batch = useSwipesStore.getState().pendingQueue;
    if (batch.length === 0) return;
    clearFlushed(batch);
    await SaveSwipeBatch(batch, accessToken);
}, [accessToken]);
```

Reads the current queue directly from the store (`.getState()` instead of the hook, so it always gets the latest value), clears those entries optimistically, then fires one single POST with the full batch. One API call regardless of how many swipes are in it.

### `scheduleFlush()`

```js
const scheduleFlush = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushQueue, 3000);
}, [flushQueue]);
```

Called after every swipe. Cancels the previous timer and starts a fresh 3-second countdown. If the user keeps swiping, the timer keeps resetting — so the flush only fires after they pause. Fast swiping = one big batch. Slow swiping = a couple of smaller ones.

### `cancelFlush()`

```js
const cancelFlush = useCallback(() => {
    clearTimeout(timerRef.current);
}, []);
```

Cancels any pending timer. Used in `SwipeCardStack` on unmount, so the component can manually call `flushQueue()` immediately instead of waiting for the timer.

---

## How the components use all of this

### `SwipeCardStack` — writing to the store

On every swipe:

```js
const launchFlyingCard = (action, direction) => {
    addSwipe(cards[0], action);   // store updates instantly
    scheduleFlush();               // 3s debounce timer resets
    ...
};
```

On unmount (user navigates away):

```js
useEffect(() => {
    return () => {
        cancelFlush();   // cancel the timer
        flushQueue();    // flush immediately instead
    };
}, []);
```

### `JobMatches` — reading from the store

```js
const likedJobs = useSwipesStore(s => s.likedJobs);
```

That's the entire data source for the Job Matches grid. No fetch, no loading state. Because `addSwipe` already added the job to `likedJobs` the moment the user swiped, it's there immediately when they switch tabs.

### `dashboard/page.jsx` — bootstrapping and logout

On login:

```js
useEffect(() => {
    if (!session?.accessToken) return;

    flushQueue();                                                  // retry any leftover swipes from localStorage
    GetlikedJobs(session.accessToken).then(jobs => hydrateLiked(jobs));  // load DB state into the store
    getJobListing();
}, [session?.accessToken]);
```

On session error (token expired):

```js
useEffect(() => {
    if (session?.error) {
        flushQueue().then(() => signOut({ callbackUrl: '/login' }));
    }
}, [session?.error]);
```

On manual logout:

```js
const handleLogout = async () => {
    await flushQueue();   // drain queue before session ends
    signOut({ callbackUrl: '/login' });
};
```

---

## Full flow — beginning to end

```
USER LOGS IN
│
├─ dashboard fetches liked jobs from DB
├─ hydrateLiked() loads them into the store
└─ flushQueue() sends any leftover swipes from localStorage (crash recovery)

USER SWIPES RIGHT ON A JOB
│
├─ addSwipe(job, 'liked') called
│   ├─ job prepended to likedJobs in store  ← Job Matches shows it instantly
│   ├─ { jobId, action } added to pendingQueue
│   └─ pendingQueue saved to localStorage
│
└─ scheduleFlush() resets 3s timer

USER KEEPS SWIPING
└─ timer keeps resetting — no API calls yet

USER PAUSES FOR 3 SECONDS
└─ flushQueue() fires
    ├─ reads full pendingQueue [A, B, C, D]
    ├─ clearFlushed([A,B,C,D]) — removes them from store + localStorage
    └─ POST /job/swipes  body: [A, B, C, D]  ← one call, full batch

USER SWITCHES TO JOB MATCHES TAB
└─ likedJobs already in store — renders instantly, no fetch

USER CLICKS UNLIKE ON A JOB
├─ unlikeJob(jobId) called
│   ├─ job removed from likedJobs  ← disappears from UI instantly
│   ├─ { jobId, action: 'passed' } added to pendingQueue
│   └─ pendingQueue saved to localStorage
└─ next flush sends the unlike to the backend

USER LOGS OUT
├─ flushQueue() awaited — all pending swipes sent
└─ signOut() — session ends cleanly

BROWSER CRASHES BEFORE FLUSH
└─ localStorage still has pendingQueue

NEXT LOGIN
├─ flushQueue() reads localStorage, sends leftover batch
└─ hydrateLiked() loads DB state — everything is consistent
```

---

## Why localStorage before the API call

The queue is saved to `localStorage` **before** the API call, not after. This means:

- If the API call fails, the swipes are not lost — they stay in localStorage and will be retried on the next flush or next login
- If the browser crashes mid-call, the swipes are still in localStorage
- `clearFlushed` only removes entries that were confirmed sent — new swipes that arrived during the call are safe
