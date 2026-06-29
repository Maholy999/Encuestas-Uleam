# Sistema de Encuestas ULEAM

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

Un sistema de encuestas moderno e interactivo desarrollado en **Vue 3** y **Vite** para la **Universidad Laica Eloy Alfaro de Manabí (ULEAM)**. Esta plataforma permite la creación, distribución y análisis de encuestas para estudiantes, docentes, personal administrativo y administradores de sistemas de la institución.

## 🚀 Características Principales

- **Gestión de Roles:** Perfiles específicos para administradores, estudiantes, docentes y personal administrativo.
- **Creación de Encuestas:** Herramienta interactiva para que los administradores creen encuestas personalizadas.
- **Visualización y Resultados:** Panel de control para análisis de respuestas y tabulación de encuestas finalizadas.
- **Modo Oscuro (Dark Mode):** Soporte completo para temas claro y oscuro, configurable por el usuario.
- **Respaldo de Base de Datos:** Exportación y envío de datos de encuestas a través de EmailJS, además de descarga local en formato JSON.
- **Diseño Responsivo:** Completamente adaptable a dispositivos móviles, tablets y ordenadores de escritorio.
- **Internacionalización:** Interfaz adaptada con soporte a múltiples idiomas (Español / Inglés).

## 🛠 Tecnologías Utilizadas

- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Herramienta de Construcción:** Vite
- **Navegación:** Vue Router
- **Estilos:** CSS Vanilla (Variables nativas y personalización completa)
- **Correos / Notificaciones:** EmailJS
- **Íconos:** Tabler Icons

## ⚙️ Requisitos Previos

Asegúrate de tener instalados los siguientes componentes antes de ejecutar este proyecto:
- [Node.js](https://nodejs.org/es/) (Versión 16+ recomendada)
- NPM (Incluido con Node.js) o Yarn

## 📦 Instalación y Configuración

Sigue estos pasos para instalar y ejecutar el proyecto localmente:

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/proyecto-encuesta-uleam.git
   cd proyecto-encuesta-uleam
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Ejecuta el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   *El servidor se abrirá, por lo general, en `http://localhost:5173`.*

4. **Compilar para producción (Build)**
   ```bash
   npm run build
   ```

## 🔒 Variables de Entorno (EmailJS)

Para el funcionamiento de los respaldos y envío de correos de recuperación, debes configurar tus credenciales de EmailJS en el código o usando variables de entorno `.env`:
- `Service ID`
- `Template ID`
- `Public Key`

*(Actualmente estos se configuran directamente dentro de los componentes correspondientes como `AdminConfig.vue`).*

## 📚 Estructura del Proyecto

```
📦 src
 ┣ 📂 assets       # Imágenes, estilos globales y fuentes
 ┣ 📂 components   # Componentes reutilizables (Botones, Modales, Tarjetas)
 ┣ 📂 router       # Configuración de rutas (Vue Router)
 ┣ 📂 store        # Manejo del estado global de la aplicación
 ┣ 📂 utils        # Utilidades generales y generadores de reportes
 ┣ 📂 views        # Vistas principales (Login, Panel Administrador, Dashboard)
 ┣ 📜 App.vue      # Componente raíz
 ┗ 📜 main.js      # Punto de entrada de la aplicación
```

## 👥 Roles y Accesos (Datos Demo)

Para acceder a las demostraciones rápidas, el sistema cuenta con los siguientes perfiles de acceso:
- **Estudiante:** `c.gomez@live.uleam.edu.ec`
- **Docente:** `a.vargas@live.uleam.edu.ec`
- **Trabajador ULEAM:** `l.mendoza@live.uleam.edu.ec`
- **Administrador:** `admin@live.uleam.edu.ec`
*(Cualquier contraseña es válida en el modo demo si cumple con los requisitos del formato).*

---
**Desarrollado para la Universidad Laica Eloy Alfaro de Manabí (ULEAM) 🎓**
