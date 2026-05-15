# Archivo simplificado para evitar la dependencia de whisper
# No importamos el paquete whisper para evitar errores

def transcribe(audio_path, language=None):
    """
    Función simulada para transcribir audio.
    En esta versión simplificada, solo devuelve un mensaje explicativo.
    """
    return {"text": "Transcripción de audio no disponible sin el paquete whisper."}

def available_languages():
    """
    Devuelve una lista vacía ya que no tenemos el paquete whisper instalado.
    """
    return [] 