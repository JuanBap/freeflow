from collections import defaultdict
from copy import deepcopy

# ─────────────────────────────────────────────
# Utilidades básicas
DIRS = [(1, 0), (-1, 0), (0, 1), (0, -1)]          # ↓ ↑ → ←


def in_bounds(r, c, n):
    """Comprueba si (r,c) está dentro del tablero n×n."""
    return 0 <= r < n and 0 <= c < n


# ─────────────────────────────────────────────
# Enumeración de todos los caminos ortogonales posibles entre dos puntos
def all_paths(start, end, grid, limit=1000):
    """
    Devuelve una lista (potencialmente recortada) de caminos simples
    que conectan start y end sin pisar casillas ocupadas.
    Cada camino es una lista de celdas [(r,c), …].
    """
    n = len(grid)
    paths = []

    def dfs(r, c, path):
        if len(paths) >= limit:                 # evita explosión combinatoria
            return
        if (r, c) == end:
            paths.append(path.copy())
            return
        for dr, dc in DIRS:
            nr, nc = r + dr, c + dc
            if in_bounds(nr, nc, n) and (nr, nc) not in path:
                if grid[nr][nc] == 0 or (nr, nc) == end:
                    path.append((nr, nc))
                    dfs(nr, nc, path)
                    path.pop()

    dfs(*start, [start])
    return paths


# ─────────────────────────────────────────────
# Elección heurística del próximo par a conectar
def select_pair(pairs, grid):
    """
    Escoge el par cuyo número de caminos válidos es mínimo (MRV - Minimum
    Remaining Values).  Devuelve (num, lista_de_caminos) o (None, None)
    si algún par carece de caminos y fuerza retroceso inmediato.
    """
    best_num, best_paths = None, None
    for num, (s, e) in pairs.items():
        paths = all_paths(s, e, grid)
        if not paths:                      # sin caminos → poda
            return None, None
        if best_paths is None or len(paths) < len(best_paths):
            best_num, best_paths = num, paths
            if len(paths) == 1:            # MRV óptimo, no hace falta seguir
                break
    return best_num, best_paths


# ─────────────────────────────────────────────
# Buscador principal
def solve(board_size, endpoints):
    """
    board_size : int               (N de un tablero N×N)
    endpoints  : {num:[(r1,c1), (r2,c2)], …}  coordenadas 0-index
    -----------------------------------------------------------
    Devuelve el tablero resuelto (lista de listas) o None.
    Celdas del camino llevan el número de su color.
    """
    n = board_size
    grid = [[0] * n for _ in range(n)]
    for num, pts in endpoints.items():
        for r, c in pts:
            grid[r][c] = num

    pairs = {num: tuple(pts) for num, pts in endpoints.items()}
    solution = None                                   # se rellena al encontrar respuesta

    def backtrack(remaining):
        nonlocal solution
        if solution is not None:
            return
        if not remaining:                             # ¿tablero completo?
            if all(grid[r][c] != 0 for r in range(n) for c in range(n)):
                solution = deepcopy(grid)
            return

        num, paths = select_pair(remaining, grid)
        if num is None:                               # callejón sin salida
            return
        for path in paths:
            # Coloca el camino (sin los extremos, ya marcados)
            can_place = all(grid[r][c] == 0 for r, c in path[1:-1])
            if not can_place:
                continue
            for r, c in path[1:-1]:
                grid[r][c] = num
            nxt = dict(remaining)
            del nxt[num]
            backtrack(nxt)                            # llamadas recursivas
            for r, c in path[1:-1]:                   # deshace (back-tracking)
                grid[r][c] = 0
            if solution is not None:                  # si ya existe, evita más trabajo
                return

    backtrack(pairs)
    return solution


# ─────────────────────────────────────────────
# ------------- Ejemplo de uso ----------------
if __name__ == "__main__":
    raw = """
    7,7
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

    lines = [l.strip() for l in raw.strip().splitlines()]
    N = int(lines[0].split(",")[0])

    endpoints = defaultdict(list)
    for ln in lines[1:]:
        r, c, v = map(int, ln.split(","))
        endpoints[v].append((r - 1, c - 1))           # a 0-index

    solved = solve(N, endpoints)

    if solved:
        print("Tablero resuelto:\n")
        for row in solved:
            print(" ".join(str(x) for x in row))
    else:
        print("No existe solución para este tablero.")

