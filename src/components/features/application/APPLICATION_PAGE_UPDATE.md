# Application Page Update - Display Names Instead of NOREG

## Overview
Updated ApplicationPage.tsx to display actual names of System Owner and Custodian instead of their NOREG (nomor registrasi) numbers for better user experience.

## Changes Made

### 1. Import systemUsers Data
```typescript
import { initialApplications, systemUsers } from "../../../../data";
```

### 2. Added Helper Function
```typescript
// Helper function to get name from NOREG
const getNameFromNoreg = (noreg: string): string => {
  const user = systemUsers.find(u => u.id === noreg);
  return user ? user.name : noreg; // Fallback to NOREG if name not found
};
```

### 3. Updated Table Display
```typescript
// Before: Displayed NOREG
<td className="px-4 py-4 whitespace-nowrap text-sm">
  {app.owner}
</td>
<td className="px-4 py-4 whitespace-nowrap text-sm">
  {app.custodian}
</td>

// After: Display names
<td className="px-4 py-4 whitespace-nowrap text-sm">
  {getNameFromNoreg(app.owner)}
</td>
<td className="px-4 py-4 whitespace-nowrap text-sm">
  {getNameFromNoreg(app.custodian)}
</td>
```

## Data Mapping

### System Users Data
```typescript
export const systemUsers: SystemUser[] = [
  { id: '00123456', name: 'Okubo', division: 'Production Planning Control', email: 'okubo@toyota.co.id', department: 'PPC Dept' },
  { id: '00123457', name: 'Yoshida', division: 'Production Planning Control', email: 'yoshida@toyota.co.id', department: 'PPC Dept' },
  { id: '00234567', name: 'Tanaka', division: 'Production Engineering', email: 'tanaka@toyota.co.id', department: 'PE Dept' },
  { id: '00234568', name: 'Sato', division: 'Production Engineering', email: 'sato@toyota.co.id', department: 'PE Dept' },
  { id: '00345678', name: 'Suzuki', division: 'Corporate Planning', email: 'suzuki@toyota.co.id', department: 'CP Dept' },
  { id: '00345679', name: 'Takahashi', division: 'Corporate Planning', email: 'takahashi@toyota.co.id', department: 'CP Dept' },
];
```

### Application Data with NOREG
```typescript
export const initialApplications: Application[] = [
  {
    id: 'IPPCS',
    name: 'Integrated Production Planning Control System',
    division: 'Production Planning Control',
    owner: '00123456', // Okubo
    custodian: '00123457', // Yoshida
    securityCenter: 'SC',
    // ... other fields
  },
  {
    id: 'PAS',
    name: 'Production Achievement System',
    division: 'Production Engineering',
    owner: '00234567', // Tanaka
    custodian: '00234568', // Sato
    securityCenter: 'Global SC',
    // ... other fields
  },
  {
    id: 'TMS',
    name: 'Toyota Management System',
    division: 'Corporate Planning',
    owner: '00345678', // Suzuki
    custodian: '00345679', // Takahashi
    securityCenter: 'TMMINRole',
    // ... other fields
  },
];
```

## Display Results

### Before Update:
- System Owner: `00123456`
- System Custodian: `00123457`

### After Update:
- System Owner: `Okubo`
- System Custodian: `Yoshida`

## Features

### 1. Name Resolution
- Automatically converts NOREG to actual names
- Uses efficient lookup with `Array.find()`
- Maintains data integrity

### 2. Fallback Mechanism
- If name not found in systemUsers, displays NOREG as fallback
- Prevents display errors
- Ensures data consistency

### 3. Performance
- Helper function is lightweight
- No additional API calls required
- Uses existing data structure

## Benefits

### 1. User Experience
- More readable and user-friendly display
- Easier to identify system owners and custodians
- Better visual clarity

### 2. Data Consistency
- Maintains NOREG in backend data
- Displays names in frontend
- Single source of truth for user data

### 3. Maintainability
- Easy to update names in systemUsers array
- Centralized user data management
- Scalable solution for future users

## Future Enhancements

### 1. Tooltip Enhancement
- Add tooltip showing NOREG when hovering over names
- Display additional user information
- Show user contact details

### 2. User Profile Integration
- Link names to user profiles
- Enable user detail views
- Add user management features

### 3. Dynamic Updates
- Real-time name updates
- User data synchronization
- Automatic refresh mechanisms

This update significantly improves the user experience by displaying meaningful names instead of cryptic NOREG numbers while maintaining data integrity and system performance.
