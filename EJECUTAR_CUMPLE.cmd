@echo off
title CUMPLE - Iniciar con un clic
echo.
echo =============================================
echo     CUMPLE - Sistema de Gestión de Eventos
echo =============================================
echo.
echo Iniciando CUMPLE...
echo.
echo Este script ejecutará PowerShell para iniciar todos los componentes.
echo.
echo Si ves algún mensaje de seguridad de PowerShell, por favor permite la ejecución.
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

:: Ejecutar el script de PowerShell
powershell -ExecutionPolicy Bypass -File "%~dp0iniciar_todo.ps1"

echo.
echo Si el sistema no se inició correctamente, prueba estos pasos:
echo 1. Abre PowerShell como administrador
echo 2. Ejecuta: Set-ExecutionPolicy RemoteSigned
echo 3. Vuelve a intentar ejecutar este script
echo.
pause 