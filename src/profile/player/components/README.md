# Player Profile Components

This directory contains all player profile components organized into two main folders:

## Structure

```
components/
├── edit/                    # Edit mode components (form-based)
│   ├── PlayerProfileEdit.tsx    # Main edit component
│   ├── sections/                # Form sections
│   │   ├── BasicInformationSection.tsx
│   │   ├── PhysicalAttributesSection.tsx
│   │   ├── AcademicInformationSection.tsx
│   │   ├── AthleticInformationSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── RecruitmentSection.tsx
│   │   ├── ContactInformationSection.tsx
│   │   ├── VideosSection.tsx
│   │   └── SocialMediaSection.tsx
│   └── inputs/                  # Form input components
│       ├── TextInput.tsx
│       ├── EmailInput.tsx
│       ├── SelectInput.tsx
│       └── SubmitButton.tsx
│
└── view/                    # View mode components (public-facing)
    ├── PlayerProfileView.tsx    # Main view component
    ├── HeroSection.tsx
    ├── GameHighlightsSection.tsx
    ├── AcademicProfileSection.tsx
    ├── CoachesPerspectiveSection.tsx
    ├── AthleticAchievementsSection.tsx
    └── RecruitingContactSection.tsx
```

## Usage

### Edit Mode
Used for players to edit their profile information:

```tsx
import { PlayerProfileEdit } from '@/profile/player/components/edit/PlayerProfileEdit';
// or
import { PlayerProfile } from '@/profile/player/components'; // backward compatible

<PlayerProfileEdit playerId={playerId} playerData={playerData} />
```

### View Mode
Used for public-facing profile display:

```tsx
import { PlayerProfileView } from '@/profile/player/components/view/PlayerProfileView';

<PlayerProfileView />
```

## Notes

- `PlayerProfile.tsx` in the root re-exports from `edit/PlayerProfileEdit.tsx` for backward compatibility
- All edit components use form inputs and validation
- All view components are read-only and styled for public display
