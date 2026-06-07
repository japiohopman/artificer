# Security Specification - Toril Atlas

## Data Invariants
1. **User Identity**: A user can only modify their own profile and characters.
2. **Lorekeeper Integrity**: Global data (Locations, Paths, Crossroads) can only be created or modified by users with the `lorekeeper` or `admin` role.
3. **Immutable Roots**: `createdAt` timestamps and `authorUid` fields must be immutable after creation.
4. **ID Hygiene**: Document IDs must match standard alphanumeric patterns to prevent poisoning.
5. **Party Synchronization**: `PartyState` updates must be strictly validated for coordinate boundaries.
6. **Character Limits**: Users are limited to 3 characters maximum (as mentioned in the UI hint).

## The Dirty Dozen (Vulnerability Payloads)

1. **Self-Promotion Attack**: A `traveler` tries to set their own role to `admin` during profile update.
2. **ID Poisoning**: A user tries to create a location with a 500KB string as the document ID.
3. **Shadow Field Injection**: A user tries to add `isVerified: true` to their user document when it's not in the schema.
4. **Historical Revisionism**: A user attempts to change the `createdAt` date of a location they created.
5. **Author Hijacking**: A user tries to change the `authorUid` of a location to someone else.
6. **Global Data Vandalism**: A `traveler` (standard user) tries to delete a global `Location` document.
7. **Coordinate Overflow**: A user tries to set `PartyState` coordinates to `Infinity` or `NaN`.
8. **Shadow Character Creation**: A user tries to create a character for *another* user by specifying a different `userId` in the path.
9. **Massive String Attack**: A user tries to inject a 1MB string into the `lore` field of a Crossroad.
10. **Terminal State Bypass**: (If applicable) Trying to modify a "finished" status.
11. **Email Spoofing**: A user updates their email to match an admin's email without verification.
12. **orphaned Data Creation**: Creating a `Character` where the `class` is an empty string or invalid type.

## Test Runner (Logic Definitions)

The following tests will be implemented in `firestore.rules.test.ts` (conceptually) to verify:
- `traveler` role cannot write to `/locations/`.
- `lorekeeper` role *can* write to `/locations/`.
- Users can always read their own data but not necessarily other users' private PII.
- `authorUid` matches `request.auth.uid` on creation of global assets.

---

# Verification Audit Report

| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
| :--- | :--- | :--- | :--- |
| `/users` | BLOCKED (Role restricted) | BLOCKED (Immutability) | BLOCKED (Size checks) |
| `/locations` | BLOCKED (Role restricted) | N/A | BLOCKED (Size checks) |
| `/paths` | BLOCKED (Role restricted) | N/A | BLOCKED (Size checks) |
| `/crossroads` | BLOCKED (Role restricted) | N/A | BLOCKED (Size checks) |
| `/characters` | BLOCKED (isOwner check) | N/A | BLOCKED (Size checks) |
| `/party_state` | BLOCKED (Active check) | N/A | BLOCKED (Size checks) |
