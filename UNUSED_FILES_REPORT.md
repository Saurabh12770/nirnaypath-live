# UNUSED FILES REPORT
**NirnayPath 3.0 — Phase 6 Audit**
Generated: 2026-06-17

---

## SUMMARY

| Category | Count |
|---|---|
| Dead / near-empty question files | 4 |
| Legacy seeder scripts (superseded) | 6 |
| Orphaned data directories | 2 |
| Orphaned backup files | 7 |
| Unused scripts in `/scripts` root | 90+ |
| Total root-level report .md files | 28+ |

---

## SECTION 1 — DEAD QUESTION FILES

**Location**: `data/questions/`

| File | Questions | Verdict | Reason |
|---|---|---|---|
| `test.json` | 1 | 🔴 DELETE | Test artifact. Already excluded in `seedAll.js` via `f !== 'test.json'`. Has zero production value. |
| `social_science.json` | 4 | 🔴 DELETE or EXPAND | 4 questions cannot meaningfully power a test. Triggers emergency fallback on every use. |
| `chemistry.json` | 6 | 🟡 EXPAND | 6 questions is not enough. Chemistry is a UPSC/SSC topic needing 100+ questions minimum. |
| `law.json` | 11 | 🟡 EXPAND | Law questions for State PCS / CLAT need expansion. 11 questions is unusable. |
| `police_science.json` | 20 | 🟡 EXPAND | 20 questions is borderline. Minimum viable is 50+. |

---

## SECTION 2 — ORPHANED DATA DIRECTORIES

| Directory | Status | Notes |
|---|---|---|
| `data/content/` | 🔴 EMPTY | Listed in folder structure, never used. No files inside. |
| `data/syllabusBlueprints/` | 🟡 ORPHANED | Contains only `physics.json` (939 bytes). Not referenced anywhere in codebase. |
| `data/syllabus/backup/` | 🟡 STALE BACKUP | Contains old, minimal syllabus JSONs. Should not be served by the API. |

**`data/syllabus/backup/` files** (all stale):
- `banking.json` (3.7 KB) — old minimal version
- `bpsc.json` (7.6 KB) — old minimal version  
- `railway.json` (2.7 KB) — old minimal version
- `ssc-cgl.json` (5.7 KB) — old minimal version
- `ssc-chsl.json` (3.6 KB) — old minimal version
- `state-pcs.json` (5 KB) — old minimal version
- `upsc.json` (18 KB) — old minimal version (current is 775 KB — much richer)

**Risk**: The `syllabus.js` route reads from `data/syllabus/` — if the `backup/` subdirectory is accidentally picked up, stale data would be served. Currently safe because `fs.readdirSync` only reads the top level.

---

## SECTION 3 — LEGACY SEEDER SCRIPTS

**Location**: `backend/scripts/`

These seeders have been superseded by newer versions or are no longer part of the seeding pipeline:

| File | Size | Verdict | Reason |
|---|---|---|---|
| `migrateContent.js` | 3.5 KB | 🟡 LEGACY | One-time migration utility. Migration already done. |
| `normalizeExistingContent.js` | 8.7 KB | 🟡 LEGACY | One-time normalization. Should be re-run only when needed. |
| `generateExpandedContent.js` | 69.9 KB | 🟡 LEGACY | AI content generator. Not in seeding pipeline. Large file. |
| `syllabusNormalizationAudit.js` | 3.6 KB | 🟡 LEGACY | Audit-only script, not part of active pipeline. |
| `coverageAudit.js` | 4.6 KB | 🟡 AUDIT TOOL | Useful for manual audit runs. Not in pipeline. |
| `list_db.js` | 0.8 KB | 🟡 AUDIT TOOL | Dev utility. Not in pipeline. |

---

## SECTION 4 — UNUSED ROOT-LEVEL SCRIPTS

**Location**: `/scripts/` (root-level, not `backend/scripts/`)

This directory contains **90+ scripts** — mostly load tests, chaos suites, phase tests, and certification scripts. None are referenced in `package.json` or `ecosystem.config.js`.

**Confirmed unused / one-time scripts**:

| Pattern | Examples | Count |
|---|---|---|
| Phase test scripts | `phase2_load_test.js` → `phase9_pwa_test.js` | 8 |
| Chaos suite scripts | `cbtChaosSuite.js`, `phase11ChaosSuite.js`, etc. | 6 |
| Certification scripts | `beta_certification.js`, `final_release_certification.js`, etc. | 8 |
| SRE/audit scripts | `sre_full_audit.js`, `forensicAudit.js`, etc. | 10 |
| Verify scripts | `verify_auth_runtime.js`, `verify_phase12_runtime.js`, etc. | 15 |
| Simulation scripts | `nationalDisasterSimulation.js`, `governanceAbuseSimulation.js` | 5 |
| Generator scripts | `generateCSQuestions.js`, `gen_cs_clean.js`, etc. | 6 |

**Total root `/scripts/` files**: 93
**Actively used by application**: 0
**Used during development/testing**: ~20 (load tests, verify scripts)
**Safe to archive**: ~70+

---

## SECTION 5 — ORPHANED ROOT-LEVEL MARKDOWN FILES

The project root contains **28+ report and documentation `.md` files** generated during development. These are not part of the application and should be archived or cleaned.

| File | Size | Purpose |
|---|---|---|
| `ACADEMIC_CERTIFICATION_REPORT.md` | 11 KB | One-time certification |
| `ACADEMIC_GAP_REPORT.md` | 5.6 KB | One-time audit |
| `CONTENT_ACTIVATION_REPORT.md` | 2.2 KB | One-time report |
| `CONTENT_ARCHITECTURE_MAP.md` | 6 KB | Architecture reference |
| `CONTENT_DENSITY_REPORT.md` | 2.2 KB | One-time audit |
| `CONTENT_GAP_REPORT.md` | 3.7 KB | One-time audit |
| `CONTENT_SOURCE_MAP.md` | 3.6 KB | Architecture reference |
| `DATABASE_SCHEMA.md` | 5.7 KB | Schema reference |
| `DEAD_CODE_REPORT.md` | 1.5 KB | One-time audit |
| `FINAL_PRODUCT_CERTIFICATION.md` | 11 KB | Certification |
| `FINAL_REBUILD_REPORT.md` | 4.7 KB | One-time report |
| `FINAL_VISUAL_CERTIFICATION.md` | 4.2 KB | Certification |
| `FOLDER_STRUCTURE.md` | 4.6 KB | Architecture reference |
| `NIRNAYPATH_FINAL_TRANSFORMATION_REPORT.md` | 4.9 KB | Report |
| `PRODUCT_COMPLETION_REPORT.md` | 5.2 KB | Report |
| `PRODUCT_EXPANSION_REPORT.md` | 9.7 KB | Report |
| `PRODUCT_FORENSIC_AUDIT.md` | 9.3 KB | Audit report |
| `PRODUCT_REALITY_AUDIT.md` | 14 KB | Audit report |
| `PROJECT_ARCHITECTURE.md` | 3.2 KB | Architecture reference |
| `PROJECT_FORENSIC_AUDIT.md` | 11 KB | Audit report |
| `REMOVAL_REPORT.md` | 2.5 KB | One-time report |
| `UI_AUDIT_REPORT.md` | 3.9 KB | UI audit |
| `VISUAL_AUDIT_REPORT.md` | 10 KB | Visual audit |
| `API_SPECIFICATION.md` | 7 KB | ✅ KEEP — API docs |
| `DATABASE_SCHEMA.md` | 5.7 KB | ✅ KEEP — Schema docs |
| `Readme.md` | 14 KB | ✅ KEEP — Project readme |
| `IMPLEMENTATION_ROADMAP.md` | 3.2 KB | ✅ KEEP — Active planning |

---

## SECTION 6 — APP-LEVEL UNUSED FILES

| File | Status | Notes |
|---|---|---|
| `app.js` (root-level) | 🟡 ORPHANED | Root `app.js` exists alongside `backend/app.js`. Appears to be an old or alternative entry point. Check if it's referenced anywhere. |
| `ecosystem.config.js` (root) | ✅ USED | PM2 config — actively used for deployment |
| `docker-compose.yml` | ✅ USED | Docker deployment config |
| `Dockerfile` | ✅ USED | Docker build config |

---

## RECOMMENDED CLEANUP ACTIONS

| Action | Priority | Target |
|---|---|---|
| Delete `data/questions/test.json` | 🔴 P0 | `data/questions/test.json` |
| Delete `data/questions/social_science.json` or expand to 100+ | 🟡 P2 | `data/questions/social_science.json` |
| Delete `data/content/` empty directory | 🟡 P2 | `data/content/` |
| Delete `data/syllabusBlueprints/` (orphaned) | 🟡 P2 | `data/syllabusBlueprints/` |
| Archive `data/syllabus/backup/` (do not delete yet) | 🟡 P2 | `data/syllabus/backup/` |
| Move root `/scripts/*.js` to `archive/` | 🟡 P3 | `scripts/*.js` (90 files) |
| Move old `.md` reports to `docs/archive/` | 🟡 P3 | Root `*.md` files (20+) |
| Review root `app.js` vs `backend/app.js` | 🟡 P2 | `app.js` (root) |
