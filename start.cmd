@echo off
title CUMPLE - Iniciador Simple
echo =============================================
echo     CUMPLE - Sistema de Gestion de Eventos
echo =============================================
echo.
echo Este script iniciara los componentes de CUMPLE
echo.
echo Tienes dos opciones:
echo.
echo 1. Iniciar Agent-Zero (backend)
echo 2. Iniciar Frontend (Vite)
echo.
echo Debes iniciar ambos componentes para usar CUMPLE completamente.
echo.

:menu
set /p opcion="Elige una opcion (1 o 2, o escribe 'ambos'): "

if "%opcion%"=="1" goto agent_zero
if "%opcion%"=="2" goto frontend
if /i "%opcion%"=="ambos" goto both
echo Opcion no valida. Por favor, elige 1, 2 o escribe 'ambos'.
goto menu

:agent_zero
echo.
echo Iniciando Agent-Zero...
cd agent-zero
start cmd /k python startup.py
cd ..
echo Agent-Zero iniciado. No cierres esa ventana mientras uses CUMPLE.
echo.
goto end

:frontend
echo.
echo Iniciando frontend de CUMPLE...
start cmd /k npx vite
echo Frontend iniciado. No cierres esa ventana mientras uses CUMPLE.
echo.
goto end

:both
echo.
echo Iniciando Agent-Zero...
cd agent-zero
start cmd /k python startup.py
cd ..
echo Agent-Zero iniciado.
echo.
timeout /t 3 /nobreak > nul
echo Iniciando frontend de CUMPLE...
start cmd /k npx vite
echo Frontend iniciado.
echo.
echo Ambos componentes iniciados. No cierres esas ventanas mientras uses CUMPLE.
echo CUMPLE estara disponible en: http://localhost:5173
echo.

:end
echo.
echo Si ves mensajes de error en la consola, no te preocupes.
echo La aplicacion funcionara en modo fallback automaticamente.
echo.
pause 