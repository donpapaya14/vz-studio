#!/bin/bash
# Guía semanal de vzstudio.dev. La lanza launchd los lunes; si el Mac estaba
# apagado, se ejecuta al encenderlo.
#
# NUNCA toca master ni publica sola: escribe en una rama guias/AAAA-MM-DD y
# ahí se queda. Vladys la revisa, la fusiona y la sube. Una guía mala indexada
# cuesta más que una semana sin guía.
#
#   bash bin/publicar-guia.sh          pasada normal
#   DRY_RUN=1 bash bin/publicar-guia.sh   todo menos llamar a Claude y crear rama
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG="$DIR/logs/$(date +%Y-%m).log"
HOY="$(date +%F)"
SEMANA="$(date +%G-W%V)"
RAMA="guias/$HOY"
: "${DRY_RUN:=0}"
mkdir -p "$DIR/logs"

export PATH="/Users/vladys/.nvm/versions/node/v24.12.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

log() { echo "[$(date +%FT%T)] $*" >> "$LOG"; }
morir() { log "FALLO: $*"; exit 1; }

# Idempotencia por semana ISO: aunque launchd dispare varias veces (lunes +
# reintentos), solo se escribe una guía por semana.
MARCA="$DIR/logs/.ultima_guia"
if [ -f "$MARCA" ] && [ "$(cat "$MARCA")" = "$SEMANA" ]; then
  log "ya hay guía de la semana $SEMANA, salgo"
  exit 0
fi

log "=== pasada $HOY (semana $SEMANA, DRY_RUN=$DRY_RUN) ==="

cd "$DIR" || morir "no puedo entrar en $DIR"
command -v git >/dev/null || morir "sin git en el PATH"
command -v node >/dev/null || morir "sin node en el PATH"

# Un árbol sucio significa que Vladys está trabajando aquí: no nos metemos.
if [ -n "$(git status --porcelain)" ]; then
  morir "el repositorio tiene cambios sin guardar, no toco nada"
fi

RAMA_ORIGEN="$(git rev-parse --abbrev-ref HEAD)"
if [ "$RAMA_ORIGEN" != "master" ]; then
  morir "estoy en la rama $RAMA_ORIGEN y no en master, no toco nada"
fi

# La red puede no estar lista: launchd dispara nada más despertar el Mac.
source "$DIR/bin/lib_red.sh"
if ! INTENTOS="$(esperar_red)"; then
  log "sin red tras $INTENTOS intento(s): salgo, se reintenta en la siguiente pasada"
  exit 1
fi
[ "$INTENTOS" -gt 0 ] && log "red lista tras $INTENTOS reintento(s)"

ANTES="$(ls "$DIR/contenido/guias"/*.md 2>/dev/null | wc -l | tr -d ' ')"
log "guías publicadas antes de la pasada: $ANTES"

if [ "$DRY_RUN" = "1" ]; then
  log "DRY_RUN: no llamo a Claude ni creo rama. Compruebo que el build y el verificador pasan."
  node bin/construir.mjs >> "$LOG" 2>&1 || morir "construir.mjs falla ya antes de escribir nada"
  node bin/verificar.mjs >> "$LOG" 2>&1 || morir "verificar.mjs falla ya antes de escribir nada"
  git checkout -- . 2>/dev/null
  log "=== DRY_RUN ok ==="
  exit 0
fi

command -v claude >/dev/null || morir "sin claude en el PATH"

git checkout -b "$RAMA" >> "$LOG" 2>&1 || morir "no pude crear la rama $RAMA"
log "rama $RAMA creada"

# La sesión escribe en contenido/ y ejecuta el build y el verificador. No tiene
# permiso de git: lo que se commitea lo decide este script, no el modelo.
PROMPT="$(cat "$DIR/bin/prompt-guia.md")

Hoy es $HOY. El repositorio es $DIR y ya estás dentro."

if ! echo "$PROMPT" | claude -p \
      --allowedTools "Read" "Glob" "Grep" "Write" "Edit" "Bash(node bin/construir.mjs)" "Bash(node bin/verificar.mjs)" \
      --permission-mode acceptEdits >> "$LOG" 2>&1; then
  log "la sesión de Claude falló"
  git checkout master >> "$LOG" 2>&1
  git branch -D "$RAMA" >> "$LOG" 2>&1
  morir "sesión fallida, rama $RAMA descartada"
fi

DESPUES="$(ls "$DIR/contenido/guias"/*.md 2>/dev/null | wc -l | tr -d ' ')"
if [ "$DESPUES" -le "$ANTES" ]; then
  log "no hay guía nueva ($ANTES → $DESPUES)"
  git checkout -- . >> "$LOG" 2>&1
  git clean -fd >> "$LOG" 2>&1
  git checkout master >> "$LOG" 2>&1
  git branch -D "$RAMA" >> "$LOG" 2>&1
  morir "la sesión no escribió ninguna guía, rama descartada"
fi

# Puertas: si algo de esto falla, la rama se queda sin commit y se avisa.
node bin/construir.mjs >> "$LOG" 2>&1 || morir "construir.mjs falló, rama $RAMA sin commitear"
node bin/verificar.mjs >> "$LOG" 2>&1 || morir "verificar.mjs falló, rama $RAMA sin commitear"
npx vitest run >> "$LOG" 2>&1 || morir "los tests fallan, rama $RAMA sin commitear"

NUEVA="$(git status --porcelain contenido/guias | awk '/^\?\?|^ M|^A/ {print $2}' | head -1)"
git add -A >> "$LOG" 2>&1
git commit -q -m "contenido: guía semanal $HOY

Generada por bin/publicar-guia.sh. Sin revisar: rama $RAMA, no fusionar
sin leerla entera." >> "$LOG" 2>&1 || morir "el commit falló"

git checkout master >> "$LOG" 2>&1 || log "AVISO: no pude volver a master"
echo "$SEMANA" > "$MARCA"

log "guía lista en la rama $RAMA ($NUEVA). Pendiente de revisar y fusionar."
log "=== fin ok ==="

# Aviso visible en el escritorio: sin esto, la rama se queda ahí semanas.
/usr/bin/osascript -e "display notification \"Guía nueva en la rama $RAMA. Revísala antes de fusionar.\" with title \"VZ Studio\"" 2>/dev/null

echo "guía generada en la rama $RAMA — revísala con: git log -p $RAMA -1"
