#!/usr/bin/env bash
# Session End hook — saves session timestamp and metadata
# Receives session JSON on stdin

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('session_id','unknown'))" 2>/dev/null || echo "unknown")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MEMORY_DIR="$HOME/.claude/projects/C--Users----/memory/"

# Write last session info
cat > "$MEMORY_DIR/last-session.json" <<EOF
{
  "sessionId": "$SESSION_ID",
  "endedAt": "$TIMESTAMP"
}
EOF

# Touch a marker file so SessionStart knows there's prior state
touch "$MEMORY_DIR/.last-session-marker"

echo "[session-save] Session $SESSION_ID recorded at $TIMESTAMP"
