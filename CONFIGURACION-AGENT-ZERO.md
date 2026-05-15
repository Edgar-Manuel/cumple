# Configuración de Agent-Zero para CUMPLE

## Modo Fallback Activado

Hemos configurado Agent-Zero para funcionar en **modo fallback**, lo que permite que la aplicación funcione correctamente **sin necesidad de tener Agent-Zero en ejecución**. Esto es una solución temporal mientras se resuelven los problemas de configuración de Agent-Zero.

### Características disponibles en modo fallback

En el modo fallback, las siguientes características siguen funcionando:

- ✅ Contador de usuarios activos
- ✅ Visualización de planes y complementos
- ✅ Dashboard con tarjetas informativas
- ✅ Gestión de eventos y contactos
- ✅ Sugerencias básicas personalizadas

Las siguientes características tienen funcionalidad limitada:

- ⚠️ Generación de mensajes con IA (se usan mensajes predefinidos)
- ⚠️ Recomendaciones de regalos (se usan recomendaciones básicas)
- ⚠️ Análisis predictivo (no disponible)

## Configuración correcta de Agent-Zero (para el futuro)

Cuando quieras usar todas las funcionalidades de Agent-Zero, sigue estos pasos:

### 1. Verificar la estructura de Agent-Zero

El directorio `agent-zero` contiene varias carpetas y archivos, pero **no contiene** un archivo `app.py`. Los archivos principales para iniciar el servicio son:

- `run_cli.py` - Para iniciar la interfaz de línea de comandos
- `run_ui.py` - Para iniciar la interfaz de usuario web

### 2. Iniciar Agent-Zero

Para iniciar Agent-Zero correctamente, utiliza uno de estos comandos desde el directorio `agent-zero`:

```powershell
# Para iniciar la interfaz de línea de comandos
python run_cli.py

# O para iniciar la interfaz web
python run_ui.py
```

### 3. Verificar que Agent-Zero está en ejecución

Una vez iniciado, comprueba que Agent-Zero está funcionando en `http://localhost:5000`. Puedes verificarlo accediendo a:

```
http://localhost:5000/health
```

Si recibes una respuesta, significa que Agent-Zero está funcionando correctamente.

### 4. Desactivar el modo fallback

Para desactivar el modo fallback y usar Agent-Zero real:

1. Edita el archivo `src/lib/AgentZeroService.ts`
2. Busca esta línea en el constructor:
   ```typescript
   this.useFallbackMode = true;
   ```
3. Cámbiala a:
   ```typescript
   this.useFallbackMode = false;
   ```

### 5. Reiniciar la aplicación

Después de hacer estos cambios, reinicia la aplicación para que use Agent-Zero real en lugar del modo fallback.

## Solución de problemas

### Error: ERR_CONNECTION_REFUSED

Si ves este error, significa que Agent-Zero no está en ejecución o no está accesible en el puerto 5000. Asegúrate de:

1. Que has iniciado Agent-Zero correctamente
2. Que no hay otro servicio usando el puerto 5000
3. Que no hay un firewall bloqueando la conexión

### Error: No se pudo inicializar Agent-Zero

Este error ocurre cuando la aplicación puede conectarse a Agent-Zero, pero hay un problema con la inicialización. Verifica:

1. Que la API key proporcionada es correcta
2. Que Agent-Zero tiene los permisos necesarios
3. Los logs de Agent-Zero para más detalles sobre el error 