---
"@heybray/react": patch
---

Gate Settings modal tabs on each panel's `managePermission` / `requiresRole` instead of treating any layout manage permission as access to all admin tabs (fixes 403 when opening Settings as a single-domain manager).
