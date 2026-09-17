#!/bin/bash
# Espera a que la red este lista antes de la pasada. Copiado de coach-vladys:
# mismo problema, misma solucion.
#
# Por que: launchd despierta el Mac y dispara el job en el acto, pero el WiFi
# tarda unos segundos en asociar y resolver DNS. El primer intento sale con
# "nodename nor servname provided" y, sin reintento, el dia se queda sin informe
# (paso el 2026-09-15 a las 10:08).
#
# Configurable por entorno para poder probarlo sin red real.

: "${VZ_NET_CHECK:=curl -sSf -m 5 -o /dev/null https://api.anthropic.com/v1}"
: "${VZ_NET_ESPERA:=600}"   # segundos maximos esperando a la red
: "${VZ_NET_PAUSA:=15}"     # segundos entre intentos

# esperar_red: imprime el numero de reintentos. 0 = hay red, 1 = espera agotada.
esperar_red() {
  local fin=$(( $(date +%s) + VZ_NET_ESPERA ))
  local intentos=0
  while true; do
    if eval "$COACH_NET_CHECK" >/dev/null 2>&1; then
      echo "$intentos"
      return 0
    fi
    intentos=$((intentos + 1))
    if [ "$(date +%s)" -ge "$fin" ]; then
      echo "$intentos"
      return 1
    fi
    sleep "$VZ_NET_PAUSA"
  done
}
