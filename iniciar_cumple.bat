@echo off
echo ======================================
echo      Iniciando CUMPLE
echo ======================================
echo.

echo Verificando dependencias...
npm install

echo.
echo Comprobando si Agent-Zero está en ejecución...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/health' -Method GET -TimeoutSec 3; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"

if %errorlevel% neq 0 (
    echo.
    echo ADVERTENCIA: Agent-Zero no parece estar en ejecución.
    echo Para obtener todas las funcionalidades, deberías iniciar Agent-Zero primero.
    echo.
    echo ¿Deseas continuar de todos modos? CUMPLE funcionará en modo limitado.
    echo Presiona S para continuar o N para cancelar e iniciar Agent-Zero primero.
    
    choice /C SN /M "¿Continuar sin Agent-Zero?"
    if %errorlevel% equ 2 (
        echo.
        echo Iniciando Agent-Zero primero...
        start cmd /k "iniciar_agent_zero.bat"
        echo Espera 10 segundos para que Agent-Zero se inicie...
        timeout /t 10 /nobreak > nul
    ) else (
        echo.
        echo Continuando en modo limitado...
    )
) else (
    echo Agent-Zero está funcionando correctamente.
)

echo.
echo Iniciando aplicación CUMPLE...
echo.
echo La aplicación estará disponible en http://localhost:3000 o http://localhost:8080
echo.
echo IMPORTANTE: Para que todas las funcionalidades estén disponibles,
echo asegúrate de tener Agent-Zero en ejecución.
echo.

npm run dev

pause 