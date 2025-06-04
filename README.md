# FreeFlow 

Una aplicación frontend desarrollada con Angular 16 que implementa un juego de conexión de números con algoritmos de resolución automática y análisis estadístico.

## 🎮 Descripción del Juego

FreeFlow es un puzzle de conexión donde el objetivo es conectar pares de números idénticos en un tablero mediante caminos ortogonales (horizontal y vertical), sin que los caminos se crucen entre sí y llenando completamente el tablero.

### 🎯 Objetivo
- Conectar cada par de números idénticos con un camino continuo
- Los caminos no pueden cruzarse entre sí
- Todas las celdas del tablero deben estar ocupadas al final
- Solo se permiten movimientos ortogonales (arriba, abajo, izquierda, derecha)

### 🎮 Cómo Jugar
1. **Iniciar trazo**: Haz clic en un número para comenzar a trazar un camino
2. **Trazar camino**: Arrastra el mouse por las celdas adyacentes para crear el camino
3. **Finalizar trazo**: Suelta el mouse sobre el número correspondiente para completar la conexión
4. **Borrar camino**: Haz clic en un extremo de un camino ya trazado para borrarlo
5. **Retroceder**: Durante el trazado, puedes retroceder pasando por celdas ya trazadas

### ✨ Características Principales

#### 🎮 Juego Manual
- **Interfaz intuitiva**: Trazado de caminos con mouse drag & drop
- **Validación en tiempo real**: El juego previene movimientos inválidos
- **Detección automática de victoria**: Modal de celebración al completar el puzzle
- **Sistema de retroceso**: Permite deshacer movimientos durante el trazado

#### 🤖 Resolución Automática
- **Algoritmo de backtracking**: Implementa heurística MRV (Minimum Remaining Values)
- **Resolución paso a paso**: Muestra la solución aplicando un camino cada segundo
- **Detección de tableros imposibles**: Identifica cuando no existe solución

#### 📊 Análisis Estadístico
- **Métricas del algoritmo**: 
  - Caminos explorados
  - Callejones sin salida encontrados
  - Caminos exitosos
  - Tiempo de ejecución
- **Historial de exploración**: Registro completo del proceso de resolución
- **Visualización de estadísticas**: Vista detallada del comportamiento del algoritmo

#### 📁 Gestión de Tableros
- **Tablero por defecto**: Tablero 7x7 precargado para comenzar a jugar
- **Carga desde archivo**: Importa tableros personalizados desde archivos de texto
- **Formato de archivo**: Sencillo formato CSV para definir tableros
- **Reinicio de tablero**: Limpia solo los caminos manteniendo los números originales

### 📋 Formato de Archivo de Tablero

Los tableros se definen en archivos de texto con el siguiente formato:

```
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
```

- **Primera línea**: `filas,columnas` del tablero
- **Líneas siguientes**: `fila,columna,valor` para cada número en el tablero
- Las coordenadas son 1-indexadas (comienzan en 1, no en 0)

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado en tu sistema:

- **Node.js** (versión 16 o superior)
- **npm** (incluido con Node.js)
- **Git**

### Verificar las versiones instaladas

```bash
node --version
npm --version
git --version
```

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd frontend
```

### 2. Instalar dependencias

Navega al directorio de la aplicación principal e instala las dependencias:

```bash
cd freeflow-ui
npm install
```

## ⚡ Ejecución

### Servidor de desarrollo

Para ejecutar la aplicación en modo desarrollo:

```bash
cd freeflow-ui
npm start
```

O alternativamente:

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`. La aplicación se recargará automáticamente si modificas algún archivo fuente.

### Modo de observación (watch)

Para compilar automáticamente los cambios durante el desarrollo:

```bash
npm run watch
```

## 🏗️ Construcción para producción

Para construir la aplicación para producción:

```bash
cd freeflow-ui
npm run build
```

Los archivos construidos se almacenarán en el directorio `dist/freeflow-ui/`.

## 📂 Estructura del proyecto

```
frontend/
├── algoritmos base/          # Algoritmos base del sistema
├── tableros/                # Configuraciones de tableros
├── freeflow-ui/             # Aplicación Angular principal
│   ├── src/
│   │   ├── app/
│   │   │   ├── algorithm-stats/  # Estadísticas de algoritmos
│   │   │   ├── grid/            # Componentes de grilla
│   │   │   └── model/           # Modelos de datos
│   │   └── assets/             # Recursos estáticos
│   ├── package.json           # Dependencias del proyecto
│   └── angular.json          # Configuración de Angular
└── README.md                 # Este archivo
```

## 🛠️ Tecnologías utilizadas

- **Angular 16** - Framework principal
- **TypeScript** - Lenguaje de programación
- **TailwindCSS** - Framework de CSS (configurado con PostCSS)
- **RxJS** - Programación reactiva

## 📝 Scripts disponibles

En el directorio `freeflow-ui/`, puedes ejecutar:

- `npm start` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run watch` - Construye automáticamente los cambios
- `npm test` - Ejecuta las pruebas unitarias
- `ng generate component [nombre]` - Genera un nuevo componente

## 🔧 Configuración adicional

### Angular CLI

El proyecto utiliza Angular CLI versión 16.2.16. Para comandos adicionales de Angular CLI:

```bash
ng help
```

### TailwindCSS

El proyecto incluye TailwindCSS configurado. Los estilos se pueden encontrar en:
- `src/styles.css` - Estilos globales
- `tailwind.config.js` - Configuración de TailwindCSS

## 🐛 Solución de problemas

### Error de dependencias

Si encuentras errores al instalar dependencias:

```bash
cd freeflow-ui
rm -rf node_modules package-lock.json
npm install
```

### Puerto ocupado

Si el puerto 4200 está ocupado, puedes especificar otro puerto:

```bash
ng serve --port 4201
```

### Cache de Angular

Si experimentas problemas de cache:

```bash
ng cache clean
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT

## 📞 Contacto

## 🚀 Funcionalidades Avanzadas

### 🧠 Algoritmo de Resolución

La aplicación incluye un sofisticado algoritmo de resolución automática que:

1. **Análisis de endpoints**: Identifica automáticamente los pares de números a conectar
2. **Heurística MRV**: Prioriza los pares con menor número de caminos posibles
3. **Backtracking inteligente**: Explora soluciones de manera eficiente
4. **Poda temprana**: Descarta ramas imposibles para optimizar el rendimiento

### 📈 Sistema de Estadísticas

Después de ejecutar el auto-resolvedor, puedes acceder a estadísticas detalladas que incluyen:

- **Caminos explorados**: Número total de caminos intentados
- **Eficiencia del algoritmo**: Ratio de éxito vs. callejones sin salida
- **Tiempo de ejecución**: Performance del algoritmo en milisegundos
- **Historial completo**: Estados del tablero durante la exploración
- **Análisis de fallas**: Razones específicas de por qué falló cada intento

### 🎯 Controles del Juego

| Acción | Método |
|--------|--------|
| Iniciar trazo | Clic en un número |
| Trazar camino | Arrastar mouse por celdas adyacentes |
| Finalizar camino | Soltar mouse en número correspondiente |
| Borrar camino | Clic en extremo de camino existente |
| Retroceder | Pasar por celdas ya trazadas |
| Reiniciar tablero | Botón "Reiniciar" |
| Auto-resolver | Botón "Auto Resolver" |
| Ver estadísticas | Botón "Ver Estadísticas" (después de auto-resolver) | 