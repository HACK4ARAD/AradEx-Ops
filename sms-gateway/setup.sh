#!/usr/bin/env bash
# T24 · pornește gateway-ul de SMS pe acest Mac (codurile OTP pleacă de pe iPhone-ul tău, prin aplicația Mesaje).
#   ./setup.sh             token nou → Keychain + AWS (aradex/sms-gateway) → repornește API-ul → pornește gateway-ul (launchd)
#   ./setup.sh --restart   doar repornește gateway-ul (după o actualizare a scriptului)
#   ./setup.sh --stop      oprește gateway-ul și pune tokenul gol în AWS (codurile reale trec înapoi pe Twilio / 503)
# Tokenul nu apare pe ecran, în fișiere sau în argumentele vreunui proces.
# Înainte: iPhone › Setări › Mesaje › Redirecționare mesaje text › acest Mac; testul: node gateway.mjs --test +40…
set -euo pipefail
export AWS_PROFILE="${AWS_PROFILE:-aws-toolkit}" AWS_REGION=eu-north-1
DIR="$(cd "$(dirname "$0")" && pwd)"
LABEL=ro.aradexperience.sms-gateway
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/aradex-sms-gateway.log"
NODE="$(command -v node)"

stop_agent() { launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true; }
start_agent() {
  mkdir -p "$(dirname "$PLIST")" "$(dirname "$LOG")"
  cat >"$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>$NODE</string><string>$DIR/gateway.mjs</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>10</integer>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict></plist>
PLIST
  stop_agent
  launchctl bootstrap "gui/$(id -u)" "$PLIST"
  echo "Gateway-ul rulează. Jurnal: tail -f $LOG"
}
restart_api() {
  aws ecs update-service --cluster aradex --service aradex-api --force-new-deployment >/dev/null
  echo "API-ul repornește (1-3 minute) ca să citească tokenul."
}
put_token() { # $1 = token (gol = gateway oprit)
  TOKEN="$1" python3 -c 'import json,os;print(json.dumps({"token":os.environ["TOKEN"]}))' \
    | aws secretsmanager put-secret-value --secret-id aradex/sms-gateway --secret-string file:///dev/stdin >/dev/null
}

case "${1:-}" in
  --restart) start_agent; exit 0 ;;
  --stop)
    stop_agent; rm -f "$PLIST"
    put_token ""
    restart_api
    echo "Gateway oprit; codurile reale merg din nou prin Twilio (sau 503 fără chei Twilio)."
    exit 0 ;;
esac

[[ -n "$NODE" ]] || { echo "Lipsește node (brew install node)." >&2; exit 1; }
aws sts get-caller-identity >/dev/null || { echo "AWS: nu ești conectat cu profilul $AWS_PROFILE." >&2; exit 1; }

TOKEN="$(openssl rand -hex 32)"
# Keychain prin `security -i` (comanda vine pe stdin, nu în argumente)
printf 'add-generic-password -U -s aradex-sms-gateway -a gateway -w %s\n' "$TOKEN" | security -i >/dev/null
put_token "$TOKEN"
unset TOKEN
echo "Token nou: salvat în Keychain și în aradex/sms-gateway."
restart_api
start_agent
echo "Prima dată macOS întreabă dacă node are voie să controleze Mesaje: alege Permite."
