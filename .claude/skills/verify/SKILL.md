## Verify Feature Completeness
1. Check all DB models have migrations run
2. Verify mock/seed data is context-sensitive (not hardcoded)
3. Trace entity IDs across services to confirm they're persisted
4. Run `tsc --noEmit` and fix any type errors
5. Test the main user flow end-to-end
