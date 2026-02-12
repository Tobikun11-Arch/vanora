# Components/Tabs Folder Organization

This document describes the organized structure of the `components/tabs` folder following the pattern established in the `explore` folder.

## Folder Structure Pattern

Each tab folder now follows this consistent structure:

```
tab-name/
├── [TabName]Tab.tsx       # Main component file
├── constants.ts           # Constants and configuration values
├── data.ts               # Static data and data-related functions
├── styles.ts             # StyleSheet definitions (if needed)
└── components/           # Sub-components specific to this tab
    └── [SubComponent].tsx
```

## Organized Folders

### 1. **explore/**
```
explore/
├── ExploreTab.tsx        # Main explore tab component
├── constants.ts          # Screen dimensions, padding, spacing constants
├── data.ts              # News items, community spotlight, road quests, leaderboard data
├── styles.ts            # All StyleSheet definitions for explore tab
└── components/          # (Empty - ready for future sub-components)
```

### 2. **home/**
```
home/
├── HomeTab.tsx          # Main home tab component (manages sub-tabs)
├── constants.ts         # Window dimensions, cache settings, pagination constants
├── data.ts             # Story items data
├── styles.ts           # (Empty - styles imported from @/styles)
└── components/         # Sub-tab components
    ├── EventsTab.tsx
    ├── FeedTab.tsx
    ├── FindMatchTab.tsx
    └── FeedPostCard.tsx
```

**Updated Imports:** HomeTab.tsx now imports from `./components/` instead of `./home/`

### 3. **profile/**
```
profile/
├── ProfileTab.tsx       # Main profile tab component
├── constants.ts         # Gallery image size, header height constants
├── data.ts             # (Placeholder for future data needs)
├── styles.ts           # (Empty - styles imported from @/styles)
└── components/         # (Empty - ready for future sub-components)
```

### 4. **find-tech/**
```
find-tech/
├── FindTechTab.tsx      # Main find-tech tab component
├── constants.ts         # Screen dimensions, padding, card radius constants
├── data.ts             # (Placeholder for future data needs)
├── styles.ts           # (Empty - styles imported from @/styles)
└── components/         # (Empty - ready for future sub-components)
```

### 5. **notifications/**
```
notifications/
├── NotificationsTab.tsx # Main notifications tab component
├── constants.ts         # Window dimensions, padding, spacing constants
├── data.ts             # (Placeholder for future data needs)
├── styles.ts           # (Empty - styles imported from @/styles)
└── components/         # (Empty - ready for future sub-components)
```

## Benefits of This Organization

1. **Consistency**: All tab folders follow the same predictable structure
2. **Separation of Concerns**: Constants, data, styles, and components are clearly separated
3. **Maintainability**: Easy to locate and modify specific aspects of each tab
4. **Scalability**: The `components/` folder is ready for future sub-components
5. **Clean Imports**: Clear import paths make dependencies obvious

## Notes

- **No Functional Changes**: This reorganization only moves files and updates import paths
- **Preserved Functionality**: All existing functions, designs, and data remain unchanged
- **Styles Location**: Most tabs import styles from `@/styles` (centralized styles)
- **Future-Ready**: Empty `components/` folders and placeholder `data.ts` files are ready for future additions
