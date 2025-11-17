# Finance Category System Migration

## Overview

The finance category system has been updated from a **global/user hybrid model** to a **user-owned cloning model**. This change allows users to fully customize their finance categories without restrictions.

## What Changed

### Before:
- Categories had `isGlobal` flag
- Global categories were read-only for all users
- Users couldn't delete or fully customize global categories
- Mixed ownership model (global + user-specific)

### After:
- All categories are user-owned
- Each user gets their own copy of default categories on signup
- Users have full CRUD control over all their categories
- No global categories - everything is customizable

## Key Changes

### 1. Database Models (`Finance.Categories.models.js`)
- **Removed**: `isGlobal` field from both Category and SubCategory
- **Changed**: `user` field from optional (`default: null`) to **required**
- All categories must now belong to a user

### 2. Initialization System (`lib/initializeFinanceCategories.js`)
- **New function**: `createFinCat(userId)` - Clones default categories for a user
- **Template**: `GLOBAL_CATEGORY_TEMPLATE` - Array of 13 default categories with subcategories
- Automatically called during user registration

### 3. Auth Controller (`Auth.controllers.js`)
- Added `createFinCat` call during user registration
- New users get default categories automatically
- Existing shelf initialization remains unchanged

### 4. Category Controller (`Finance.categories.controller.js`)
- **Simplified queries**: Removed `isGlobal` checks from all queries
- **getCategoriesWithSubcategories**: Now only fetches `user: userId` (no global fallback)
- **CRUD operations**: Removed permission checks for global categories
- All operations now only check user ownership

### 5. Frontend API (`FinanceConfigCalls.js`)
- Removed `isGlobal` parameter from create operations
- Simplified error handling (no more 403 for global categories)
- Cleaner API interface

### 6. Frontend Component (`FinanceConfig.jsx`)
- Removed global category warnings
- Users can delete any of their categories
- Simplified error messages

## Default Categories

New users automatically receive 13 categories:

**Expense Categories:**
1. Food 🍔 (8 subcategories)
2. Transport 🚗 (6 subcategories)
3. Household 🏠 (6 subcategories)
4. Apparel 👗 (5 subcategories)
5. Education 🎓 (4 subcategories)
6. Chill 😎 (4 subcategories)
7. Health ❤️ (4 subcategories)
8. Useless Things 🫣
9. Others 🗂️

**Income Categories:**
10. Salary 💰 (3 subcategories)
11. Investments 📈 (4 subcategories)
12. Gifts & Rewards 🎁 (3 subcategories)
13. Freelance / Side Hustle 💻 (3 subcategories)

## Migration for Existing Users

### Automatic Migration (New Users)
- New registrations automatically get default categories
- No action required

### Manual Migration (Existing Users)
Run the migration script to initialize categories for existing users:

```bash
cd backend
node scripts/migrateFinanceCategories.js
```

This script:
- Finds all users without finance categories
- Initializes default categories for each user
- Provides detailed progress logging
- Safe to run multiple times (skips users who already have categories)

## Database Cleanup

After migration, you can optionally clean up old global categories:

```javascript
// MongoDB shell or script
db.finance_categories.deleteMany({ isGlobal: true });
db.finance_subcategories.deleteMany({ isGlobal: true });
```

**Warning**: Only do this after confirming all users have been migrated!

## Benefits

1. **Full User Control**: Users can rename, edit, or delete any category
2. **No Restrictions**: No more "cannot delete global category" errors
3. **Personalization**: Each user can fully customize their finance system
4. **Simpler Code**: Removed complex permission checks and queries
5. **Better UX**: Users aren't confused by read-only categories

## Rollback Plan

If needed to rollback:

1. Restore old model files with `isGlobal` fields
2. Restore old controller logic
3. Run a script to re-create global categories
4. Update frontend to handle global categories again

**Note**: User-created categories during the new system will remain user-owned.

## Testing Checklist

- [ ] New user registration creates default categories
- [ ] User can create new categories
- [ ] User can edit category names
- [ ] User can delete categories (including defaults)
- [ ] User can create subcategories
- [ ] User can edit subcategories
- [ ] User can delete subcategories
- [ ] Finance entries correctly link to user categories
- [ ] Migration script works for existing users
- [ ] No 403 errors when deleting categories

## Files Modified

### Backend:
- `models/Finance.Categories.models.js`
- `controllers/Auth.controllers.js`
- `controllers/Finance.categories.controller.js`
- `lib/initializeFinanceCategories.js` (new)
- `scripts/migrateFinanceCategories.js` (new)

### Frontend:
- `api/FinanceConfigCalls.js`
- `components/finance/FinanceConfig.jsx`

## Environment Variables

No new environment variables required.

## Dependencies

No new dependencies added.

---

**Migration Date**: November 17, 2025  
**Version**: 2.0.0  
**Status**: ✅ Ready for deployment
