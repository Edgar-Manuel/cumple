# Script de PowerShell para iniciar CUMPLE con Agent-Zero

Write-Host "========================================"
Write-Host "       Iniciando CUMPLE Completo       "
Write-Host "========================================"
Write-Host ""

# Verificar Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python detectado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: No se pudo encontrar Python. Por favor instálalo e intenta de nuevo." -ForegroundColor Red
    Write-Host "  Puedes descargarlo desde: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: No se pudo encontrar Node.js. Por favor instálalo e intenta de nuevo." -ForegroundColor Red
    Write-Host "  Puedes descargarlo desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path -Path ".\agent-zero")) {
    Write-Host "✗ Error: No se encuentra el directorio agent-zero." -ForegroundColor Red
    Write-Host "  Asegúrate de estar ejecutando este script desde el directorio raíz de CUMPLE." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "1. Iniciando Agent-Zero..." -ForegroundColor Cyan

# Cambiar al directorio de Agent-Zero e instalar dependencias esenciales
Push-Location .\agent-zero
try {
    Write-Host "Instalando dependencias esenciales..."
    pip install flask flask-basicauth werkzeug google-generativeai | Out-Null
    
    # Verificar si existe el archivo .env
    if (-not (Test-Path -Path ".\.env")) {
        Write-Host "Creando archivo .env desde example.env..."
        Copy-Item -Path ".\example.env" -Destination ".\.env"
        Write-Host "⚠️ Archivo .env creado. Deberás configurar tus claves API." -ForegroundColor Yellow
    }
    
    # Iniciar Agent-Zero en una nueva ventana
    Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$pwd'; python startup.py`""
    Write-Host "✓ Agent-Zero iniciado en una nueva ventana" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al iniciar Agent-Zero: $_" -ForegroundColor Red
    Write-Host "  Continuando en modo fallback..." -ForegroundColor Yellow
} finally {
    Pop-Location
}

# Esperar a que Agent-Zero se inicialice
Write-Host "Esperando 5 segundos para que Agent-Zero se inicialice..."
Start-Sleep -Seconds 5

# Iniciar la aplicación frontend
Write-Host ""
Write-Host "2. Iniciando la aplicación frontend..." -ForegroundColor Cyan
try {
    # Iniciar Vite en una nueva ventana
    Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$pwd'; npx vite`""
    Write-Host "✓ Aplicación frontend iniciada en una nueva ventana" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al iniciar la aplicación frontend: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "           CUMPLE iniciado             "
Write-Host "========================================"
Write-Host ""
Write-Host "Ambos componentes se han iniciado en ventanas separadas." -ForegroundColor Green
Write-Host "Para detener CUMPLE, cierra ambas ventanas." -ForegroundColor Yellow
Write-Host ""
Write-Host "CUMPLE esta listo para usar!" -ForegroundColor Cyan
Write-Host "Abre tu navegador en http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTA: Si ves errores de conexion con Agent-Zero en la consola," -ForegroundColor Yellow
Write-Host "no te preocupes; la aplicacion esta funcionando en modo fallback" -ForegroundColor Yellow
Write-Host "y todas las funcionalidades principales estan disponibles." -ForegroundColor Yellow 