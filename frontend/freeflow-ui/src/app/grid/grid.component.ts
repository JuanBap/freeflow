import { Component } from '@angular/core';
//Modelo de celda
import { Celda } from '../model/celda.model';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent {
  //Tablero de juego - vacío
  tablero: Celda[][] = [];

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

    //Inicializar el tablero vacío
    this.tablero = this.crearTableroVacio(filas, columnas);

    //Asignar los valores al tablero
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

    //Extraer del texto
    const lineas = tableroInicial.trim().split('\n').map(linea => linea.trim());

    //Llenar el tablero desde las líneas
    this.llenarTableroDesdeLineas(lineas);
  }

  //Crear tablero mediante archivo de texto
  cargarTableroPorArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      const lector = new FileReader();

      lector.onload = () => {
        const contenido = lector.result as string;
        const lineas = contenido.trim().split('\n').map(linea => linea.trim());

        //Llenar el tablero desde las líneas del archivo
        this.llenarTableroDesdeLineas(lineas);
      };

      lector.readAsText(archivo);
    }
  }
}
