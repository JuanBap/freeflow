# FreeFlow Frontend

Una aplicación frontend desarrollada con Angular 16 que incluye algoritmos base y tableros interactivos.

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

 