#!/usr/bin/env python
"""
Script para configurar el entorno Python necesario para Agent-Zero en CUMPLE
"""
import os
import sys
import subprocess
import platform

def main():
    """Configura el entorno Python para Agent-Zero"""
    print("🤖 Configurando entorno para Agent-Zero en CUMPLE...")
    
    # Detectar sistema operativo
    system = platform.system()
    print(f"Sistema detectado: {system}")
    
    # Crear entorno virtual
    if system == "Windows":
        venv_command = "python -m venv agent-zero-env"
        activate_command = ".\\agent-zero-env\\Scripts\\activate"
    else:
        venv_command = "python3 -m venv agent-zero-env"
        activate_command = "source ./agent-zero-env/bin/activate"
    
    print("Creando entorno virtual...")
    subprocess.run(venv_command, shell=True, check=True)
    
    # Instalar dependencias desde requirements.txt de Agent-Zero
    print("Instalando dependencias...")
    
    if system == "Windows":
        install_command = f".\\agent-zero-env\\Scripts\\pip install -r agent-zero/requirements.txt"
    else:
        install_command = f"./agent-zero-env/bin/pip install -r agent-zero/requirements.txt"
    
    subprocess.run(install_command, shell=True, check=True)
    
    # Instalar dependencias adicionales para la integración
    extra_deps = ["flask", "flask-cors", "requests"]
    print(f"Instalando dependencias adicionales: {', '.join(extra_deps)}")
    
    if system == "Windows":
        extra_command = f".\\agent-zero-env\\Scripts\\pip install {' '.join(extra_deps)}"
    else:
        extra_command = f"./agent-zero-env/bin/pip install {' '.join(extra_deps)}"
    
    subprocess.run(extra_command, shell=True, check=True)
    
    # Configurar variables de entorno
    print("Configurando variables de entorno...")
    
    # Copiar el archivo de ejemplo a .env si no existe
    if not os.path.exists("agent-zero/.env"):
        print("Creando archivo .env a partir de example.env...")
        with open("agent-zero/example.env", "r") as example_file:
            example_content = example_file.read()
        
        # Modificar para CUMPLE
        example_content = example_content.replace(
            "# OPENAI_API_KEY=sk-...", 
            "# OPENAI_API_KEY=sk-...\n\n# CUMPLE Specific Settings\nCUMPLE_INTEGRATION=true\nCUMPLE_API_PORT=3500"
        )
        
        with open("agent-zero/.env", "w") as env_file:
            env_file.write(example_content)
    
    print("✅ Entorno de Agent-Zero configurado correctamente.")
    print("\nPara activar el entorno:")
    print(f"  {activate_command}")
    print("\nPara iniciar Agent-Zero en modo servicio:")
    print("  python agent-zero-service.py")

if __name__ == "__main__":
    main() 