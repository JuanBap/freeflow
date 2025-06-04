import collections

class FreeFlowSolver:
    """
    Resuelve un puzle tipo Free Flow en un tablero N x N.

    El objetivo es conectar pares de puntos de colores mediante caminos ortogonales
    sin que los caminos se crucen, y llenando completamente el tablero.
    """

    def __init__(self, board_str: str):
        """
        Inicializa el solver con la descripción del tablero.

        Args:
            board_str: Una cadena multilínea que describe el tablero.
                       La primera línea es "N,N" (tamaño del tablero).
                       Las líneas siguientes son "fila,columna,color" (1-indexed).
        """
        self.n = 0
        self.dots_input_raw = []  # Almacena (r, c, val) 1-indexed
        self._parse_input(board_str) # Establece self.n y self.dots_input_raw

        # El tablero se representa como una lista de listas, 0 para vacío.
        self.board = [[0 for _ in range(self.n)] for _ in range(self.n)]
        
        # self.pairs almacena {color_id: {'start': (r,c), 'end': (r,c)}} (0-indexed)
        self.pairs = collections.OrderedDict() # Usamos OrderedDict para mantener un orden consistente de colores
        self._initialize_board_and_pairs() # Llena self.board con puntos iniciales y self.pairs

        # Lista ordenada de IDs de colores a conectar
        self.colors_ordered = list(self.pairs.keys())
        
        # Direcciones de movimiento: Arriba, Abajo, Izquierda, Derecha
        self.moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    def _parse_input(self, board_str: str):
        """Parsea la cadena de entrada para obtener el tamaño y los puntos."""
        lines = board_str.strip().split('\n')
        try:
            self.n = int(lines[0].split(',')[0])
            if self.n <= 0:
                raise ValueError("El tamaño del tablero N debe ser positivo.")
        except (ValueError, IndexError):
            raise ValueError("Formato incorrecto para el tamaño del tablero en la primera línea.")

        self.dots_input_raw = []
        for line in lines[1:]:
            try:
                r, c, val = map(int, line.split(','))
                if not (1 <= r <= self.n and 1 <= c <= self.n and val > 0):
                    raise ValueError(f"Punto inválido: {line}. Coordenadas fuera de rango o valor de color inválido.")
                self.dots_input_raw.append({'r': r, 'c': c, 'val': val})
            except ValueError as e:
                raise ValueError(f"Formato incorrecto para la línea de punto: {line}. Error: {e}")

    def _initialize_board_and_pairs(self):
        """Inicializa el tablero con los puntos de inicio/fin y organiza los pares."""
        temp_coords = {} # {color: [coord1, coord2]}
        for dot_info in self.dots_input_raw:
            # Convertir a 0-indexed para uso interno
            r_idx, c_idx = dot_info['r'] - 1, dot_info['val'] - 1 
            # Corrección: c_idx debe ser dot_info['c'] - 1
            r_idx, c_idx = dot_info['r'] - 1, dot_info['c'] - 1
            val = dot_info['val']

            if not (0 <= r_idx < self.n and 0 <= c_idx < self.n):
                 raise ValueError(f"Coordenadas del punto ({dot_info['r']},{dot_info['c']}) fuera de los límites del tablero {self.n}x{self.n} después de la conversión a 0-indexed.")

            self.board[r_idx][c_idx] = val # Coloca el punto en el tablero
            
            if val not in temp_coords:
                temp_coords[val] = []
            temp_coords[val].append((r_idx, c_idx))

        sorted_colors = sorted(temp_coords.keys())

        for color in sorted_colors:
            coords = temp_coords[color]
            if len(coords) != 2:
                raise ValueError(f"El color {color} no tiene exactamente dos puntos.")
            self.pairs[color] = {'start': coords[0], 'end': coords[1]}
            # Asegurarse de que los puntos iniciales estén marcados
            self.board[coords[0][0]][coords[0][1]] = color
            self.board[coords[1][0]][coords[1][1]] = color


    def _is_valid_pos(self, r: int, c: int) -> bool:
        """Verifica si la posición (r,c) está dentro del tablero."""
        return 0 <= r < self.n and 0 <= c < self.n

    def _is_board_full(self) -> bool:
        """Verifica si todas las celdas del tablero están ocupadas."""
        for r_idx in range(self.n):
            for c_idx in range(self.n):
                if self.board[r_idx][c_idx] == 0:
                    return False
        return True

    def _solve_recursive(self, color_list_idx: int, current_r: int, current_c: int) -> bool:
        """
        Función recursiva de backtracking para encontrar los caminos.

        Args:
            color_list_idx: Índice del color actual en self.colors_ordered.
            current_r: Fila actual del extremo del camino para el color actual.
            current_c: Columna actual del extremo del camino para el color actual.

        Returns:
            True si se encontró una solución desde este estado, False de lo contrario.
        """
        # Caso base: Todos los colores han sido procesados (se intentó conectar todos)
        if color_list_idx == len(self.colors_ordered):
            return self._is_board_full() # La solución es válida solo si el tablero está lleno

        current_color_id = self.colors_ordered[color_list_idx]
        target_r, target_c = self.pairs[current_color_id]['end']
        
        # Si el camino actual para current_color_id ha llegado a su destino
        if current_r == target_r and current_c == target_c:
            # Pasar al siguiente color, comenzando desde su nodo 'start'
            next_color_idx = color_list_idx + 1
            if next_color_idx == len(self.colors_ordered): # Si era el último color
                 return self._is_board_full()

            next_color_start_node = self.pairs[self.colors_ordered[next_color_idx]]['start']
            if self._solve_recursive(next_color_idx, next_color_start_node[0], next_color_start_node[1]):
                return True
            return False # Backtrack: los colores subsecuentes no pudieron resolverse

        # Intentar extender el camino para current_color_id
        for dr, dc in self.moves:
            next_r, next_c = current_r + dr, current_c + dc

            if self._is_valid_pos(next_r, next_c):
                is_target_cell = (next_r == target_r and next_c == target_c)
                
                # Opción 1: La celda está vacía
                if self.board[next_r][next_c] == 0:
                    self.board[next_r][next_c] = current_color_id # Ocupar celda
                    if self._solve_recursive(color_list_idx, next_r, next_c):
                        return True
                    self.board[next_r][next_c] = 0 # Backtrack: liberar la celda
                
                # Opción 2: La celda es el punto final del color actual (y ya está marcada con ese color)
                elif is_target_cell and self.board[next_r][next_c] == current_color_id:
                    # Se ha alcanzado el objetivo, llamar recursivamente para el mismo color_list_idx
                    # lo que activará la lógica de "camino completado" al inicio de la siguiente llamada.
                    if self._solve_recursive(color_list_idx, next_r, next_c):
                        return True
                    # Si retorna False, significa que completar este camino aquí
                    # no llevó a una solución global. No se revierte board[next_r][next_c]
                    # porque es un punto final. El backtracking de los segmentos anteriores de este
                    # camino se encargará de explorar otras rutas.

        return False # Ningún movimiento desde (current_r, current_c) llevó a una solución

    def solve(self) -> list[list[int]] | str:
        """
        Intenta resolver el puzle.

        Returns:
            El tablero resuelto como una lista de listas de enteros si se encuentra solución.
            Un mensaje de cadena si no se encuentra solución.
        """
        if not self.colors_ordered: # No hay pares para conectar
            return self.board if self._is_board_full() else "No hay pares para conectar."

        # Llamada inicial: comenzar con el primer color, desde su nodo 'start'.
        start_node_first_color = self.pairs[self.colors_ordered[0]]['start']
        
        # Crear una copia del tablero inicial por si necesitamos mostrarlo si no hay solución
        # o para reiniciar entre intentos (aunque aquí solo hay un intento).
        # self.initial_board_state = [row[:] for row in self.board]

        if self._solve_recursive(0, start_node_first_color[0], start_node_first_color[1]):
            return self.board
        else:
            # self.board = self.initial_board_state # Opcional: restaurar si se quiere
            return "No se encontró una solución válida."

    def print_board(self, board_to_print=None):
        """Imprime el tablero de forma legible."""
        if board_to_print is None:
            board_to_print = self.board
        
        if isinstance(board_to_print, str):
            print(board_to_print)
            return

        print(f"Tablero {self.n}x{self.n}:")
        for row in board_to_print:
            print(" ".join(map(str, row)))

# Tablero de prueba proporcionado
test_board_str = """7,7
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

# --- Ejecución ---
if __name__ == "__main__":
    print("Resolviendo el tablero de prueba:")
    try:
        solver = FreeFlowSolver(test_board_str)
        print("Tablero Inicial:")
        solver.print_board()
        print("\nPares a conectar (0-indexed):")
        for color, p_info in solver.pairs.items():
            print(f"Color {color}: {p_info['start']} -> {p_info['end']}")
        
        print("\nBuscando solución...")
        solution = solver.solve()
        
        print("\nResultado:")
        if isinstance(solution, str):
            print(solution)
        else:
            print("¡Solución encontrada!")
            solver.print_board(solution)

    except ValueError as e:
        print(f"Error de inicialización: {e}")
    except Exception as e:
        print(f"Ocurrió un error inesperado: {e}")
