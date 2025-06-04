import os
import time
import csv
from collections import defaultdict
import sys

# Importar el algoritmo
sys.path.append('algoritmos base')
from freeflowAlgorithm import resolver_tablero_conexiones


def parsear_tablero(ruta_archivo):
    """
    Parsea un archivo de tablero y devuelve el tamaño y los puntos extremos.
    
    Args:
        ruta_archivo (str): Ruta al archivo del tablero
        
    Returns:
        tuple: (tamaño_tablero, diccionario_puntos_extremos)
    """
    try:
        with open(ruta_archivo, 'r', encoding='utf-8') as archivo:
            lineas = [linea.strip() for linea in archivo.readlines() if linea.strip()]
        
        # Primera línea: tamaño del tablero
        primera_linea = lineas[0].replace(' ', '')  # Remover espacios
        tamaño_tablero = int(primera_linea.split(',')[0])
        
        # Resto de líneas: puntos extremos
        diccionario_puntos_extremos = defaultdict(list)
        
        for linea in lineas[1:]:
            if linea:  # Ignorar líneas vacías
                linea_limpia = linea.replace(' ', '')  # Remover espacios
                partes = linea_limpia.split(',')
                if len(partes) >= 3:
                    fila, columna, color = map(int, partes[:3])
                    # Convertir a índice base 0
                    diccionario_puntos_extremos[color].append((fila - 1, columna - 1))
        
        return tamaño_tablero, diccionario_puntos_extremos
        
    except Exception as e:
        print(f"Error al parsear {ruta_archivo}: {e}")
        return None, None


def parsear_nombre_tablero(nombre_archivo):
    """
    Parsea el nombre del archivo para extraer información sobre si tiene solución.
    
    Args:
        nombre_archivo (str): Nombre del archivo (ej: "tablero_5x5_s1.txt")
        
    Returns:
        tuple: (tamaño, tiene_solucion_esperada, numero_caso)
    """
    try:
        # Remover la extensión .txt
        nombre_base = nombre_archivo.replace('.txt', '')
        
        # Buscar patrón: tablero_NxN_s/n[número]
        partes = nombre_base.split('_')
        
        if len(partes) >= 3:
            # Extraer tamaño (ej: "5x5" -> 5)
            tamaño_str = partes[1]  # "5x5"
            tamaño = int(tamaño_str.split('x')[0])
            
            # Extraer si tiene solución (ej: "s1" -> True, "n2" -> False)
            info_solucion = partes[2]  # "s1" o "n2"
            tiene_solucion = info_solucion.startswith('s')
            numero_caso = int(info_solucion[1:]) if len(info_solucion) > 1 else 1
            
            return tamaño, tiene_solucion, numero_caso
        
    except Exception as e:
        print(f"Error al parsear nombre {nombre_archivo}: {e}")
    
    return None, None, None


def ejecutar_test_tablero(ruta_archivo):
    """
    Ejecuta el algoritmo en un tablero específico y mide el rendimiento.
    
    Args:
        ruta_archivo (str): Ruta al archivo del tablero
        
    Returns:
        dict: Resultados del test con métricas de rendimiento
    """
    nombre_archivo = os.path.basename(ruta_archivo)
    
    # Parsear información del nombre del archivo
    tamaño_nombre, tiene_solucion_esperada, numero_caso = parsear_nombre_tablero(nombre_archivo)
    
    resultado = {
        'archivo': nombre_archivo,
        'ruta': ruta_archivo,
        'resuelto': False,
        'tiempo_segundos': 0.0,
        'tamaño_tablero': 0,
        'num_colores': 0,
        'tiene_solucion_esperada': tiene_solucion_esperada,
        'numero_caso': numero_caso,
        'error': None
    }
    
    try:
        # Parsear el tablero
        tamaño_tablero, puntos_extremos = parsear_tablero(ruta_archivo)
        
        if tamaño_tablero is None:
            resultado['error'] = "Error en parseo"
            return resultado
            
        resultado['tamaño_tablero'] = tamaño_tablero
        resultado['num_colores'] = len(puntos_extremos)
        
        # Medir tiempo de ejecución
        tiempo_inicio = time.time()
        solucion = resolver_tablero_conexiones(tamaño_tablero, puntos_extremos)
        tiempo_fin = time.time()
        
        resultado['tiempo_segundos'] = tiempo_fin - tiempo_inicio
        resultado['resuelto'] = solucion is not None
        
        if resultado['resuelto']:
            print(f"✅ {nombre_archivo}: RESUELTO en {resultado['tiempo_segundos']:.3f}s")
        else:
            print(f"❌ {nombre_archivo}: NO RESUELTO en {resultado['tiempo_segundos']:.3f}s")
            
    except Exception as e:
        resultado['error'] = str(e)
        print(f"🔥 {nombre_archivo}: ERROR - {e}")
    
    return resultado


def ejecutar_todos_los_tests():
    """
    Ejecuta tests en todos los tableros de la carpeta 'tableros'.
    
    Returns:
        list: Lista de resultados de todos los tests
    """
    carpeta_tableros = '/Users/juanbaplo/Desktop/freeflow/frontend/tableros'
    
    if not os.path.exists(carpeta_tableros):
        print(f"❌ La carpeta '{carpeta_tableros}' no existe")
        return []
    
    # Obtener todos los archivos .txt de la carpeta tableros
    archivos_tablero = []
    for archivo in os.listdir(carpeta_tableros):
        if archivo.endswith('.txt'):
            ruta_completa = os.path.join(carpeta_tableros, archivo)
            archivos_tablero.append(ruta_completa)
    
    archivos_tablero.sort()  # Ordenar para consistencia
    
    print(f"🚀 Iniciando tests en {len(archivos_tablero)} tableros...\n")
    
    resultados = []
    for ruta_archivo in archivos_tablero:
        resultado = ejecutar_test_tablero(ruta_archivo)
        resultados.append(resultado)
    
    return resultados


def generar_csv(resultados, nombre_archivo_csv='resultados_tests.csv'):
    """
    Genera un archivo CSV con los resultados de todos los tests.
    
    Args:
        resultados (list): Lista de resultados de los tests
        nombre_archivo_csv (str): Nombre del archivo CSV a generar
    """
    if not resultados:
        print("No hay resultados para generar CSV")
        return
    
    # Definir las columnas del CSV
    columnas = [
        'archivo',
        'tamaño_tablero',
        'num_colores',
        'tiene_solucion_esperada',
        'solucion_encontrada',
        'tiempo_segundos',
        'numero_caso',
        'correcto',  # Si la solución encontrada coincide con la esperada
        'error'
    ]
    
    try:
        with open(nombre_archivo_csv, 'w', newline='', encoding='utf-8') as archivo_csv:
            escritor = csv.DictWriter(archivo_csv, fieldnames=columnas)
            
            # Escribir encabezados
            escritor.writeheader()
            
            # Escribir datos
            for resultado in resultados:
                fila = {
                    'archivo': resultado['archivo'],
                    'tamaño_tablero': resultado['tamaño_tablero'],
                    'num_colores': resultado['num_colores'],
                    'tiene_solucion_esperada': 'Sí' if resultado.get('tiene_solucion_esperada') else 'No',
                    'solucion_encontrada': 'Sí' if resultado['resuelto'] else 'No',
                    'tiempo_segundos': f"{resultado['tiempo_segundos']:.6f}",
                    'numero_caso': resultado.get('numero_caso', ''),
                    'correcto': '',
                    'error': resultado.get('error', '')
                }
                
                # Determinar si el resultado es correcto
                if resultado.get('error'):
                    fila['correcto'] = 'Error'
                elif resultado.get('tiene_solucion_esperada') is not None:
                    if resultado.get('tiene_solucion_esperada') == resultado['resuelto']:
                        fila['correcto'] = 'Sí'
                    else:
                        fila['correcto'] = 'No'
                else:
                    fila['correcto'] = 'Desconocido'
                
                escritor.writerow(fila)
        
        print(f"📄 CSV generado: {nombre_archivo_csv}")
        
    except Exception as e:
        print(f"Error al generar CSV: {e}")


def generar_reporte(resultados):
    """
    Genera un reporte resumen de todos los tests ejecutados.
    
    Args:
        resultados (list): Lista de resultados de los tests
    """
    if not resultados:
        print("No hay resultados para reportar")
        return
    
    total_tests = len(resultados)
    resueltos = sum(1 for r in resultados if r['resuelto'])
    no_resueltos = sum(1 for r in resultados if not r['resuelto'] and not r['error'])
    errores = sum(1 for r in resultados if r['error'])
    
    tiempo_total = sum(r['tiempo_segundos'] for r in resultados)
    tiempo_promedio = tiempo_total / total_tests if total_tests > 0 else 0
    
    print("\n" + "="*60)
    print("📊 REPORTE FINAL")
    print("="*60)
    print(f"Total de tableros testados: {total_tests}")
    print(f"✅ Resueltos: {resueltos} ({resueltos/total_tests*100:.1f}%)")
    print(f"❌ No resueltos: {no_resueltos} ({no_resueltos/total_tests*100:.1f}%)")
    print(f"🔥 Errores: {errores} ({errores/total_tests*100:.1f}%)")
    print(f"⏱️  Tiempo total: {tiempo_total:.3f} segundos")
    print(f"⏱️  Tiempo promedio: {tiempo_promedio:.3f} segundos")
    
    # Estadísticas de precisión
    resultados_con_expectativa = [r for r in resultados if r.get('tiene_solucion_esperada') is not None and not r['error']]
    if resultados_con_expectativa:
        correctos = sum(1 for r in resultados_con_expectativa 
                       if r.get('tiene_solucion_esperada') == r['resuelto'])
        precision = correctos / len(resultados_con_expectativa) * 100
        print(f"🎯 Precisión: {correctos}/{len(resultados_con_expectativa)} ({precision:.1f}%)")
    
    # Tableros más rápidos y más lentos
    resultados_validos = [r for r in resultados if not r['error']]
    if resultados_validos:
        mas_rapido = min(resultados_validos, key=lambda x: x['tiempo_segundos'])
        mas_lento = max(resultados_validos, key=lambda x: x['tiempo_segundos'])
        
        print(f"\n🏃 Más rápido: {mas_rapido['archivo']} ({mas_rapido['tiempo_segundos']:.3f}s)")
        print(f"🐌 Más lento: {mas_lento['archivo']} ({mas_lento['tiempo_segundos']:.3f}s)")
    
    # Detalle por tamaño de tablero
    print(f"\n📏 DETALLE POR TAMAÑO:")
    tamaños = defaultdict(list)
    for resultado in resultados:
        if not resultado['error']:
            tamaños[resultado['tamaño_tablero']].append(resultado)
    
    for tamaño in sorted(tamaños.keys()):
        tests_tamaño = tamaños[tamaño]
        resueltos_tamaño = sum(1 for t in tests_tamaño if t['resuelto'])
        tiempo_promedio_tamaño = sum(t['tiempo_segundos'] for t in tests_tamaño) / len(tests_tamaño)
        
        print(f"  {tamaño}x{tamaño}: {resueltos_tamaño}/{len(tests_tamaño)} resueltos, "
              f"promedio {tiempo_promedio_tamaño:.3f}s")
    
    # Lista de tableros no resueltos
    no_resueltos_lista = [r for r in resultados if not r['resuelto'] and not r['error']]
    if no_resueltos_lista:
        print(f"\n❌ TABLEROS NO RESUELTOS:")
        for resultado in no_resueltos_lista:
            print(f"  - {resultado['archivo']} ({resultado['tamaño_tablero']}x{resultado['tamaño_tablero']}, "
                  f"{resultado['num_colores']} colores)")
    
    # Lista de errores
    errores_lista = [r for r in resultados if r['error']]
    if errores_lista:
        print(f"\n🔥 ERRORES:")
        for resultado in errores_lista:
            print(f"  - {resultado['archivo']}: {resultado['error']}")


def main():
    """Función principal que ejecuta todos los tests y genera el reporte."""
    print("🧩 FREEFLOW ALGORITHM TESTER")
    print("="*40)
    
    # Ejecutar todos los tests
    resultados = ejecutar_todos_los_tests()
    
    # Generar CSV con resultados
    generar_csv(resultados)
    
    # Generar reporte final
    generar_reporte(resultados)


if __name__ == "__main__":
    main() 