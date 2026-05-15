@echo off
title CUMPLE - Iniciar Sistema Completo
echo ============================================
echo     Iniciando Sistema CUMPLE Completo
echo ============================================
echo.
echo Este script iniciará todos los componentes de CUMPLE:
echo 1. Agent-Zero (backend inteligente)
echo 2. Aplicación Frontend (Vite)
echo.

rem Verificar si los scripts necesarios existen
if not exist agent_zero_startup.bat (
    echo ERROR: No se encuentra agent_zero_startup.bat
    pause
    exit /b 1
)

if not exist start_vite.bat (
    echo ERROR: No se encuentra start_vite.bat
    pause
    exit /b 1
)

echo Iniciando Agent-Zero en segundo plano...
start cmd /c agent_zero_startup.bat

echo Esperando 5 segundos para que Agent-Zero se inicialice...
timeout /t 5 /nobreak > nul

echo Iniciando aplicación frontend...
start cmd /c start_vite.bat

echo.
echo Ambos componentes se han iniciado en ventanas separadas.
echo Para detener CUMPLE, cierra ambas ventanas.
echo.
echo ¡CUMPLE está listo para usar!
echo Abre tu navegador en http://localhost:5173
echo.
pause 