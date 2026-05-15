@echo off
title Iniciar CUMPLE Frontend
echo ============================================
echo     Inicializando Frontend de CUMPLE
echo ============================================
echo.
echo Este script iniciará la aplicación frontend de CUMPLE.
echo.

rem Verificar si Node.js está instalado
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no está instalado o no está en el PATH.
    echo Por favor instala Node.js 16 o superior.
    pause
    exit /b 1
)

echo Iniciando aplicación Vite...
echo Este proceso se ejecutará en esta ventana.
echo Por favor, NO cierre esta ventana mientras usa CUMPLE.
echo.
echo Presione Ctrl+C para detener el servicio cuando termine de usar CUMPLE.
echo.

rem Iniciar aplicación Vite
npx vite

echo.
echo La aplicación se ha detenido.
pause 