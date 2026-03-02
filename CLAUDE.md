## Tech Stack

This project uses TypeScript for all application code. Use strict typing and avoid `any` types. Run `tsc --noEmit` after significant changes to catch type errors early.

## Data & Mock Data

When generating mock data or seed data, ensure all data is context-sensitive (e.g., county-specific contests should return data for the selected county, not hardcoded defaults like California). Always verify mock data flows end-to-end before considering a feature complete.

## Quality Checks

Before marking a feature complete, verify that all entity IDs referenced across services are actually persisted to the database. Check foreign key dependencies end-to-end.
