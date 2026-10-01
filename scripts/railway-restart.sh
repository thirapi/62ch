#!/usr/bin/env bash
set -euo pipefail

# Railway Service Auto-Restart Script
# Restarts the latest active deployment(s) daily via Railway Public GraphQL API
# to prevent memory bloat (restart = NO rebuild, fast & doesn't consume builds)
#
# Usage: ./scripts/railway-restart.sh [--help]
#
# API docs: https://docs.railway.com/integrations/api/manage-deployments
#   - Query  : deployments(input: { projectId, serviceId, environmentId }) → latest deployment id
#   - Mutation: deploymentRestart(id) → restarts without rebuild
#
# Cron example (every day at 03:00 WIB on your VPS):
#   0 3 * * * /path/to/exantara-saas/scripts/railway-restart.sh >> /var/log/railway-restart.log 2>&1

# ─── Configuration ───────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RAILWAY_API_URL="https://backboard.railway.com/graphql/v2"
CURL_TIMEOUT=30
MAX_RETRIES=2
RETRY_DELAY=5

# Source environment variables from scripts/.env.railway
# Strips CRLF line endings before sourcing (safe for files edited on Windows)
RAILWAY_ENV="${SCRIPT_DIR}/.env.railway"
if [[ -f "$RAILWAY_ENV" ]]; then
    _CLEAN_ENV=$(mktemp)
    tr -d '\r' < "$RAILWAY_ENV" > "$_CLEAN_ENV"
    set -a
    # shellcheck disable=SC1090
    source "$_CLEAN_ENV"
    set +a
    rm -f "$_CLEAN_ENV"
fi

# Required:
#   RAILWAY_TOKEN     Workspace token (recommended) from https://railway.com/account/tokens
#   PROJECT_ID        Project ID      (Ctrl/Cmd+K → Copy Project ID in dashboard)
#   ENVIRONMENT_ID    Environment ID  (usually production)
# Optional:
#   SERVICES          Comma-separated service IDs to restart (default: all services in project)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

while [[ $# -gt 0 ]]; do
    case "$1" in
        --help|-h)
            echo "Usage: $0 [--help]"
            echo ""
            echo "Restarts the latest active Railway deployment(s) without rebuilding."
            echo ""
            echo "Required environment variables (in scripts/.env.railway or exported):"
            echo "  RAILWAY_TOKEN     Workspace token from https://railway.com/account/tokens"
            echo "  PROJECT_ID        Railway project ID"
            echo "  ENVIRONMENT_ID    Railway environment ID (e.g. production)"
            echo ""
            echo "Optional:"
            echo "  SERVICES          Comma-separated service IDs (default: all services)"
            echo ""
            echo "How to get IDs: open project in Railway dashboard → Ctrl/Cmd+K → copy IDs,"
            echo "or from URL: https://railway.com/project/<PROJECT_ID>/service/<SERVICE_ID>?environmentId=<ENV_ID>"
            exit 0
            ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# ─── Helper Functions ────────────────────────────────────────────────────────

log()     { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓${NC} $1"; }
warn()    { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠${NC} $1"; }
error()   { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ✗${NC} $1"; }

# Generic GraphQL call with retry. Args: $1 = query/mutation JSON payload
graphql_call() {
    local payload="$1"
    local attempt=1
    local response=""

    while [[ $attempt -le $MAX_RETRIES ]]; do
        if response=$(curl -sS --fail-with-body \
            --max-time "$CURL_TIMEOUT" \
            --request POST \
            --url "$RAILWAY_API_URL" \
            --header "Authorization: Bearer ${RAILWAY_TOKEN}" \
            --header 'Content-Type: application/json' \
            --data "$payload" 2>&1); then
            # Check for GraphQL-level errors
            if echo "$response" | jq -e '.errors' >/dev/null 2>&1; then
                warn "GraphQL error (attempt ${attempt}/${MAX_RETRIES}): $(echo "$response" | jq -c '.errors')"
                attempt=$((attempt + 1))
                sleep "$RETRY_DELAY"
                continue
            fi
            echo "$response"
            return 0
        fi
        warn "Request failed (attempt ${attempt}/${MAX_RETRIES}): ${response}"
        attempt=$((attempt + 1))
        sleep "$RETRY_DELAY"
    done

    error "All ${MAX_RETRIES} attempts failed"
    return 1
}

# ─── Prerequisites Check ─────────────────────────────────────────────────────

check_prerequisites() {
    log "Checking prerequisites..."

    local missing=()
    command -v curl >/dev/null 2>&1 || missing+=("curl")
    command -v jq >/dev/null 2>&1 || missing+=("jq")

    if [[ ${#missing[@]} -gt 0 ]]; then
        error "Missing required tools: ${missing[*]}"
        error "Install them with: apt-get install -y curl jq  (or yum/dnf equivalent)"
        exit 1
    fi

    local missing_vars=()
    [[ -z "${RAILWAY_TOKEN:-}" ]] && missing_vars+=("RAILWAY_TOKEN")
    [[ -z "${PROJECT_ID:-}" ]] && missing_vars+=("PROJECT_ID")
    [[ -z "${ENVIRONMENT_ID:-}" ]] && missing_vars+=("ENVIRONMENT_ID")

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        error "Missing environment variables: ${missing_vars[*]}"
        error "Set them in ${RAILWAY_ENV} (see scripts/.env.railway.example) or export them before running"
        exit 1
    fi

    success "All prerequisites satisfied"
}

# ─── Resolve Service List ────────────────────────────────────────────────────

resolve_services() {
    if [[ -n "${SERVICES:-}" ]]; then
        # Use explicitly configured service IDs (comma-separated)
        SERVICE_LIST=$(echo "$SERVICES" | tr ',' '\n' | tr -d ' ')
        log "Using configured services: $(echo "$SERVICE_LIST" | tr '\n' ' ')"
        return 0
    fi

    # Otherwise discover all services in the project via API
    log "SERVICES not set — discovering all services in project..."
    local query='{"query":"query { project(id: \"'"$PROJECT_ID"'\") { services { edges { node { id name } } } } }"}'
    local response
    response=$(graphql_call "$query") || return 1

    SERVICE_LIST=$(echo "$response" | jq -r '.data.project.services.edges[].node.id')
    local names
    names=$(echo "$response" | jq -r '[.data.project.services.edges[].node.name] | join(", ")')
    [[ -z "$SERVICE_LIST" ]] && { error "No services found in project ${PROJECT_ID}"; return 1; }

    log "Found services: ${names}"
}

# ─── Restart Service ─────────────────────────────────────────────────────────

restart_service() {
    local service_id="$1"

    # Step 1: Get latest successful deployment ID for this service
    local query='{"query":"query deployments($input: DeploymentListInput!) { deployments(input: $input, first: 1) { edges { node { id status createdAt } } } }","variables":{"input":{"projectId":"'"$PROJECT_ID"'","serviceId":"'"$service_id"'","environmentId":"'"$ENVIRONMENT_ID"'","status":{"successfulOnly":true}}}}'

    local response
    response=$(graphql_call "$query") || return 1

    local deployment_id created_at
    deployment_id=$(echo "$response" | jq -r '.data.deployments.edges[0].node.id // empty')
    created_at=$(echo "$response" | jq -r '.data.deployments.edges[0].node.createdAt // empty')

    if [[ -z "$deployment_id" ]]; then
        warn "Service ${service_id}: no successful deployment found — skipping"
        return 1
    fi

    log "Service ${service_id}: latest deployment ${deployment_id} (created ${created_at})"

    # Step 2: Restart it (no rebuild)
    local mutation='{"query":"mutation deploymentRestart($id: String!) { deploymentRestart(id: $id) }","variables":{"id":"'"$deployment_id"'"}}'
    response=$(graphql_call "$mutation") || return 1

    success "Service ${service_id}: restart triggered for deployment ${deployment_id}"
}

# ─── Main ────────────────────────────────────────────────────────────────────

main() {
    echo ""
    log "=== Railway Daily Service Restart ==="
    echo ""

    check_prerequisites
    resolve_services || exit 1

    echo ""
    local failed=0
    local total=0

    while IFS= read -r service_id; do
        [[ -z "$service_id" ]] && continue
        total=$((total + 1))
        restart_service "$service_id" || failed=$((failed + 1))
        sleep 2  # Be gentle with rate limits
    done <<< "$SERVICE_LIST"

    echo ""
    if [[ $failed -eq 0 ]]; then
        success "=== All ${total} service(s) restarted successfully ==="
    else
        error "=== ${failed}/${total} service(s) FAILED to restart ==="
        exit 1
    fi
    echo ""
}

main "$@"
