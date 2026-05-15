# Desarrollo de Instrumentos para Agent-Zero

Este documento explica cómo desarrollar e implementar nuevos instrumentos (herramientas) para Agent-Zero, permitiendo expandir sus capacidades para CUMPLE.

## ¿Qué son los Instrumentos en Agent-Zero?

Los instrumentos son módulos de Python que permiten a Agent-Zero interactuar con sistemas externos, procesar datos o realizar tareas específicas. Actúan como herramientas a disposición del agente para resolver problemas concretos.

## Estructura de Directorios

Los instrumentos se encuentran en la carpeta `instruments` dentro del directorio de Agent-Zero:

```
agent-zero/
  └── instruments/
      ├── base_instrument.py
      ├── document_reader.py
      ├── web_search.py
      └── your_custom_instrument.py
```

## Anatomía de un Instrumento

Cada instrumento hereda de la clase `BaseInstrument` y debe implementar al menos estos métodos:

```python
from instruments.base_instrument import BaseInstrument

class YourCustomInstrument(BaseInstrument):
    def __init__(self):
        super().__init__(
            name="your_instrument_name",
            description="Descripción de lo que hace el instrumento"
        )
    
    def check_dependencies(self):
        """Verificar que todas las dependencias estén instaladas"""
        return True
        
    def run(self, **kwargs):
        """Implementación principal del instrumento"""
        # Tu código aquí
        return {"result": "Resultado de la ejecución"}
```

## Paso a Paso para Crear un Nuevo Instrumento

### 1. Crear el Archivo del Instrumento

Crea un nuevo archivo Python en la carpeta `instruments` con un nombre descriptivo:

```python
# instruments/gift_recommender.py

from instruments.base_instrument import BaseInstrument
import requests
import json

class GiftRecommender(BaseInstrument):
    def __init__(self):
        super().__init__(
            name="gift_recommender",
            description="Recomienda regalos personalizados basados en intereses y ocasión"
        )
        
    def check_dependencies(self):
        try:
            import requests
            return True
        except ImportError:
            return False
            
    def run(self, interests=None, occasion=None, budget=None, **kwargs):
        """
        Genera recomendaciones de regalos.
        
        Args:
            interests (str): Intereses de la persona separados por comas
            occasion (str): Tipo de ocasión (cumpleaños, aniversario, etc.)
            budget (float): Presupuesto máximo en euros
            
        Returns:
            dict: Lista de recomendaciones de regalos
        """
        if not interests:
            return {"error": "Se requieren intereses para generar recomendaciones"}
            
        # Implementación real para generar recomendaciones
        # ...
        
        # Ejemplo de resultado
        recommendations = [
            {
                "title": "Auriculares Bluetooth",
                "description": "Perfectos para amantes de la música",
                "price": 59.99,
                "url": "https://ejemplo.com/auriculares"
            },
            {
                "title": "Libro de Fotografía",
                "description": "Colección de fotografías impresionantes",
                "price": 35.50,
                "url": "https://ejemplo.com/libro"
            }
        ]
        
        return {
            "recommendations": recommendations,
            "total": len(recommendations),
            "interests_matched": interests.split(",")
        }
```

### 2. Registrar el Instrumento

Para que Agent-Zero pueda usar tu instrumento, debes registrarlo en el sistema. Hay dos formas de hacerlo:

#### Opción 1: Usar el sistema de autodescubrimiento

Agent-Zero puede descubrir automáticamente los instrumentos en el directorio `instruments`. Solo asegúrate de que la clase herede correctamente de `BaseInstrument`.

#### Opción 2: Registrar manualmente

Edita el archivo `agent.py` y registra tu instrumento explícitamente:

```python
from instruments.gift_recommender import GiftRecommender

# En la función load_instruments
def load_instruments(self):
    # ... código existente ...
    self.register_instrument(GiftRecommender())
```

### 3. Probar el Instrumento

Puedes probar tu instrumento directamente desde la línea de comandos:

```bash
cd agent-zero
python -c "from instruments.gift_recommender import GiftRecommender; print(GiftRecommender().run(interests='música,tecnología', occasion='cumpleaños', budget=100))"
```

### 4. Crear Prompts para Usar el Instrumento

Para que Agent-Zero sepa cuándo y cómo usar tu instrumento, necesitas crear o modificar los prompts en la carpeta `prompts/cumple`:

```markdown
<!-- prompts/cumple/gift_recommendations.md -->

# Recomendaciones de Regalos

Cuando necesites recomendar regalos para un contacto, utiliza el instrumento `gift_recommender`.

## Ejemplos de uso:

Para un cumpleaños:
```
gift_recommender(
  interests="música,gaming,deportes",
  occasion="cumpleaños",
  budget=50
)
```

Para un aniversario:
```
gift_recommender(
  interests="viajes,cocina,jardinería",
  occasion="aniversario",
  budget=100
)
```

## Consejos para mejorar las recomendaciones:

1. Siempre incluye al menos 3-5 intereses separados por comas
2. Especifica claramente la ocasión
3. Proporciona un presupuesto realista
```

### 5. Implementar un Endpoint API (Opcional)

Si quieres exponer tu instrumento directamente a través de la API REST de Agent-Zero, puedes modificar `run_ui.py` para añadir un nuevo endpoint:

```python
# En run_ui.py

@app.route('/generate_gift_recommendations', methods=['POST'])
def generate_gift_recommendations():
    data = request.get_json()
    required_fields = ['interests', 'occasion']
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        agent = get_agent()
        # Usa directamente el instrumento
        from instruments.gift_recommender import GiftRecommender
        recommender = GiftRecommender()
        
        result = recommender.run(
            interests=data['interests'],
            occasion=data['occasion'],
            budget=data.get('budget')
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

## Mejores Prácticas para Desarrollar Instrumentos

1. **Validación de entradas**: Verifica siempre que los parámetros requeridos estén presentes y tengan valores válidos.

2. **Manejo de errores**: Implementa un manejo adecuado de errores para evitar interrupciones en el flujo de Agent-Zero.

3. **Documentación**: Documenta claramente qué hace tu instrumento, sus parámetros y valores de retorno.

4. **Modularidad**: Diseña instrumentos que hagan una sola cosa bien, en lugar de instrumentos que intenten hacer muchas cosas.

5. **Dependencias**: Minimiza las dependencias externas y verifica su disponibilidad con `check_dependencies()`.

6. **Seguridad**: Ten cuidado con la información sensible y no la expongas en logs o respuestas.

7. **Rendimiento**: Considera el rendimiento, especialmente en instrumentos que serán utilizados frecuentemente.

## Ejemplos de Instrumentos para CUMPLE

Aquí hay algunos ejemplos de instrumentos que serían útiles para implementar las funcionalidades de CUMPLE:

### 1. NotificationManager

```python
# instruments/notification_manager.py

class NotificationManager(BaseInstrument):
    def __init__(self):
        super().__init__(
            name="notification_manager",
            description="Envía notificaciones a través de diferentes canales"
        )
        
    def run(self, message, recipient, channel="email", schedule_time=None, **kwargs):
        # Implementación para enviar notificaciones
        pass
```

### 2. SocialPublisher

```python
# instruments/social_publisher.py

class SocialPublisher(BaseInstrument):
    def __init__(self):
        super().__init__(
            name="social_publisher",
            description="Publica mensajes en redes sociales"
        )
        
    def run(self, message, platform, schedule_time=None, media=None, **kwargs):
        # Implementación para publicar en redes sociales
        pass
```

### 3. BehaviorAnalyzer

```python
# instruments/behavior_analyzer.py

class BehaviorAnalyzer(BaseInstrument):
    def __init__(self):
        super().__init__(
            name="behavior_analyzer",
            description="Analiza patrones de comportamiento para predecir momentos óptimos"
        )
        
    def run(self, contact_id, event_history=None, **kwargs):
        # Implementación para analizar comportamiento
        pass
```

## Recursos Adicionales

- Revisa los instrumentos existentes en la carpeta `instruments/` para ver ejemplos prácticos
- Consulta la documentación de Agent-Zero para más detalles sobre la arquitectura
- Prueba tus instrumentos de forma aislada antes de integrarlos con el resto del sistema 