import { Component, OnInit } from '@angular/core';
//Modelo de celda
import { Celda } from '../model/celda.model';

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
  private ultimaPos: Posicion | null = null;
  
  // Victory modal
  showVictoryModal: boolean = false;

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
        if (celda.valor === null) {
          delete celda.caminoId;
          delete celda.direccion;
        }
      }
    }
    // Close victory modal if it's open
    this.showVictoryModal = false;
  }

  //---------------Lógica para el juego-------------
  iniciarTrazo(i: number, j: number): void {
    const celda = this.tablero[i][j];

    //Si hago clic sobre un número con camino trazado, borro ese camino
    if (celda.valor !== null && celda.caminoId === celda.valor) {
      this.borrarCamino(celda.valor);
      return;
    }

    if (celda.valor !== null) {
      this.trazando = true;
      this.caminoActualId = celda.valor;
      this.origenValor = celda.valor;
      this.pathActual = [];
      this.ultimaPos = { i, j };
    }
  }

  trazar(i: number, j: number): void {
    if (!this.trazando || this.caminoActualId === null || !this.ultimaPos) return;
    const celda = this.tablero[i][j];

    //Debe ser adyacente ortogonalmente
    const diffI = Math.abs(i - this.ultimaPos.i);
    const diffJ = Math.abs(j - this.ultimaPos.j);
    if ((diffI + diffJ) !== 1) return;

    //No pisar otros caminos ni números
    if (celda.valor !== null || celda.caminoId !== undefined) return;

    celda.caminoId = this.caminoActualId;
    this.pathActual.push({ i, j });
    this.ultimaPos = { i, j };
  }

  //IMPORTANTE: la firma vuelve a aceptar dos argumentos para coincidir con el template
  finalizarTrazo(i: number, j: number): void {
    if (!this.trazando || this.caminoActualId === null) {
      this.resetTrazadoTemporal();
      return;
    }

    const celdaFin = this.tablero[i][j];
    const esOrigenDistinto = !(i === this.ultimaPos!.i && j === this.ultimaPos!.j);

    if (celdaFin.valor === this.origenValor && celdaFin.caminoId === undefined && esOrigenDistinto) {
      //Completo el camino
      celdaFin.caminoId = this.caminoActualId;
      this.verificarVictoria();
    } else {
      //Camino inválido -> revertir
      this.revertirPathActual();
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

  private revertirPathActual(): void {
    for (const pos of this.pathActual) {
      const celda = this.tablero[pos.i][pos.j];
      delete celda.caminoId;
      delete celda.direccion;
    }
  }

  private borrarCamino(id: number): void {
    for (let fila of this.tablero) {
      for (let celda of fila) {
        if (celda.caminoId === id) {
          delete celda.caminoId;
          delete celda.direccion;
        }
      }
    }
  }

  verificarVictoria(): void {
    //1. Todos los números deben tener exactamente dos celdas (inicio y fin)
    const numeros = new Map<number, number>();
    for (let fila of this.tablero) {
      for (let celda of fila) {
        if (celda.valor !== null) {
          numeros.set(celda.valor, (numeros.get(celda.valor) || 0) + 1);
        }
      }
    }
    for (const [, count] of numeros) {
      if (count !== 2) return; //No debería pasar, pero previene errores de archivo
    }

    //2. Cada número debe tener un camino que conecte sus dos posiciones
    for (const valor of numeros.keys()) {
      if (!this.caminoConecta(valor)) return;
    }

    //3. No deben quedar celdas vacías sin caminoId
    for (let fila of this.tablero) {
      for (let celda of fila) {
        if (celda.valor === null && celda.caminoId === undefined) return;
      }
    }

    // Show victory modal instead of alert
    this.showVictoryModal = true;
  }

  // Close victory modal
  closeVictoryModal(): void {
    this.showVictoryModal = false;
  }

  private caminoConecta(valor: number): boolean {
    //Encuentra los dos puntos del valor y realiza BFS sobre caminoId == valor
    const posiciones: Posicion[] = [];
    for (let i = 0; i < this.tablero.length; i++) {
      for (let j = 0; j < this.tablero[i].length; j++) {
        if (this.tablero[i][j].valor === valor) posiciones.push({ i, j });
      }
    }
    if (posiciones.length !== 2) return false;

    const [start, target] = posiciones;
    const visitados = new Set<string>([`${start.i}-${start.j}`]);
    const cola: Posicion[] = [start];

    const vecinos = (p: Posicion): Posicion[] => [
      { i: p.i + 1, j: p.j },
      { i: p.i - 1, j: p.j },
      { i: p.i, j: p.j + 1 },
      { i: p.i, j: p.j - 1 }
    ].filter(v => v.i >= 0 && v.i < this.tablero.length && v.j >= 0 && v.j < this.tablero[0].length);

    while (cola.length) {
      const actual = cola.shift()!;
      for (const n of vecinos(actual)) {
        const celda = this.tablero[n.i][n.j];
        if (celda.caminoId === valor || celda.valor === valor) {
          const key = `${n.i}-${n.j}`;
          if (!visitados.has(key)) {
            if (n.i === target.i && n.j === target.j) return true;
            visitados.add(key);
            cola.push(n);
          }
        }
      }
    }
    return false;
  }
}
