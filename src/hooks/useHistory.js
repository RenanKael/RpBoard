import { useCallback, useRef, useState } from 'react';

// Undo/redo wrapper around useState. `set` mutates state without touching
// history (used for continuous drags). `commit` snapshots first, for
// discrete actions (add, delete, text edits, color changes).
export function useHistory(initialState) {
  const [state, setState] = useState(initialState);
  const [, refreshHistory] = useState(0);
  const past = useRef([]);
  const future = useRef([]);

  const snapshot = useCallback(() => {
    past.current.push(state);
    if (past.current.length > 60) past.current.shift();
    future.current = [];
    refreshHistory((value) => value + 1);
  }, [state]);

  const set = useCallback((updater) => {
    setState(updater);
  }, []);

  const commit = useCallback(
    (updater) => {
      snapshot();
      setState(updater);
    },
    [snapshot]
  );

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    refreshHistory((value) => value + 1);
    setState((current) => {
      const prev = past.current.pop();
      future.current.push(current);
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    refreshHistory((value) => value + 1);
    setState((current) => {
      const next = future.current.pop();
      past.current.push(current);
      return next;
    });
  }, []);

  return {
    state,
    set,
    commit,
    snapshot,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
