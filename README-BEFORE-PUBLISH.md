# ⚠️ READ THIS BEFORE EVERY NPM PUBLISH

## THE RULE:

**BEFORE running `npm publish`, you MUST run:**

```bash
bash PRE-PUBLISH-CHECK.sh
```

**If it fails: DO NOT PUBLISH until you fix the issues.**

---

## Why This Exists:

### Mistakes Made:
1. **v2.5.6-8:** Added HTTP during startup → broke Claude Desktop
2. **v2.5.10:** Used old broken code → broke again  
3. **v2.6.0:** Didn't check initWordPress() → broke AGAIN

### The Pattern:
- I read the warnings
- I check MY changes
- **I DON'T check the ENTIRE startup flow**
- I publish
- **IT BREAKS**

---

## The Checklist:

The `PRE-PUBLISH-CHECK.sh` script checks:

1. ✅ Latest published version (in case another agent fixed something)
2. ✅ Recent commits for "CRITICAL FIX" messages
3. ✅ HTTP requests in `server.ts` startup
4. ✅ HTTP requests in `initWordPress()` function
5. ✅ Async tool loading (forbidden)
6. ✅ Opt-out HTTP patterns (should be opt-in)
7. ✅ Build succeeds

**If ANY check fails: The script exits with error code 1.**

---

## How to Use:

### Every Time Before Publishing:

```bash
# 1. Make your changes
# 2. Commit them
git add -A
git commit -m "Your changes"

# 3. Run the pre-publish check
bash PRE-PUBLISH-CHECK.sh

# 4. If it passes, THEN publish
npm publish

# 5. Push to git
git push origin main
```

### If the Check Fails:

**DO NOT PUBLISH.**

Read the error messages and fix the issues first.

---

## The Questions You Must Answer:

Even if the script passes, answer these OUT LOUD:

1. **"Have I read ALL files in the fucking-idiot folder?"**
   - If NO: Go read them now

2. **"Have I tested with multiple servers?"**
   - If NO: Test before publishing

3. **"Am I 100% certain this won't break Claude Desktop?"**
   - If NO: Don't publish

---

## The Commitment:

**I WILL NOT publish to npm without running this check.**

**If I break it again, I'm not learning.**

**This is the THIRD time. There should NOT be a fourth.**

---

**Last Updated:** January 1, 2026  
**Violations:** 3 (v2.5.6-8, v2.5.10, v2.6.0)  
**Target:** 0 violations going forward

