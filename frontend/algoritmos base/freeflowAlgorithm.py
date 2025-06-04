from collections import defaultdict
from copy import deepcopy

# ─────────────────────────────────────────────
# Utilidades básicas
DIRECCIONES = [(1, 0), (-1, 0), (0, 1), (0, -1)]  # ↓ ↑ → ←


def dentro_limites(fila, columna, tamaño_tablero):
    """Comprueba si (fila, columna) está dentro del tablero de tamaño_tablero×tamaño_tablero."""
    return 0 <= fila < tamaño_tablero and 0 <= columna < tamaño_tablero


# ─────────────────────────────────────────────
# Enumeración de todos los caminos ortogonales posibles entre dos puntos
def encontrar_todos_los_caminos(punto_inicio, punto_fin, tablero, limite_caminos=1000):
    """
    Devuelve una lista (potencialmente recortada) de caminos simples
    que conectan punto_inicio y punto_fin sin pisar casillas ocupadas.
    Cada camino es una lista de celdas [(fila, columna), …].
    """
    tamaño_tablero = len(tablero)
    lista_caminos = []

    def busqueda_profundidad(fila_actual, columna_actual, camino_actual):
        if len(lista_caminos) >= limite_caminos:  # evita explosión combinatoria
            return
        if (fila_actual, columna_actual) == punto_fin:
            lista_caminos.append(camino_actual.copy())
            return
        
        for delta_fila, delta_columna in DIRECCIONES:
            nueva_fila = fila_actual + delta_fila
            nueva_columna = columna_actual + delta_columna
            
            if dentro_limites(nueva_fila, nueva_columna, tamaño_tablero) and (nueva_fila, nueva_columna) not in camino_actual:
                if tablero[nueva_fila][nueva_columna] == 0 or (nueva_fila, nueva_columna) == punto_fin:
                    camino_actual.append((nueva_fila, nueva_columna))
                    busqueda_profundidad(nueva_fila, nueva_columna, camino_actual)
                    camino_actual.pop()

    busqueda_profundidad(*punto_inicio, [punto_inicio])
    return lista_caminos


# ─────────────────────────────────────────────
# Elección heurística del próximo par a conectar
def seleccionar_par_optimo(pares_pendientes, tablero):
    """
    Escoge el par cuyo número de caminos válidos es mínimo (MRV - Minimum
    Remaining Values). Devuelve (numero_color, lista_de_caminos) o (None, None)
    si algún par carece de caminos y fuerza retroceso inmediato.
    """
    mejor_numero = None
    mejores_caminos = None
    
    for numero_color, (punto_inicio, punto_fin) in pares_pendientes.items():
        caminos_posibles = encontrar_todos_los_caminos(punto_inicio, punto_fin, tablero)
        
        if not caminos_posibles:  # sin caminos → poda
            return None, None
            
        if mejores_caminos is None or len(caminos_posibles) < len(mejores_caminos):
            mejor_numero = numero_color
            mejores_caminos = caminos_posibles
            if len(caminos_posibles) == 1:  # MRV óptimo, no hace falta seguir
                break
                
    return mejor_numero, mejores_caminos


# ─────────────────────────────────────────────
# Buscador principal
def resolver_tablero_conexiones(tamaño_tablero, puntos_extremos):
    """
    tamaño_tablero : int               (N de un tablero N×N)
    puntos_extremos: {numero:[(fila1, columna1), (fila2, columna2)], …}  coordenadas 0-index
    -----------------------------------------------------------
    Devuelve el tablero resuelto (lista de listas) o None.
    Celdas del camino llevan el número de su color.
    """
    tablero = [[0] * tamaño_tablero for _ in range(tamaño_tablero)]
    
    # Marcar los puntos extremos en el tablero
    for numero_color, lista_puntos in puntos_extremos.items():
        for fila, columna in lista_puntos:
            tablero[fila][columna] = numero_color

    pares_a_conectar = {numero: tuple(lista_puntos) for numero, lista_puntos in puntos_extremos.items()}
    solucion_encontrada = None  # se rellena al encontrar respuesta

    def algoritmo_retroceso(pares_restantes):
        nonlocal solucion_encontrada
        
        if solucion_encontrada is not None:
            return
            
        if not pares_restantes:  # ¿tablero completo?
            if all(tablero[fila][columna] != 0 
                   for fila in range(tamaño_tablero) 
                   for columna in range(tamaño_tablero)):
                solucion_encontrada = deepcopy(tablero)
            return

        numero_seleccionado, caminos_posibles = seleccionar_par_optimo(pares_restantes, tablero)
        
        if numero_seleccionado is None:  # callejón sin salida
            return
            
        for camino_candidato in caminos_posibles:
            # Verificar si se puede colocar el camino (sin los extremos, ya marcados)
            celdas_intermedias = camino_candidato[1:-1]
            puede_colocar = all(tablero[fila][columna] == 0 for fila, columna in celdas_intermedias)
            
            if not puede_colocar:
                continue
                
            # Colocar el camino
            for fila, columna in celdas_intermedias:
                tablero[fila][columna] = numero_seleccionado
                
            # Continuar con los pares restantes
            pares_siguientes = dict(pares_restantes)
            del pares_siguientes[numero_seleccionado]
            algoritmo_retroceso(pares_siguientes)
            
            # Deshacer cambios (backtracking)
            for fila, columna in celdas_intermedias:
                tablero[fila][columna] = 0
                
            if solucion_encontrada is not None:  # si ya existe, evita más trabajo
                return

    algoritmo_retroceso(pares_a_conectar)
    return solucion_encontrada


# ─────────────────────────────────────────────
# ------------- Ejemplo de uso ----------------
if __name__ == "__main__":
    datos_ejemplo = """7,7
    1,5,1
    6,6,1
    1,6,2
    7,4,2
    2,3,3
    5,3,3
    2,6,4
    5,6,4
    2,2,5
    6,2,5"""

    lineas = [linea.strip() for linea in datos_ejemplo.strip().splitlines()]
    tamaño_del_tablero = int(lineas[0].split(",")[0])

    diccionario_puntos_extremos = defaultdict(list)
    for linea in lineas[1:]:
        fila, columna, valor_color = map(int, linea.split(","))
        diccionario_puntos_extremos[valor_color].append((fila - 1, columna - 1))  # convertir a índice base 0

    tablero_resuelto = resolver_tablero_conexiones(tamaño_del_tablero, diccionario_puntos_extremos)

    if tablero_resuelto:
        print("Tablero resuelto:\n")
        for fila in tablero_resuelto:
            print(" ".join(str(celda) for celda in fila))
    else:
        print("No existe solución para este tablero.")

