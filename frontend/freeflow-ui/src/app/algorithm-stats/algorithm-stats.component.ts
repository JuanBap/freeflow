import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Celda } from '../model/celda.model';

interface Posicion { i: number; j: number; }

interface EstadisticasAlgoritmo {
  caminosExplorados: number;
  callejonesSinSalida: number;
  caminosExitosos: number;
  historialExploracion: {
    numero: number;
    camino: Posicion[];
    exitoso: boolean;
    razonFallo?: string;
    tableroEstado: number[][];
  }[];
  tiempoEjecucion: number;
}

@Component({
  selector: 'app-algorithm-stats',
  templateUrl: './algorithm-stats.component.html',
  styleUrls: ['./algorithm-stats.component.css']
})
export class AlgorithmStatsComponent implements OnInit {
  estadisticas: EstadisticasAlgoritmo | null = null;
  tableroVisualizacion: Celda[][] = [];
  estadoActual: number = 0;
  mostrandoEstado: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // Obtener estadísticas del estado o parámetros de ruta
    this.estadisticas = history.state.estadisticas;
    
    if (!this.estadisticas) {
      // Si no hay estadísticas, redirigir al juego
      this.router.navigate(['/']);
      return;
    }

    // Inicializar tablero de visualización con el estado inicial
    if (this.estadisticas.historialExploracion.length > 0) {
      this.inicializarTableroVisualizacion(this.estadisticas.historialExploracion[0].tableroEstado);
    }
  }

  private inicializarTableroVisualizacion(tableroEstado: number[][]): void {
    this.tableroVisualizacion = tableroEstado.map(fila => 
      fila.map(valor => ({ valor: valor === 0 ? null : valor }))
    );
  }

  mostrarEstado(indice: number): void {
    if (indice >= 0 && indice < this.estadisticas!.historialExploracion.length) {
      this.estadoActual = indice;
      this.mostrandoEstado = true;
      const estado = this.estadisticas!.historialExploracion[indice];
      this.aplicarEstadoTablero(estado.tableroEstado, estado.camino, estado.exitoso);
    }
  }

  private aplicarEstadoTablero(tableroEstado: number[][], camino: Posicion[], exitoso: boolean): void {
    // Reinicializar tablero
    this.inicializarTableroVisualizacion(tableroEstado);
    
    // Marcar caminos con sus IDs
    for (let i = 0; i < tableroEstado.length; i++) {
      for (let j = 0; j < tableroEstado[i].length; j++) {
        const valor = tableroEstado[i][j];
        const celda = this.tableroVisualizacion[i][j];
        
        if (valor !== 0) {
          celda.caminoId = valor;
          if (celda.valor === null) {
            // Es una celda de camino, marcar si es del camino actual
            const esCaminoActual = camino.some(pos => pos.i === i && pos.j === j);
            if (esCaminoActual) {
              celda.esDelCaminoActual = true;
              celda.caminoExitoso = exitoso;
            }
          }
        }
      }
    }
  }

  volverAlJuego(): void {
    this.router.navigate(['/']);
  }

  ocultarEstado(): void {
    this.mostrandoEstado = false;
    this.inicializarTableroVisualizacion(this.estadisticas!.historialExploracion[0].tableroEstado);
  }
}
