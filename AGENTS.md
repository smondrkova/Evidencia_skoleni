# AGENTS.md

## Goal and scope

Build a simple application that shows employees' mandatory training status
and recommends suitable training sessions based on available capacity.

The first version focuses on useful training status overviews and understandable
training session recommendations. Keep implementation simple and aligned with these
priorities.

## Technology and architecture

- Use React, TypeScript, and Vite.
- Build a static application without a backend or database.
- Keep training requirements, validity calculations, and scheduling rules
  separate from React components.
- Follow existing project naming and structure.
- Add dependencies only when they solve a concrete need.

## Data handling

- Do not modify the original CSV files in `data/`.
- Use 2026-10-01 as the default reference date for calculations.
- Pass the reference date explicitly to calculation functions.
- Exclude personal identification numbers (`rodne_cislo`) from application data.
- Flag ambiguous data instead of guessing corrections.
- Do not treat uncertain records as proof of valid training.
- See `docs/data_notes.md` for data findings and `docs/notes.md` for project goals
  and architecture. The original assignment is in `docs/assignment.md`.
- These documents and source data are local files for now excluded from Git. If they
  are unavailable, do not assume their contents.

## Training recommendations

- Recommend sessions with available places.
- Skip past, cancelled, or invalid sessions.
- Do not recommend sessions that overlap for the same employee.
- Address missing and expired training first, then training that expires soon.
- Explain the recommendation or why no session is available.
- Recommendations are suggestions, not confirmed bookings.

## Verification

- After code changes, run `npm run lint` and `npm run build`.
- Do not claim that a check passed unless it was actually run successfully.

## Git

- Respect `.gitignore`; do not force-add ignored files.
- Do not add source CSV files or local documents to Git.
- Do not create commits or push changes unless explicitly requested.
