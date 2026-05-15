import os
import json
import sys
import inspect
from functools import lru_cache
from pathlib import Path

# Comentamos la importación problemática de whisper para evitar la dependencia circular
# from python.helpers import runtime, whisper, defer
from python.helpers import runtime, defer

# ... existing code ... 