#!/usr/bin/env bash
set -euo pipefail

#──────────────────────────────────────────────────────────────
# Portable E-Commerce Machine — White-Label Rebranding Script
#──────────────────────────────────────────────────────────────
# This script replaces all "Aanandini" / "aanandini" branding
# references with your own business name. It is safe to run
# multiple times (idempotent on the current brand name).
#──────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Portable E-Commerce Machine — Rebranding Tool     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Collect input ─────────────────────────────────────────────

read -rp "🏪 Business Name (e.g. MyShop): " BRAND_NAME
if [[ -z "$BRAND_NAME" ]]; then
    echo "❌ Business name cannot be empty."
    exit 1
fi

read -rp "📝 Tagline (e.g. Premium products for everyone): " TAGLINE
if [[ -z "$TAGLINE" ]]; then
    TAGLINE="Your one-stop shop"
fi

# ── Derive variants ──────────────────────────────────────────

# Lowercase slug (for package names, localStorage keys, etc.)
BRAND_SLUG=$(echo "$BRAND_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')

# Underscore slug (for localStorage keys)
BRAND_UNDERSCORE=$(echo "$BRAND_SLUG" | tr '-' '_')

echo ""
echo "📋 Summary:"
echo "   Brand Name:       $BRAND_NAME"
echo "   Tagline:          $TAGLINE"
echo "   Package scope:    @${BRAND_SLUG}/"
echo "   localStorage key: ${BRAND_UNDERSCORE}_token"
echo ""
read -rp "Continue? (y/N): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "🔄 Rebranding..."

# ── Helper function ──────────────────────────────────────────

replace_in_files() {
    local search="$1"
    local replace="$2"
    # Find matching files, excluding node_modules, .next, dist, .git
    find "$ROOT_DIR" \
        -type f \
        \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" -o -name "*.css" -o -name "*.sh" -o -name "*.prisma" \) \
        ! -path "*/node_modules/*" \
        ! -path "*/.next/*" \
        ! -path "*/dist/*" \
        ! -path "*/.git/*" \
        ! -path "*/scripts/rebrand.sh" \
        -exec grep -l "$search" {} \; 2>/dev/null | while read -r file; do
        if [[ "$(uname)" == "Darwin" ]]; then
            sed -i '' "s|${search}|${replace}|g" "$file"
        else
            sed -i "s|${search}|${replace}|g" "$file"
        fi
        echo "   ✏️  $file"
    done
}

# ── Execute replacements ─────────────────────────────────────

echo ""
echo "1/5 Replacing package scope @aanandini/ → @${BRAND_SLUG}/ ..."
replace_in_files "@aanandini/" "@${BRAND_SLUG}/"

echo ""
echo "2/5 Replacing display name 'Aanandini' → '${BRAND_NAME}' ..."
replace_in_files "Aanandini" "$BRAND_NAME"

echo ""
echo "3/5 Replacing localStorage keys 'aanandini_' → '${BRAND_UNDERSCORE}_' ..."
replace_in_files "aanandini_" "${BRAND_UNDERSCORE}_"

echo ""
echo "4/5 Replacing root package name 'aanandini' → '${BRAND_SLUG}' ..."
replace_in_files "\"aanandini\"" "\"${BRAND_SLUG}\""

echo ""
echo "5/5 Replacing JWT fallback secret ..."
replace_in_files "aanandini-secret-change-in-production" "${BRAND_SLUG}-secret-change-in-production"

# ── Update tagline in hero section ───────────────────────────

HERO_FILE="$ROOT_DIR/apps/web/src/app/page.tsx"
if [[ -f "$HERO_FILE" ]]; then
    echo ""
    echo "6/6 Updating tagline in hero section..."
    if [[ "$(uname)" == "Darwin" ]]; then
        sed -i '' "s|Curated collections of premium products delivered to your doorstep. Experience shopping.*|${TAGLINE}|g" "$HERO_FILE"
    else
        sed -i "s|Curated collections of premium products delivered to your doorstep. Experience shopping.*|${TAGLINE}|g" "$HERO_FILE"
    fi
    echo "   ✏️  $HERO_FILE"
fi

echo ""
echo "✅ Rebranding complete!"
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Manual Steps Remaining:                            ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║                                                     ║"
echo "║  1. Replace the logo letter 'A' in:                 ║"
echo "║     • apps/web/src/components/header.tsx             ║"
echo "║     • apps/web/src/components/footer.tsx             ║"
echo "║     • apps/web/src/app/login/page.tsx                ║"
echo "║     • apps/admin/src/components/admin-shell.tsx       ║"
echo "║     • apps/admin/src/app/login/page.tsx              ║"
echo "║                                                     ║"
echo "║  2. Add a favicon:                                  ║"
echo "║     • apps/web/src/app/favicon.ico                   ║"
echo "║     • apps/admin/src/app/favicon.ico                 ║"
echo "║                                                     ║"
echo "║  3. Update brand colors in:                         ║"
echo "║     • apps/web/tailwind.config.js                    ║"
echo "║     • apps/admin/tailwind.config.js                  ║"
echo "║                                                     ║"
echo "║  4. Update the database name in:                    ║"
echo "║     • .env / .env.example (DATABASE_URL)             ║"
echo "║     • docker-compose.yml                             ║"
echo "║                                                     ║"
echo "║  5. Re-install dependencies:                        ║"
echo "║     rm -rf node_modules package-lock.json            ║"
echo "║     npm install                                      ║"
echo "║                                                     ║"
echo "╚══════════════════════════════════════════════════════╝"
