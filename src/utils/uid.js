// Dependency-free id generator — these ids only need to be unique within a
// single board's local storage, not cryptographically random.
export function uid() {
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
