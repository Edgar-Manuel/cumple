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

echo Limpiando cache de npm...
call npm cache clean --force
echo.

echo Ejecutando npm install para asegurar que todas las dependencias estén instaladas...
call npm install
echo.

echo Verificando si existe el archivo .env...
if not exist .env (
    echo Creando archivo .env con configuraciones básicas...
    echo VITE_SUPABASE_URL=https://hgwwcootwuhqeiirmfkg.supabase.co>.env
    echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnd3djb290d3VocWVpaXJtZmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODExNTYsImV4cCI6MjA1Njc1NzE1Nn0.JXnF6HQRfno4kjqksUZCTCB-e7_pzh8HOyiEOMXBB1w>>.env
)

echo Iniciando aplicación Vite...
echo.
echo La aplicación estará disponible en:
echo - Local: http://localhost:8080
echo - Red local: Usa la URL que se mostrará a continuación
echo.
echo Por favor, NO cierre esta ventana mientras usa CUMPLE.
echo.
echo Nota: Si ves errores relacionados con WebSocket o 0.0.0.0, 
echo ignóralos y usa la URL local (localhost) o la IP de red que
echo muestra Vite en la consola.
echo.
echo Presione Ctrl+C para detener el servicio cuando termine de usar CUMPLE.
echo.

rem Usar --debug para obtener más información sobre posibles errores
call npx vite --port 8080 --host 0.0.0.0 --debug

echo.
echo La aplicación se ha detenido.
pause 