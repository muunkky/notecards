# Notecards Cloud Functions

This package houses Firebase Cloud Functions for the Notecards app.

- Runtime: Node.js 20, ES Modules, TypeScript
- Deployed codebase: default (configured in root firebase.json)

Scripts:
- build: compile TypeScript to lib/
- serve: build and start Firestore + Functions emulators
- deploy: build and deploy only functions

During development, prefer emulator-backed tests and local runs. The callable `acceptInvite` is scaffolded and will be completed with validation and transactional updates.
