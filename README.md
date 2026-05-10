# 📈 TradingPulse

**TradingPulse** es un sistema integral multiplataforma (Web, Escritorio y Móvil) para la monitorización financiera y la ejecución de operaciones de trading simulado en tiempo real. Está diseñado sobre una arquitectura escalable orientada al análisis de datos financieros en tiempo real, priorizando la seguridad, la alta disponibilidad y la experiencia del usuario final.

---

## ✨ Características Principales

- **📊 Datos en Tiempo Real:** Integra la API de Binance mediante WebSockets multiplexados. Esto permite el *streaming* simultáneo de múltiples activos sin colisión de datos ni fugas de memoria en el cliente.
- **🛠️ Análisis Técnico Avanzado:** Incluye un motor matemático integrado que renderiza en tiempo real el indicador RSI y permite el trazado dinámico de retrocesos de Fibonacci directamente sobre el gráfico de velas.
- **🔐 Jerarquía de Usuarios y Auditoría:** Implementa un sistema de roles de triple nivel (Master, Admin, Usuario) con validación cruzada. Garantiza la trazabilidad absoluta mediante registros inmutables (`user_logs` y `admin_logs`).
- **📱 Despliegue Omnicanal:** El sistema cuenta con una aplicación web *responsive*, una aplicación de escritorio nativa (Electron) y una aplicación móvil (APK empaquetada con Capacitor/Android Studio).
- **📄 Generación de Informes:** Permite la creación dinámica de facturas y justificantes de operaciones en formato PDF (jsPDF + AutoTable).

---

## 💻 Stack Tecnológico

**Frontend:**
- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- React Router para enrutamiento SPA

**Backend:**
- [Node.js](https://nodejs.org/) + Express
- Arquitectura RESTful + WebSockets
- Algoritmos matemáticos y lógica transaccional

**Base de Datos:**
- [Apache Cassandra](https://cassandra.apache.org/) (NoSQL Columnar)
- Clúster dockerizado con soporte para particionamiento y replicación.

**DevOps & Infraestructura:**
- [Docker](https://www.docker.com/) & Docker Compose
- [Jenkins](https://www.jenkins.io/) para flujos CI/CD automatizados
- Kubernetes para autoescalado y alta disponibilidad

---

## ⚙️ Requisitos Previos

Asegúrese de tener instalados en el sistema los siguientes componentes antes de iniciar:
- [Node.js](https://nodejs.org/) (v18 o superior)
- [Docker](https://www.docker.com/) y Docker Compose
- [Git](https://git-scm.com/)

---

## 🚀 Instalación y Despliegue Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/Pinguinazo/tfg-plataforma-trading
cd tradingpulse

```

### 2. Levantar la infraestructura (Base de Datos y CI/CD)

El proyecto incluye un archivo `docker-compose.yml` que levanta el clúster de Apache Cassandra y el contenedor de Jenkins.

```bash
docker-compose up -d

```

*(Nota: Espera aproximadamente 60 segundos a que Cassandra complete su inicialización antes de arrancar el backend. El backend implementa reintentos automáticos con backoff progresivo, pero es recomendable respetar este margen).*

### 3. Configuración del Backend

```bash
cd backend
# Instalar dependencias
npm install
# Iniciar el servidor de desarrollo
npm run dev

```

### 4. Configuración del Frontend

En una nueva terminal, levante la interfaz de usuario:

```bash
cd frontend
# Instalar dependencias
npm install
# Iniciar Vite en red local (LAN)
npm run dev -- --host 0.0.0.0

```

---

## 🌐 Endpoints Completos de la API

### 👤 Gestión de Usuarios (Público / Usuario)
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/register` | Público | Registra un nuevo usuario en la plataforma con validación de datos y roles. |
| `POST` | `/api/users/login` | Público | Autentica usuarios, admins o masters, validando el rol y devolviendo credenciales. |
| `PUT` | `/api/users/:id/update` | Usuario | Actualiza los datos del perfil de un usuario (username, email, password, tier). |
| `PATCH`| `/api/users/:id/delete` | Usuario/Admin| Realiza un borrado lógico (*soft-delete*) de la cuenta de usuario. |
| `POST` | `/api/users/sync` | Usuario | Sincroniza de forma forzada el balance, depósitos y cartera (*holdings*) de un usuario. |

### ⚙️ Sistema y Salud
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Público | Comprueba el estado de salud del servidor (devuelve status UP). |

### 💱 Operativa y Transacciones
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/trade` | Usuario | Ejecuta una transacción (compra, venta, depósito o retiro) y actualiza saldos. |
| `GET` | `/api/users/:id/transactions`| Usuario | Recupera el historial cronológico de transacciones de un usuario específico. |

### 🛡️ Panel de Administración (Master / Admin)
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin/Master | Recupera estadísticas globales: usuarios activos, MRR, ARR y eliminaciones pendientes. |
| `GET` | `/api/admin/users` | Admin/Master | Recupera la lista completa de usuarios registrados y su estado. |
| `PUT` | `/api/admin/users/:id/update` | Admin/Master | Permite a la administración modificar los datos o el plan (*tier*) de un usuario. |
| `PATCH`| `/api/admin/users/:id/recover`| Admin/Master | Restaura una cuenta de usuario que se encontraba en estado de borrado lógico. |
| `GET` | `/api/admin/users/:id/logs` | Admin/Master | Recupera los registros de actividad individuales (`user_logs`) de un cliente. |
| `GET` | `/api/admin/logs` | Admin/Master | Recupera el historial global de acciones ejecutadas por la administración (`admin_logs`). |
| `GET` | `/api/admin/nodes` | Admin/Master | Devuelve el estado, IP y rol de los nodos físicos del clúster de Cassandra. |

### 👑 Gestión de Administradores (Exclusivo Master)
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/managers` | Master | Lista todos los administradores secundarios creados en el sistema. |
| `POST` | `/api/admin/managers` | Master | Crea un nuevo administrador secundario. |
| `PUT` | `/api/admin/managers/:id` | Master | Modifica las credenciales o el correo de un administrador secundario. |
| `DELETE`| `/api/admin/managers/:id` | Master | Revoca el acceso y elimina a un administrador secundario. |
| `PUT` | `/api/admin/master/:id` | Master | Actualiza los datos de perfil y seguridad de la propia cuenta Master. |

---

## 🛡️ Seguridad Implementada

* **Pentesting preventivo:** Se han realizado simulaciones y se han corregido las vulnerabilidades detectadas durante las pruebas de estrés.
* **Sanitización de datos:** Todas las entradas de formularios utilizan validaciones HTML5 y expresiones regulares (Regex) estrictas, tanto en el *frontend* como en el *backend*.
* **Políticas CORS:** Las políticas CORS están configuradas de manera estricta en Express para permitir únicamente peticiones verificadas desde la red local o el entorno de producción.
* **Prevención de duplicidades:** Incluye el algoritmo `getEmailOwnerId` que escanea las tres tablas maestras simultáneamente para evitar la existencia de correos duplicados entre los distintos roles.

---