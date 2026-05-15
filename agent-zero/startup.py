"""
Archivo de inicialización para Agent-Zero con manejo robusto de dependencias
Este script intenta cargar las dependencias necesarias y manejar los errores de importación
para permitir que Agent-Zero funcione incluso cuando faltan algunas dependencias.
"""

import sys
import os
import time
import importlib
from functools import wraps

# Lista de dependencias que intentaremos importar
DEPENDENCIES = [
    ('flask', None),  # (nombre_modulo, alias_opcional)
    ('numpy', 'np'),
    ('werkzeug', None),
    ('flask_basicauth', 'BasicAuth'),
    ('python.helpers.print_style', 'PrintStyle'),
    ('flask_cors', 'CORS'),  # Añadir flask_cors a las dependencias
]

# Diccionario para almacenar las dependencias importadas
imported_modules = {}
missing_modules = []

# Función para imprimir mensajes con colores
def print_colored(message, color_code="\033[0m"):
    print(f"{color_code}{message}\033[0m")

def print_info(message):
    print_colored(f"[INFO] {message}", "\033[94m")  # Azul
    
def print_success(message):
    print_colored(f"[SUCCESS] {message}", "\033[92m")  # Verde
    
def print_warning(message):
    print_colored(f"[WARNING] {message}", "\033[93m")  # Amarillo
    
def print_error(message):
    print_colored(f"[ERROR] {message}", "\033[91m")  # Rojo

# Importar dependencias con manejo de errores
def safe_import(module_name, alias=None):
    try:
        if '.' in module_name:
            # Para módulos con submódulos, usamos __import__ con fromlist
            parts = module_name.split('.')
            base = '.'.join(parts[:-1])
            name = parts[-1]
            module = __import__(module_name, fromlist=[name])
            if alias:
                # Si es un atributo específico del módulo
                if hasattr(module, alias):
                    return getattr(module, alias)
                else:
                    return module
            return module
        else:
            # Para módulos simples
            module = importlib.import_module(module_name)
            if alias:
                # Si es un atributo específico del módulo
                if hasattr(module, alias):
                    return getattr(module, alias)
                else:
                    return module
            return module
    except ImportError as e:
        print_warning(f"No se pudo importar {module_name}: {str(e)}")
        missing_modules.append(module_name)
        return None

# Importar dependencias
print_info("Iniciando carga de dependencias de Agent-Zero...")
for module_name, alias in DEPENDENCIES:
    print_info(f"Intentando importar {module_name}...")
    module = safe_import(module_name, alias)
    if module:
        key = alias if alias else module_name.split('.')[-1]
        imported_modules[key] = module
        print_success(f"Importado correctamente: {module_name}")
    else:
        print_error(f"Fallo al importar: {module_name}")

# Importar dotenv específicamente
try:
    from python.helpers import dotenv
    print_success("Importado: python.helpers.dotenv")
    imported_modules['dotenv'] = dotenv
except ImportError as e:
    print_error(f"No se pudo importar dotenv: {str(e)}")
    missing_modules.append('python.helpers.dotenv')

# Si flask está disponible, configurar la aplicación
if 'flask' in imported_modules:
    try:
        from flask import Flask, request, Response
        from python.helpers.files import get_abs_path
        # Inicializar la aplicación Flask
        app = Flask("app", static_folder=get_abs_path("./webui"), static_url_path="/")
        app.config["JSON_SORT_KEYS"] = False  # Desactivar ordenación de claves en jsonify
        
        # Configurar CORS si está disponible
        if 'CORS' in imported_modules:
            cors = imported_modules['CORS']
            cors(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:8081"]}})
            print_success("CORS configurado para permitir solicitudes desde localhost:5173 y localhost:8081")
        
        # Configurar autenticación básica si está disponible
        if 'BasicAuth' in imported_modules:
            basic_auth = imported_modules['BasicAuth'](app)
            
            # Decorador de autenticación
            def requires_auth(f):
                @wraps(f)
                async def decorated(*args, **kwargs):
                    if 'dotenv' in imported_modules:
                        user = imported_modules['dotenv'].get_dotenv_value("AUTH_LOGIN")
                        password = imported_modules['dotenv'].get_dotenv_value("AUTH_PASSWORD")
                        if user and password:
                            auth = request.authorization
                            if not auth or not (auth.username == user and auth.password == password):
                                return Response(
                                    "Could not verify your access level for that URL.\n"
                                    "You have to login with proper credentials",
                                    401,
                                    {"WWW-Authenticate": 'Basic realm="Login Required"'},
                                )
                    return await f(*args, **kwargs)
                return decorated
        else:
            # Si no hay autenticación, usar un decorador vacío
            def requires_auth(f):
                @wraps(f)
                async def decorated(*args, **kwargs):
                    return await f(*args, **kwargs)
                return decorated
        
        # Ruta por defecto
        @app.route("/", methods=["GET"])
        @requires_auth
        async def serve_index():
            from python.helpers import files
            try:
                from python.helpers import git
                gitinfo = git.get_git_info()
            except Exception:
                gitinfo = {
                    "version": "unknown",
                    "commit_time": "unknown",
                }
            return files.read_file(
                "./webui/index.html",
                version_no=gitinfo["version"],
                version_time=gitinfo["commit_time"],
            )
        
        # Ruta de salud para verificar si el servidor está funcionando
        @app.route("/health", methods=["GET", "OPTIONS"])
        def health_check():
            response = {"status": "ok", "missing_dependencies": missing_modules}
            
            # Añadir encabezados CORS manualmente
            if request.method == "OPTIONS":
                # Preflight request
                resp = Response("")
                resp.headers.add("Access-Control-Allow-Origin", "*")
                resp.headers.add("Access-Control-Allow-Methods", "GET, OPTIONS")
                resp.headers.add("Access-Control-Allow-Headers", "Content-Type")
                return resp
            
            # Respuesta normal con CORS
            resp = Response(imported_modules['flask'].json.dumps(response))
            resp.headers.add("Access-Control-Allow-Origin", "*")
            resp.headers.add("Content-Type", "application/json")
            return resp
        
        print_success("Configuración de Flask completada")
    except Exception as e:
        print_error(f"Error al configurar Flask: {str(e)}")

def run():
    """Función principal para ejecutar Agent-Zero con manejo de errores"""
    if 'PrintStyle' in imported_modules:
        PrintStyle = imported_modules['PrintStyle']
        PrintStyle().print("Inicializando Agent-Zero...")
    else:
        print_info("Inicializando Agent-Zero...")
    
    # Cargar dotenv si está disponible
    if 'dotenv' in imported_modules:
        imported_modules['dotenv'].load_dotenv()
    
    # Configurar puerto y host
    port = 5000
    host = "localhost"
    
    if 'dotenv' in imported_modules:
        dotenv = imported_modules['dotenv']
        try:
            from python.helpers import runtime
            port = (
                runtime.get_arg("port")
                or int(dotenv.get_dotenv_value("WEB_UI_PORT", 0))
                or 5000
            )
            host = (
                runtime.get_arg("host") or dotenv.get_dotenv_value("WEB_UI_HOST") or "localhost"
            )
        except Exception as e:
            print_warning(f"Error al obtener configuración: {str(e)}")
    
    # Iniciar el servidor
    try:
        if 'flask' in imported_modules:
            # Suprimir logs de solicitudes pero mantener mensajes de inicio
            if 'werkzeug' in imported_modules:
                from werkzeug.serving import WSGIRequestHandler
                from werkzeug.serving import make_server
                
                class NoRequestLoggingWSGIRequestHandler(WSGIRequestHandler):
                    def log_request(self, code="-", size="-"):
                        pass
                
                server = make_server(
                    host=host,
                    port=port,
                    app=app,
                    request_handler=NoRequestLoggingWSGIRequestHandler,
                    threaded=True,
                )
                
                print_success(f"Servidor iniciado en http://{host}:{port}")
                server.serve_forever()
            else:
                # Si werkzeug no está disponible, usar app.run directamente
                app.run(port=port, host=host)
        else:
            print_error("Flask no está disponible, no se puede iniciar el servidor")
            return False
    except Exception as e:
        print_error(f"Error al iniciar el servidor: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    # Inicializar runtime si está disponible
    try:
        from python.helpers import runtime
        runtime.initialize()
    except ImportError:
        pass
    
    run() 