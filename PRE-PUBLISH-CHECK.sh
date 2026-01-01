#!/bin/bash
# MANDATORY PRE-PUBLISH CHECK
# Run this BEFORE every npm publish
# If ANY check fails: DO NOT PUBLISH

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         CRITICAL PRE-PUBLISH CHECKLIST - v2.6.1+              ║"
echo "║         DO NOT SKIP ANY STEP OR YOU WILL BREAK IT             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

FAILED=0

# Check 1: Latest Version
echo "📋 CHECK 1: Latest Published Version"
PUBLISHED=$(npm view @wplaunchify/ml-mcp-server version 2>/dev/null)
LOCAL=$(cat package.json | grep '"version"' | cut -d'"' -f4)
echo "   Published: $PUBLISHED"
echo "   Local:     $LOCAL"
if [[ "$PUBLISHED" > "$LOCAL" ]]; then
    echo "   ❌ FAIL: Published version is NEWER than local!"
    echo "   ACTION: Check what was fixed in $PUBLISHED before proceeding"
    FAILED=1
else
    echo "   ✅ PASS"
fi
echo ""

# Check 2: Recent Commits
echo "📋 CHECK 2: Recent Commits (check for other agents' fixes)"
git log --oneline -5 | grep -i "CRITICAL\|FIX" && echo "   ⚠️  WARNING: Recent fixes found - read them!" || echo "   ✅ No critical fixes in recent commits"
echo ""

# Check 3: HTTP in server.ts startup
echo "📋 CHECK 3: HTTP Requests in server.ts Startup"
if grep -n "await.*init\|await.*Request\|await axios\|await fetch" src/server.ts | grep -v "//"; then
    echo "   ❌ FAIL: Found HTTP-related await in server.ts startup"
    FAILED=1
else
    echo "   ✅ PASS: No HTTP in server.ts startup"
fi
echo ""

# Check 4: initWordPress function
echo "📋 CHECK 4: HTTP in initWordPress() Function"
echo "   Checking for HTTP calls in initWordPress..."
if grep -A 100 "export async function initWordPress" src/wordpress.ts | grep "await wpClient\|await axios\|await fetch" | grep -v "if.*VERIFY_CONNECTION_ON_STARTUP"; then
    echo "   ❌ FAIL: Found HTTP calls in initWordPress that aren't opt-in!"
    echo "   HTTP during startup MUST be behind: if (process.env.VERIFY_CONNECTION_ON_STARTUP === 'true')"
    FAILED=1
else
    echo "   ✅ PASS: No unconditional HTTP in initWordPress"
fi
echo ""

# Check 5: Async tool loading
echo "📋 CHECK 5: Async Tool Loading (FORBIDDEN)"
if grep -n "export const.*await\|async.*getTools.*=\|await.*detect" src/tools/index.ts; then
    echo "   ❌ FAIL: Found async tool loading!"
    FAILED=1
else
    echo "   ✅ PASS: All tool loading is synchronous"
fi
echo ""

# Check 6: Opt-out HTTP patterns
echo "📋 CHECK 6: Opt-Out HTTP Patterns (FORBIDDEN)"
if grep -B 5 "await wpClient\|await axios" src/wordpress.ts | grep "if (!.*skip\|if (!.*disable)"; then
    echo "   ❌ FAIL: Found OPT-OUT HTTP pattern (should be OPT-IN)"
    echo "   Use: if (process.env.ENABLE_FEATURE === 'true') not if (!skipFeature)"
    FAILED=1
else
    echo "   ✅ PASS: No opt-out HTTP patterns found"
fi
echo ""

# Check 7: Build test
echo "📋 CHECK 7: Build Test"
if npm run build > /dev/null 2>&1; then
    echo "   ✅ PASS: Build successful"
else
    echo "   ❌ FAIL: Build failed!"
    FAILED=1
fi
echo ""

# Final verdict
echo "╔════════════════════════════════════════════════════════════════╗"
if [ $FAILED -eq 0 ]; then
    echo "║  ✅ ALL CHECKS PASSED - Safe to publish                       ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "BEFORE YOU PUBLISH, ANSWER THESE OUT LOUD:"
    echo "1. Have I read ALL files in fucking-idiot folder? (Y/N)"
    echo "2. Have I tested with multiple servers? (Y/N)"
    echo "3. Am I 100% certain this won't break Claude Desktop? (Y/N)"
    echo ""
    echo "If ALL answers are YES, you may proceed with:"
    echo "  npm publish"
    exit 0
else
    echo "║  ❌ CHECKS FAILED - DO NOT PUBLISH                            ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Fix the issues above before publishing."
    exit 1
fi

