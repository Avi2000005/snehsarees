# Workspace Coding Guidelines

## 1. Code Modification Integrity
- **Check Imports & State Declarations:** When replacing or editing React component files, double-check that imports, interfaces, hook declarations, and state variables at the top of the file remain completely untouched and valid.
- **Strict Verification:** Always run `npx tsc --noEmit` or `npm run build` after editing to ensure no variables or hooks are left undefined due to replacement overlaps.

## 2. Dynamic Categories and Store Filters
- **Unified Grids for Categories:** When a user selects a specific product category (e.g. Cotton, Silk, or a newly added category), render all matched products in a layout/grid. Do not rely strictly on tags like `deals` or `trending` for custom category views, otherwise products added without those tags will not show up.
- **Fallback Empty States:** Ensure there is a clear fallback and user feedback if a category has zero products.
