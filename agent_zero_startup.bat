@echo off
title Iniciar Agent-Zero para CUMPLE
echo ============================================
echo     Inicializando Agent-Zero para CUMPLE
echo ============================================
echo.
echo Este script iniciará el servicio de Agent-Zero necesario para 
echo las funcionalidades avanzadas de CUMPLE.
echo.

rem Verificar si Python está instalado
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python no está instalado o no está en el PATH.
    echo Por favor instala Python 3.8 o superior.
    pause
    exit /b 1
)

rem Cambiar al directorio de Agent-Zero
cd /d "%~dp0agent-zero"

rem Verificar si existe el archivo .env
if not exist .env (
    echo Creando archivo .env desde example.env...
    copy example.env .env
    echo Archivo .env creado. Por favor edítalo para configurar tus claves API.
)

rem Instalar dependencias esenciales si no están ya instaladas
echo Instalando dependencias esenciales...
pip install flask flask-basicauth werkzeug google-generativeai

rem Mensaje para el usuario
echo.
echo Iniciando Agent-Zero...
echo Este proceso se ejecutará en esta ventana.
echo Por favor, NO cierre esta ventana mientras usa CUMPLE.
echo.
echo Presione Ctrl+C para detener el servicio cuando termine de usar CUMPLE.
echo.

rem Iniciar Agent-Zero
python startup.py

echo.
echo Agent-Zero se ha detenido.
pause 