import { Component, OnInit } from '@angular/core';
//Modelo de celda
import { Celda } from '../model/celda.model'; // Comentado si defines arriba o ya lo tienes

interface Posicion { i: number; j: number; }

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit {
  //Tablero de juego - vacío
  tablero: Celda[][] = [];

  //Variables para eventos
  trazando: boolean = false;
  caminoActualId: number | null = null;
  origenValor: number | null = null;

  //Almacena el camino temporal para revertir si es inválido
  private pathActual: Posicion[] = [];
  ultimaPos: Posicion | null = null;
  
  // Modal de victoria
  showVictoryModal: boolean = false;

  // Variables para auto-resolución
  private readonly DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // ↓ ↑ → ←

  //Inicializar el tablero
  ngOnInit(): void {
    this.crearTableroDefault();
  }

  //Crear tablero vacío
  crearTableroVacio(filas: number, columnas: number): Celda[][] {
    return Array.from({ length: filas }, () =>
      Array.from({ length: columnas }, () => ({ valor: null }))
    );
  }

  //Llenar el tablero a partir de las líneas de texto
  llenarTableroDesdeLineas(lineas: string[]): void {
    const [filas, columnas] = lineas[0].split(',').map(Number);
    this.tablero = this.crearTableroVacio(filas, columnas);
    for (let i = 1; i < lineas.length; i++) {
      const [fila, columna, valor] = lineas[i].split(',').map(Number);
      this.tablero[fila - 1][columna - 1].valor = valor;
    }
  }

  //Crear tablero por defecto
  crearTableroDefault(): void {
    const tableroInicial = `
    7,7
    1,4,4
    2,2,3
    2,5,2
    2,6,5
    3,4,3
    3,5,1
    4,4,5
    6,3,1
    7,1,2
    7,5,4
    `;
    const lineas = tableroInicial.trim().split('\n').map(l => l.trim());
    this.llenarTableroDesdeLineas(lineas);
  }

  //Crear tablero mediante archivo de texto
  cargarTableroPorArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      const lector = new FileReader();
      lector.onload = () => {
        const lineas = (lector.result as string).trim().split('\n').map(l => l.trim());
        this.llenarTableroDesdeLineas(lineas);
        // Close victory modal if it's open
        this.showVictoryModal = false;
      };
      lector.readAsText(archivo);
    }
  }

  //Reiniciar sólo caminos (no números)
  reiniciarTablero(): void {
    for (let fila of this.tablero) {
      for (let celda of fila) {
        if (celda.valor === null) { // Solo borra caminos, no los números iniciales
          delete celda.caminoId;
          delete celda.direccion;
        }
      }
    }
     // También reinicia el estado de trazado por si acaso
    this.resetTrazadoTemporal();
    // Close victory modal if it's open
    this.showVictoryModal = false;
  }

  //---------------Lógica para el juego-------------
  iniciarTrazo(i: number, j: number): void {
    const celda = this.tablero[i][j];

    //Si hago clic sobre un número con camino trazado, borro ese camino
    // Para borrar un camino, se debe hacer clic en uno de sus extremos (números)
    // Si la celda es un número y ya tiene un caminoId (lo que implica que es un extremo de un camino existente)
    if (celda.valor !== null) { // Es una celda con número
      const caminoAsociado = this.tablero.flat().find(c => c.caminoId === celda.valor && c.valor === null);
      if (caminoAsociado) { // Si existe al menos una celda de camino con este ID
         // Verificar si este número es uno de los extremos de un camino que deseamos borrar
        let countExtremosConCamino = 0;
        for (const fila of this.tablero) {
            for (const celdaNum of fila) {
                if (celdaNum.valor === celda.valor && celdaNum.caminoId === celda.valor) {
                    countExtremosConCamino++;
                }
            }
        }
        // Si ambos extremos del número 'celda.valor' están marcados como parte del camino 'celda.valor',
        // y no hay celdas de camino intermedias (lo que significaría un clic en un número antes de trazar),
        // o si hay celdas de camino (lo que significa un camino completo), procedemos a borrar.
        // La lógica original `celda.caminoId === celda.valor` para borrar un camino es un poco ambigua.
        // Un camino se define por su `caminoId`. Si un número `X` está conectado,
        // sus celdas de origen/destino tendrán `valor: X` y `caminoId: X`.
        // Las celdas intermedias tendrán `valor: null` y `caminoId: X`.
        // Para borrar el camino X, borramos todas las celdas con `caminoId: X`.
        
        // Vamos a buscar si hay algún camino asociado a este valor.
        // Si se hace clic en un número y este forma parte de un camino (ya sea inicio o fin completado),
        // se borra todo el camino asociado a ese número.
        const existeCaminoParaEsteNumero = this.tablero.flat().some(c => c.caminoId === celda.valor);
        if (existeCaminoParaEsteNumero) {
            this.borrarCamino(celda.valor);
            this.resetTrazadoTemporal(); // Asegurar que el estado de trazado se reinicie
            return;
        }
      }
    }


    if (celda.valor !== null && celda.caminoId === undefined) { // Solo iniciar trazo desde un número que no sea ya parte final de un camino
      this.trazando = true;
      this.caminoActualId = celda.valor;
      this.origenValor = celda.valor;
      this.pathActual = [{i,j}]; // El origen también es parte del path para referencia
      this.ultimaPos = { i, j };
      // Marcamos la celda origen como parte de su propio camino para visualización y lógica
      // this.tablero[i][j].caminoId = celda.valor; // Comentado para evitar que se marque antes de finalizar.
    }
  }

  trazar(i: number, j: number): void {
    if (!this.trazando || this.caminoActualId === null || !this.ultimaPos) return;
    
    // Prevenir trazado sobre la celda de origen inmediatamente
    if (i === this.pathActual[0].i && j === this.pathActual[0].j && this.pathActual.length === 1) {
        return;
    }

    const celda = this.tablero[i][j];

    //Debe ser adyacente ortogonalmente
    const diffI = Math.abs(i - this.ultimaPos.i);
    const diffJ = Math.abs(j - this.ultimaPos.j);
    if ((diffI + diffJ) !== 1) return;

    //No pisar otros caminos (excepto el propio camino si se está volviendo)
    //ni números que no sean el destino.
    if (celda.caminoId !== undefined && celda.caminoId !== this.caminoActualId) return; // Pisar otro camino
    if (celda.valor !== null && celda.valor !== this.origenValor) return; // Pisar otro número

    // Lógica para acortar el camino si se retrocede
    const existingPathIndex = this.pathActual.findIndex(p => p.i === i && p.j === j);
    if (existingPathIndex !== -1 && celda.caminoId === this.caminoActualId) { // Retrocediendo sobre el camino actual
        // Borrar las celdas del camino que se están "deshaciendo"
        for (let k = existingPathIndex + 1; k < this.pathActual.length; k++) {
            const pos = this.pathActual[k];
            const celdaARevertir = this.tablero[pos.i][pos.j];
            // Solo revertir si no es la celda de origen del número
            if (celdaARevertir.valor === null) { 
                 delete celdaARevertir.caminoId;
                 delete celdaARevertir.direccion;
            }
        }
        this.pathActual.splice(existingPathIndex + 1);
        this.ultimaPos = {i,j}; // Actualizar la última posición
        return;
    }


    // Si la celda es vacía y no tiene caminoId o es parte del camino actual (para el caso de retroceso)
    if (celda.valor === null && (celda.caminoId === undefined || celda.caminoId === this.caminoActualId)) {
        celda.caminoId = this.caminoActualId;
        this.pathActual.push({ i, j });
        this.ultimaPos = { i, j };
    }
    // Si la celda es el número destino
    else if (celda.valor === this.origenValor && celda.caminoId === undefined) {
        // No se marca aquí, se marcará en finalizarTrazo
        this.pathActual.push({ i, j });
        this.ultimaPos = { i, j };
        // Podríamos llamar a finalizarTrazo aquí si queremos que se complete automáticamente al tocar el destino
        // this.finalizarTrazo(i,j); 
    }
  }

  //IMPORTANTE: la firma vuelve a aceptar dos argumentos para coincidir con el template
  finalizarTrazo(i: number, j: number): void {
    if (!this.trazando || this.caminoActualId === null || !this.origenValor || this.pathActual.length === 0) {
      this.revertirPathActual(true); // Revertir si no hay trazado válido
      this.resetTrazadoTemporal();
      return;
    }

    const celdaInicio = this.tablero[this.pathActual[0].i][this.pathActual[0].j];
    const celdaFin = this.tablero[i][j];
    
    // Asegurarse que la última posición registrada es la actual donde se suelta el mouse
    // Esto es importante si el mouseup ocurre en una celda diferente al último mouseenter
    // y esa celda es válida para finalizar.
    const esUltimaPosValida = this.ultimaPos && i === this.ultimaPos.i && j === this.ultimaPos.j;

    // El camino debe tener al menos una celda intermedia o ser entre dos celdas número adyacentes.
    // El pathActual[0] es la celda de origen (número).
    // Si solo hay 1 elemento en pathActual, significa que solo se hizo click y no se movió, o se movió a una celda inválida.
    if (this.pathActual.length <= 1 && !(celdaFin.valor === this.origenValor && celdaFin !== celdaInicio) ) {
        this.revertirPathActual(true); // Revertir si el camino es demasiado corto o inválido
        this.resetTrazadoTemporal();
        return;
    }

    if (esUltimaPosValida && celdaFin.valor === this.origenValor && celdaFin !== celdaInicio) {
      // Camino válido y completo: conecta dos números iguales distintos.
      // Marcar la celda de inicio y fin como parte del camino
      celdaInicio.caminoId = this.caminoActualId;
      celdaFin.caminoId = this.caminoActualId; 
      // Las celdas intermedias ya fueron marcadas en trazar()
      this.verificarVictoria();
    } else {
      // Camino inválido (no termina en el número correcto, o en la misma celda de origen sin moverse, etc.) -> revertir
      this.revertirPathActual(true);
    }
    this.resetTrazadoTemporal();
  }

  private resetTrazadoTemporal(): void {
    this.trazando = false;
    this.caminoActualId = null;
    this.origenValor = null;
    this.ultimaPos = null;
    this.pathActual = [];
  }

  private revertirPathActual(revertirOrigen: boolean = false): void {
    // Iterar desde 1 si no se quiere revertir el origen (primera celda del path)
    // El origen (celda con número) no debe perder su caminoId si el camino se completa.
    // Si el camino es inválido, se borra todo.
    const startIndex = revertirOrigen ? 0 : 1;
    for (let k = startIndex; k < this.pathActual.length; k++) {
        const pos = this.pathActual[k];
        if (pos) { // Asegurarse que la posición existe
            const celda = this.tablero[pos.i][pos.j];
            // Solo borrar caminoId de celdas que no son el número de origen
            // o si se indica revertirOrigen (camino inválido total)
            if (revertirOrigen || celda.valor === null) {
                 delete celda.caminoId;
                 delete celda.direccion;
            }
        }
    }
  }

  private borrarCamino(id: number): void {
    for (let fila of this.tablero) {
      for (let celda of fila) {
        // Borra el caminoId de las celdas de camino y de las celdas número que forman los extremos.
        if (celda.caminoId === id) {
          delete celda.caminoId;
          delete celda.direccion;
        }
      }
    }
  }

  verificarVictoria(): void {
    //1. Todos los números deben tener exactamente dos celdas (inicio y fin) con ese VALOR en el tablero
    const numerosConteo = new Map<number, number>();
    const todosLosNumerosDelTablero = new Set<number>();

    for (let i = 0; i < this.tablero.length; i++) {
      for (let j = 0; j < this.tablero[i].length; j++) {
        const celda = this.tablero[i][j];
        if (celda.valor !== null) {
          todosLosNumerosDelTablero.add(celda.valor);
          // Contamos cuántas celdas de NÚMERO tienen este valor
          numerosConteo.set(celda.valor, (numerosConteo.get(celda.valor) || 0) + 1);
        }
      }
    }

    for (const valor of todosLosNumerosDelTablero) {
      if (numerosConteo.get(valor) !== 2) return; // Cada número debe aparecer exactamente dos veces.

      // Además, ambas instancias del número deben estar conectadas por un camino con su ID.
      // Y esas celdas número deben tener su caminoId asignado.
      let puntosDelNumeroConCaminoId = 0;
       for (let i = 0; i < this.tablero.length; i++) {
        for (let j = 0; j < this.tablero[i].length; j++) {
          const celda = this.tablero[i][j];
          if (celda.valor === valor && celda.caminoId === valor) {
            puntosDelNumeroConCaminoId++;
          }
        }
      }
      if (puntosDelNumeroConCaminoId !== 2) return; // Ambos extremos del número deben estar marcados como parte del camino.
    }


    //2. Cada número debe tener un camino que conecte sus dos posiciones
    //    (asegurado por la lógica de trazado y la condición anterior de caminoId en los números)
    //    y todas las celdas de ese camino deben tener el caminoId correcto.
    for (const valor of todosLosNumerosDelTablero) {
      if (!this.caminoConecta(valor)) return;
    }

    //3. No deben quedar celdas vacías (valor: null) sin caminoId
    for (let fila of this.tablero) {
      for (let celda of fila) {
        if (celda.valor === null && celda.caminoId === undefined) return;
      }
    }

    // Mostrar  modal de victoria en lugar de alerta
    this.showVictoryModal = true;
  }

  // Cerrar modal de victoria
  closeVictoryModal(): void {
    this.showVictoryModal = false;
  }

  private caminoConecta(valorNumero: number): boolean {
    //Encuentra los dos puntos del valor y realiza BFS/DFS sobre celdas con caminoId == valorNumero
    //o celdas que SON el número y tienen caminoId == valorNumero
    const posicionesNumero: Posicion[] = [];
    for (let i = 0; i < this.tablero.length; i++) {
      for (let j = 0; j < this.tablero[i].length; j++) {
        if (this.tablero[i][j].valor === valorNumero && this.tablero[i][j].caminoId === valorNumero) {
            posicionesNumero.push({ i, j });
        }
      }
    }

    // Ya verificamos que hay dos puntos con el valor y caminoId correcto en verificarVictoria
    if (posicionesNumero.length !== 2) return false; 

    const [start, target] = posicionesNumero;
    const visitados = new Set<string>([`${start.i}-${start.j}`]);
    const cola: Posicion[] = [start];

    const esCeldaValidaParaCamino = (r: number, c: number): boolean => {
        if (r < 0 || r >= this.tablero.length || c < 0 || c >= this.tablero[0].length) return false;
        const celdaVecina = this.tablero[r][c];
        // Es parte del camino (valor null, caminoId correcto) O es el otro extremo del número (valor correcto, caminoId correcto)
        return (celdaVecina.caminoId === valorNumero);
    };

    while (cola.length > 0) {
      const actual = cola.shift()!;
      if (actual.i === target.i && actual.j === target.j) return true;

      const movimientos = [{i:0,j:1}, {i:0,j:-1}, {i:1,j:0}, {i:-1,j:0}]; // Derecha, Izquierda, Abajo, Arriba

      for (const mov of movimientos) {
        const nextI = actual.i + mov.i;
        const nextJ = actual.j + mov.j;
        const key = `${nextI}-${nextJ}`;

        if (esCeldaValidaParaCamino(nextI, nextJ) && !visitados.has(key)) {
          visitados.add(key);
          cola.push({ i: nextI, j: nextJ });
        }
      }
    }
    return false;
  }

  // ─────────────────────────────────────────────
  // ALGORITMO DE AUTO-RESOLUCIÓN
  // ─────────────────────────────────────────────

  /**
   * Función principal para auto-resolver el tablero
   */
  autoResolver(): void {
    // Reiniciar tablero primero
    this.reiniciarTablero();

    // Extraer endpoints del tablero actual
    const endpoints = this.extraerEndpoints();
    
    // Resolver usando el algoritmo
    const solucion = this.autoSolve(this.tablero.length, endpoints);
    
    if (solucion) {
      this.aplicarSolucion(solucion);
      // Verificar victoria automáticamente
      setTimeout(() => {
        this.verificarVictoria();
      }, 100);
    } else {
      alert('No se pudo encontrar una solución para este tablero.');
    }
  }

  /**
   * Extrae los endpoints (números) del tablero actual
   */
  private extraerEndpoints(): { [num: number]: [Posicion, Posicion] } {
    const numerosMap = new Map<number, Posicion[]>();
    
    for (let i = 0; i < this.tablero.length; i++) {
      for (let j = 0; j < this.tablero[i].length; j++) {
        const valor = this.tablero[i][j].valor;
        if (valor !== null) {
          if (!numerosMap.has(valor)) {
            numerosMap.set(valor, []);
          }
          numerosMap.get(valor)!.push({ i, j });
        }
      }
    }

    const endpoints: { [num: number]: [Posicion, Posicion] } = {};
    for (const [num, positions] of numerosMap.entries()) {
      if (positions.length === 2) {
        endpoints[num] = [positions[0], positions[1]];
      }
    }
    
    return endpoints;
  }

  /**
   * Comprueba si (r,c) está dentro del tablero
   */
  private inBounds(r: number, c: number, n: number): boolean {
    return 0 <= r && r < n && 0 <= c && c < n;
  }

  /**
   * Encuentra todos los caminos ortogonales posibles entre dos puntos
   */
  private allPaths(start: Posicion, end: Posicion, grid: number[][], limit: number = 1000): Posicion[][] {
    const n = grid.length;
    const paths: Posicion[][] = [];

    const dfs = (r: number, c: number, path: Posicion[]): void => {
      if (paths.length >= limit) return; // evita explosión combinatoria
      
      if (r === end.i && c === end.j) {
        paths.push([...path]);
        return;
      }

      for (const [dr, dc] of this.DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        
        if (this.inBounds(nr, nc, n) && !path.some(p => p.i === nr && p.j === nc)) {
          if (grid[nr][nc] === 0 || (nr === end.i && nc === end.j)) {
            path.push({ i: nr, j: nc });
            dfs(nr, nc, path);
            path.pop();
          }
        }
      }
    };

    dfs(start.i, start.j, [start]);
    return paths;
  }

  /**
   * Escoge el par cuyo número de caminos válidos es mínimo (MRV - Minimum Remaining Values)
   */
  private selectPair(pairs: { [num: number]: [Posicion, Posicion] }, grid: number[][]): 
    { num: number | null, paths: Posicion[][] | null } {
    
    let bestNum: number | null = null;
    let bestPaths: Posicion[][] | null = null;

    for (const [numStr, [start, end]] of Object.entries(pairs)) {
      const num = parseInt(numStr);
      const paths = this.allPaths(start, end, grid);
      
      if (paths.length === 0) {
        return { num: null, paths: null }; // sin caminos → poda
      }
      
      if (bestPaths === null || paths.length < bestPaths.length) {
        bestNum = num;
        bestPaths = paths;
        if (paths.length === 1) break; // MRV óptimo
      }
    }

    return { num: bestNum, paths: bestPaths };
  }

  /**
   * Algoritmo principal de resolución usando backtracking
   */
  private autoSolve(boardSize: number, endpoints: { [num: number]: [Posicion, Posicion] }): number[][] | null {
    const n = boardSize;
    const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    
    // Marcar endpoints en el grid
    for (const [numStr, positions] of Object.entries(endpoints)) {
      const num = parseInt(numStr);
      for (const pos of positions) {
        grid[pos.i][pos.j] = num;
      }
    }

    const pairs = { ...endpoints };
    let solution: number[][] | null = null;

    const backtrack = (remaining: { [num: number]: [Posicion, Posicion] }): void => {
      if (solution !== null) return;
      
      if (Object.keys(remaining).length === 0) {
        // ¿tablero completo?
        const isComplete = grid.every(row => row.every(cell => cell !== 0));
        if (isComplete) {
          solution = grid.map(row => [...row]);
        }
        return;
      }

      const { num, paths } = this.selectPair(remaining, grid);
      if (num === null) return; // callejón sin salida

      for (const path of paths!) {
        // Verificar si se puede colocar el camino
        const canPlace = path.slice(1, -1).every(pos => grid[pos.i][pos.j] === 0);
        if (!canPlace) continue;

        // Colocar el camino (sin los extremos, ya marcados)
        for (const pos of path.slice(1, -1)) {
          grid[pos.i][pos.j] = num;
        }

        // Crear nuevo objeto remaining sin el número actual
        const newRemaining = { ...remaining };
        delete newRemaining[num];

        backtrack(newRemaining);

        // Deshacer (backtracking)
        for (const pos of path.slice(1, -1)) {
          grid[pos.i][pos.j] = 0;
        }

        if (solution !== null) return; // si ya existe, evita más trabajo
      }
    };

    backtrack(pairs);
    return solution;
  }

  /**
   * Aplica la solución encontrada al tablero visual
   */
  private aplicarSolucion(solucion: number[][]): void {
    // Limpiar caminos existentes pero mantener números
    this.reiniciarTablero();

    // Aplicar la solución
    for (let i = 0; i < solucion.length; i++) {
      for (let j = 0; j < solucion[i].length; j++) {
        const valorSolucion = solucion[i][j];
        const celdaActual = this.tablero[i][j];
        
        if (celdaActual.valor === null && valorSolucion !== 0) {
          // Es una celda de camino
          celdaActual.caminoId = valorSolucion;
        } else if (celdaActual.valor !== null && valorSolucion !== 0) {
          // Es una celda de número, marcarla como parte del camino
          celdaActual.caminoId = valorSolucion;
        }
      }
    }
  }
}