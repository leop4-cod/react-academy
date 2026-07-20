# Codecademy - Plataforma Educativa Frontend

## Descripción General del Proyecto

Este proyecto consiste en una aplicación web frontend desarrollada en ReactJS con TypeScript y Vite, construida bajo el patrón de Arquitectura Limpia (Clean Architecture). La aplicación consume una API REST desarrollada en Django y Django REST Framework, ofreciendo una sección pública de exploración académica y una sección privada de administración protegida mediante autenticación JWT y control de acceso basado en roles (RBAC).

El sistema permite gestionar de manera integral el ciclo educativo: catálogo de cursos, lecciones interactivas, evaluaciones con calificación en tiempo real, emisión de certificados verificables, sistema de foros de debate, bitácora de reseñas y administración de usuarios.

---

## Objetivos del Sistema

### Objetivo General
Desarrollar una interfaz de usuario frontend robusta, escalable y accesible en ReactJS que se integre de forma sincrónica con una API REST en Django, garantizando el cumplimiento de las reglas de negocio académicas y la protección de recursos según el rol del usuario.

### Objetivos Específicos
- Construir una interfaz pública intuitiva con catálogo de cursos, filtros por categoría y búsqueda en tiempo real.
- Implementar autenticación segura basada en tokens JWT con persistencia de sesión e inyección en cabeceras HTTP.
- Proteger rutas privadas mediante componentes de enrutamiento dinámico que restringen el acceso a usuarios no autenticados.
- Implementar control de acceso granular por roles (Administrador, Profesor, Estudiante).
- Consumir endpoints de la API REST para operaciones CRUD de cursos, lecciones, evaluaciones, matrículas y certificados.
- Diseñar un panel de administración usable con tablas responsivas, formularios en modales, estados de carga y manejo de errores.
- Configurar un pipeline de despliegue continuo (CI/CD) automatizado mediante GitHub Actions.

---

## Arquitectura del Proyecto (Clean Architecture)

La estructura del código fuente sigue una separación estricta de responsabilidades dividida en cuatro capas principales:

```
src/
├── domain/                      # Capa de Dominio (Reglas de negocio puras)
│   ├── entities/                # Modelos y entidades de dominio
│   ├── enums/                   # Enumeraciones de roles y estados
│   ├── exceptions/              # Excepciones personalizadas del dominio
│   ├── ports/                   # Interfaces de repositorios (Contratos)
│   └── services/                # Servicios puros de dominio
│
├── application/                 # Capa de Aplicación (Casos de uso y DTOs)
│   ├── use-cases/               # Lógica de casos de uso (Auth, Cursos, Matrículas)
│   └── dtos/                    # Objetos de transferencia de datos
│
├── infrastructure/              # Capa de Infraestructura (Implementaciones externas)
│   ├── config/                  # Variables de entorno y configuración general
│   ├── http/                    # Cliente Axios, interceptores y manejo de API
│   ├── storage/                 # Persistencia de token en LocalStorage
│   ├── adapters/                # Adaptadores que implementan los ports del dominio
│   └── factories/               # Factorías para inyección de dependencias
│
└── presentation/                # Capa de Presentación (Interfaz de Usuario)
    ├── theme/                   # Variables de diseño, colores y tokens visuales
    ├── utils/                   # Utilidades de formato y helpers
    ├── store/                   # Estado global administrado con Zustand
    ├── pages/                   # Vistas principales (Públicas, Auth, Dashboard)
    ├── components/              # Componentes reutilizables de UI
    └── router/                  # Configuración de rutas públicas y privadas
```

---

## Módulos Funcionales del Sistema

1. **Módulo de Autenticación y Perfil**: Inicio de sesión mediante JWT, almacenamiento seguro de token, refresco de estado y edición de datos del usuario con carga de avatar.
2. **Módulo de Cursos**: Explorador público y privado con búsqueda por palabras clave, filtrado por categorías, niveles de dificultad y gestión CRUD (Crear, Editar, Eliminar, Subir Foto).
3. **Módulo de Lecciones y Aula Virtual**: Visualización del temario del curso, reproductor de contenido multimedia, marcado de lecciones completadas y foro Q&A interactivo por clase.
4. **Módulo de Evaluaciones (Quizzes)**: Sistema interactivo de preguntas de opción múltiple, evaluación automatizada con puntaje porcentual y registro de intentos en la API.
5. **Módulo de Certificados**: Emisión automática e instantánea de diplomas tras aprobar evaluaciones o completar requisitos, con código de verificación único e impresión en formato PDF.
6. **Módulo de Matrículas y Wishlist**: Conexión de alumnos a aulas académicas y guardado de cursos de interés en radar personal.
7. **Módulo de Administración**: Panel de control con métricas clave y pestañas de gestión para Administradores y Profesores.

---

## Control de Acceso por Roles (RBAC)

La plataforma aplica restricciones reales tanto a nivel de navegación como de acciones dentro de la interfaz:

| Rol | Permisos y Accesos | Restricciones Aplicadas |
| :--- | :--- | :--- |
| **ADMIN** | Acceso total al Panel de Gestión, CRUD completo de Cursos, Lecciones, Categorías, Subcategorías, Etiquetas, Evaluaciones y cambio de roles de usuarios. | Ninguna. |
| **TEACHER (Profesor)** | Creación y edición de Cursos propios, gestión de lecciones de sus materias y evaluación de estudiantes. | No puede eliminar el sistema base ni modificar la asignación del Administrador Principal. |
| **STUDENT (Estudiante)** | Exploración de catálogo público, inscripción a cursos, acceso al Aula de Aprendizaje, realización de evaluaciones y emisión de certificados. | Menú de Administración oculto. Intentos de navegación directa a `/dashboard/management` son redirigidos automáticamente a la vista General. |

---

## Requisitos del Sistema y Variables de Entorno

### Requisitos Previos
- **Node.js**: Versión 18.0.0 o superior (Recomendado v22.x).
- **npm**: Versión 9.0.0 o superior.

### Configuración de Variables de Entorno
Cree un archivo `.env` en la raíz del proyecto basándose en la siguiente plantilla:

```env
VITE_API_URL=https://codeacademy-api.uaeftt-ute.site/api
```

---

## Instrucciones de Instalación y Ejecución

1. **Clonar el repositorio git**:
   ```bash
   git clone https://github.com/usuario/react-academy.git
   cd react-academy
   ```

2. **Instalar dependencias del proyecto**:
   ```bash
   npm install
   ```

3. **Ejecutar en entorno de desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

4. **Verificación de tipos TypeScript**:
   ```bash
   npx tsc --noEmit
   ```

5. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## Credenciales de Prueba

Para probar el control de acceso por roles y el consumo de la API, puede utilizar las siguientes cuentas de prueba:

- **Administrador**:
  - Correo: `admin@codeacademy.com`
  - Rol: Admin (Acceso total al Panel de Gestión)

- **Profesor**:
  - Correo: `profesor@codeacademy.com`
  - Rol: Teacher (Gestión de contenido de instrucción)

- **Estudiante**:
  - Correo: `estudiante@codeacademy.com`
  - Rol: Student (Acceso a catálogo, aulas, exámenes y certificados)

---

## Evidencia Funcional y Capturas del Sistema

### 1. Pantalla Pública Principal (Landing Page)
Interfaz pública accesible sin autenticación previa. Presenta el banner principal, los objetivos de la academia, navegación superior y la grilla de cursos públicos obtenidos dinámicamente desde la API REST.

### 2. Pantalla de Autenticación (Login)
Formulario de inicio de sesión que valida las credenciales contra la API de Django (`/auth/login/`). Al responder exitosamente, guarda el token JWT en almacenamiento persistente e inyecta la sesión.

### 3. Dashboard Privado
Menú privado adaptado según el rol del usuario autenticado. Muestra las métricas generales de nodo: cursos inscritos, diplomas obtenidos y alertas de seguridad.

### 4. Consumo de API en Listados (Explorador de Cursos)
Grilla interactiva de cursos que consume los datos de la API REST. Incluye barra de búsqueda por texto, filtro dinámico por categoría y badges de estado de matriculación.

### 5. Formulario de Creación / Edición (Panel de Administración)
Modal administrativo para compilación de cursos. Permite ingresar título, precio, nivel, categoría, profesor asignado y subir la imagen del curso mediante peticiones `multipart/form-data`.

### 6. Restricción por Rol (Acceso Bloqueado)
Ejemplo de control de acceso: un usuario con rol Estudiante no visualiza la pestaña de Administración. Si intenta acceder directamente por URL, el sistema bloquea la renderización y redirige la navegación.

---

## Documentación del Despliegue CI/CD

El proyecto cuenta con un flujo de Integración Continua y Despliegue Continuo (CI/CD) automatizado mediante GitHub Actions, definido en el archivo `.github/workflows/deploy.yml`.

### Pipeline de Despliegue Automatizado

Cada vez que se realiza un evento `push` a la rama principal (`main`), se desencadena el flujo de trabajo automático compuesto por los siguientes pasos:

1. **Checkout del Código**: Extracción del código fuente desde la rama `main` en un contenedor limpio Ubuntu Linux (`ubuntu-latest`).
2. **Configuración del Entorno Node.js**: Instalación de Node.js v22 con caché optimizado de paquetes `npm`.
3. **Inyección de Variables de Entorno**: Creación dinámica del archivo `.env.production` utilizando el secreto configurado en el repositorio (`secrets.REACT_ENV`).
4. **Instalación de Dependencias**: Ejecución de `npm install` para resolver todos los paquetes requeridos de forma limpia.
5. **Compilación de Producción**: Ejecución de `npm run build`, que invoca la verificación de tipos de TypeScript (`tsc -b`) y la empaquetación estificada con Vite en la carpeta `dist/`.
6. **Transferencia Segura al Servidor (SCP)**: Uso de `appleboy/scp-action` para transferir los archivos compilados del paquete `dist/` al directorio temporal `/tmp/react_build` del servidor VPS remoto mediante llaves SSH.
7. **Despliegue y Recarga de Servidor Web (Nginx)**: Ejecución de comandos SSH remotos (`appleboy/ssh-action`) para:
   - Crear y limpiar el directorio de producción `/var/www/react-app`.
   - Copiar el nuevo build empaquetado a la ruta del servidor web.
   - Ajustar permisos de usuario para el proceso `www-data`.
   - Validar sintaxis del servidor Nginx (`nginx -t`).
   - Recargar el servicio Nginx (`systemctl reload nginx`) de forma transparente sin caída del servicio.

---

## Licencia

Este proyecto forma parte del programa académico de desarrollo web fullstack y está bajo la licencia MIT.
