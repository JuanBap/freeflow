// Modelo de celda para el tablero
export interface Celda {
    //Numero de la celda
    valor: number | null;
    //Id del camino que pasa por esta celda
    caminoId?: number;
    //Direccion del pipe (up, down, left, right )
    direccion?: string;
    // Propiedades para visualización de estadísticas
    esDelCaminoActual?: boolean;
    caminoExitoso?: boolean;
}