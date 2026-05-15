# Guía Paso a Paso para Configurar Agent-Zero con Docker

Esta guía contiene instrucciones detalladas para configurar y ejecutar Agent-Zero utilizando Docker, permitiendo que todas las funcionalidades de CUMPLE funcionen correctamente.

## Requisitos Previos

1. **Docker Desktop**
   - Descarga desde: https://www.docker.com/products/docker-desktop
   - Instala siguiendo las instrucciones del asistente
   - Asegúrate de seleccionar la opción de WSL 2 durante la instalación

2. **WSL 2 (Windows Subsystem for Linux 2)**
   - Abre PowerShell como administrador y ejecuta:
     ```
     wsl --install
     ```
   - Reinicia tu equipo cuando se te solicite

## Paso 1: Verificar la Instalación de Docker

1. Abre Docker Desktop desde el menú de inicio
2. Espera a que el icono en la bandeja del sistema muestre que Docker está ejecutándose
3. Abre PowerShell y verifica que Docker funciona correctamente:
   ```
   docker --version
   docker-compose --version
   docker run hello-world
   ```

## Paso 2: Corregir el archivo docker-compose.yml

1. Abre el archivo `docker-compose.yml` en la raíz del proyecto
2. Elimina la línea `version: '3.8'` (ya es obsoleta)
3. Asegúrate de que la configuración de los servicios es correcta:

```yaml
services:
  # Servicio para la aplicación frontend de CUMPLE
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    volumes:
      - ./:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_AGENT_ZERO_URL=http://agent-zero:5000
    depends_on:
      - agent-zero
    networks:
      - cumple-network

  # Servicio para Agent-Zero
  agent-zero:
    build:
      context: ./agent-zero
      dockerfile: docker/Dockerfile
    image: cumple-agent-zero
    ports:
      - "5000:5000"  # Puerto para la API/UI Web
      - "11434:11434"  # Puerto para Ollama
    volumes:
      - ./agent-zero:/a0
      - ./agent-zero/tmp:/tmp
      - ./cumple-prompts:/a0/prompts/cumple
    environment:
      - WEB_UI_HOST=0.0.0.0
      - WEB_UI_PORT=5000
      - AUTH_LOGIN=admin
      - AUTH_PASSWORD=admin
      - API_KEY_OPENAI=${OPENAI_API_KEY:-}
    networks:
      - cumple-network

# Volúmenes para persistencia de datos
volumes:
  agent-zero-data:

# Red compartida
networks:
  cumple-network:
    driver: bridge
```

## Paso 3: Configurar las Variables de Entorno

1. Crea o edita el archivo `.env` en la raíz del proyecto:
   ```
   OPENAI_API_KEY=tu_clave_api_aquí
   AGENT_ZERO_USER=admin
   AGENT_ZERO_PASSWORD=admin
   ```

2. Si no tienes una clave API de OpenAI, puedes obtener una en https://platform.openai.com/api-keys

## Paso 4: Iniciar los Contenedores

1. Abre PowerShell y navega hasta el directorio del proyecto:
   ```
   cd C:\Users\34672\cumple
   ```

2. Construye e inicia los contenedores:
   ```
   docker-compose up -d --build
   ```

3. Verifica que los contenedores estén funcionando:
   ```
   docker-compose ps
   ```

   Deberías ver dos contenedores en estado "Up":
   - `cumple_frontend_1`
   - `cumple_agent-zero_1`

## Paso 5: Verificar el Funcionamiento

1. Accede a la aplicación frontend:
   - URL: http://localhost:3000

2. Accede a la interfaz web de Agent-Zero:
   - URL: http://localhost:5000
   - Usuario: admin
   - Contraseña: admin

## Paso 6: Solución de Problemas Comunes

### Los contenedores no se inician correctamente

1. Verifica los logs para encontrar errores:
   ```
   docker-compose logs frontend
   docker-compose logs agent-zero
   ```

2. Si hay problemas con los permisos de los volúmenes:
   ```
   docker-compose down
   docker-compose up -d
   ```

### El servicio agent-zero no puede construirse

1. Intenta construir la imagen directamente:
   ```
   docker build -t cumple-agent-zero -f ./agent-zero/docker/Dockerfile ./agent-zero
   ```

2. Luego inicia los servicios:
   ```
   docker-compose up -d
   ```

### El frontend no puede conectarse a Agent-Zero

1. Verifica que la red está creada correctamente:
   ```
   docker network ls
   ```

2. Comprueba que ambos contenedores están en la misma red:
   ```
   docker network inspect cumple-network
   ```

## Paso 7: Detener los Contenedores

Cuando hayas terminado de trabajar:

```
docker-compose down
```

Para detener y eliminar los contenedores, redes y volúmenes creados.

## Funcionalidades que Agent-Zero Habilita

Una vez configurado correctamente, Agent-Zero permitirá:

- **Gestión de Eventos**: Calendarios y recordatorios inteligentes
- **Mensajes con IA**: Generación de mensajes personalizados
- **Recomendaciones de Regalos**: Sugerencias basadas en perfiles
- **Descuentos Exclusivos**: Ofertas para usuarios premium
- **Notificaciones Multicanal**: Email y WhatsApp
- **Análisis Predictivo**: Comportamiento de contactos
- **Plantillas Premium**: Biblioteca de mensajes prediseñados
- **Automatización Social**: Publicaciones programadas
- **Seguridad y Privacidad**: Protección de datos 