# Mercado Express — Inventory API

API REST para la gestión de inventario de una tienda de mercado express:
registro de productos, control de stock, alertas automáticas de stock bajo y
generación/aprobación de órdenes de compra a proveedores.

Construida con **NestJS**, **Prisma ORM** y **PostgreSQL**.

🔗 **API desplegada:** [https://mercado-express-server.onrender.com](https://mercado-express-server.onrender.com)

📘 **Documentación (Swagger):** [https://mercado-express-server.onrender.com/api/docs](https://mercado-express-server.onrender.com/api/docs)

> ⚠️ El servicio está en el plan gratuito de Render, por lo que puede tardar
> unos segundos en responder si estuvo inactivo (cold start).

## Tabla de contenidos

- [Arquitectura](#arquitectura)
- [Módulos y funcionalidades](#módulos-y-funcionalidades)
- [Tecnologías](#tecnologías)
- [Cómo correr el proyecto](#cómo-correr-el-proyecto)
- [Endpoints](#endpoints)
- [Testing](#testing)
- [Estructura del proyecto](#estructura-del-proyecto)

## Arquitectura

El proyecto sigue un **monolito modular en capas** (layered monolith):
toda la aplicación corre en un único proceso/despliegue, pero el código está
organizado en módulos de dominio independientes (`products`, `alerts`,
`stock-movements`, `purchase-orders`) que se comunican entre sí mediante
inyección de dependencias de Nest, nunca accediendo directamente al `service`
o `repository` de otro módulo salvo a través de su interfaz pública exportada.

Se eligió este enfoque en lugar de microservicios porque el dominio es
pequeño y sus entidades están fuertemente relacionadas (un movimiento de
stock afecta a un producto, que puede disparar una alerta, que puede originar
una orden de compra): dividirlo en servicios separados añadiría complejidad
de red y consistencia distribuida sin un beneficio real a esta escala,
mientras que los módulos de Nest ya dan el mismo aislamiento de
responsabilidades dentro de un solo despliegue.

Cada módulo de dominio se organiza en **tres capas**, cada una con una única
responsabilidad:

```
Controller  →  Service  →  Repository  →  Prisma (PostgreSQL)
```

| Capa           | Responsabilidad                                                                                                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Controller** | Expone los endpoints HTTP. Recibe el DTO ya validado y delega en el `service`. No contiene lógica de negocio.                                                                                                     |
| **Service**    | Contiene las reglas de negocio (validaciones cruzadas, cálculos, orquestación de transacciones, mapeo a entidades de respuesta).                                                                                  |
| **Repository** | Única capa que conoce a Prisma. Traduce operaciones de negocio a queries (`findMany`, `create`, `update`, etc.).                                                                                                  |
| **Prisma**     | ORM + capa de acceso a datos sobre PostgreSQL. Reglas críticas (stock no negativo, una sola alerta activa por producto) están reforzadas también a nivel de base de datos con `CHECK` e índices únicos parciales. |

Código transversal reutilizable por todos los módulos vive en `src/common/`:

- `constants/`: mensajes de validación/negocio centralizados y códigos de error de Prisma, para evitar strings mágicos duplicados.
- `dto/`, `interfaces/`, `utils/`: paginación reutilizable (`PaginationDto`, `PaginationMeta`, `paginationMeta()`).
- `types/`: tipo `PrismaClientOrTx` que permite a los repositorios operar tanto con la instancia normal de Prisma como dentro de una transacción (`prisma.$transaction`).

## Módulos y funcionalidades

### `products` — Catálogo e inventario (RF-01, RF-06)

- `POST /products`: registra un producto validando nombre, SKU único
  alfanumérico, categoría, precio positivo, stock mínimo y proveedor.
- `GET /products`: consulta paginada del inventario con filtros combinables
  por categoría, proveedor, presencia de alerta activa y rango de stock
  (`stockMin`/`stockMax`).

### `stock-movements` — Movimientos de inventario (RF-02)

- `POST /products/:productId/stock-movements`: registra una entrada o salida
  de stock para un producto y actualiza su `currentStock` de forma
  transaccional. El historial de movimientos es inmutable (solo `create`).
  Después de cada movimiento, sincroniza automáticamente el estado de alerta
  del producto (módulo `alerts`).

### `alerts` — Alertas de stock bajo (RF-03)

- Se generan automáticamente (no vía endpoint) cuando el stock de un producto
  cae a su mínimo o por debajo, y se resuelven automáticamente cuando el
  stock se recupera. Solo puede existir una alerta `ACTIVA` por producto a la
  vez (reforzado con un índice único parcial en base de datos).
- `GET /alerts`: consulta paginada de alertas, filtrable por estado
  (`ACTIVA` o `RESUELTA`).

### `purchase-orders` — Órdenes de compra (RF-04, RF-05)

- `POST /purchase-orders`: crea una orden de compra para un producto. Puede
  vincularse opcionalmente a una alerta activa existente del mismo producto
  (`alertId`), pero no es un requisito: cualquier producto puede tener una
  orden manual. La cantidad debe ser al menos el doble del stock mínimo del
  producto.
- `PATCH /purchase-orders/:id/approve`: aprueba una orden pendiente.
- `PATCH /purchase-orders/:id/reject`: rechaza una orden pendiente,
  requiriendo un motivo de al menos 10 caracteres. No afecta al producto.
- `PATCH /purchase-orders/:id/receive`: marca una orden aprobada como
  recibida y, transaccionalmente, incrementa el stock del producto, registra
  el movimiento de entrada correspondiente y sincroniza sus alertas.

## Tecnologías

| Categoría      | Tecnología                                                  |
| -------------- | ----------------------------------------------------------- |
| Runtime        | Node.js 22 LTS                                              |
| Framework      | NestJS 11                                                   |
| Lenguaje       | TypeScript 5                                                |
| Base de datos  | PostgreSQL 16                                               |
| ORM            | Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`)       |
| Validación     | class-validator / class-transformer                         |
| Testing        | Jest 30 + ts-jest, mocks de Prisma (sin base de datos real) |
| Lint / formato | ESLint 9 + Prettier 3                                       |
| Contenedores   | Docker, docker-compose                                      |

## Cómo correr el proyecto

### Requisitos

- Node.js 22 o superior
- Docker y Docker Compose (para PostgreSQL) — o una instancia propia de PostgreSQL 16

### 1. Clonar el proyecto

```bash
git clone <url-proyecto>
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env.development
```

```env
NODE_ENV=development
PORT=3000

DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=mercado_express
DB_PORT=5432
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mercado_express?schema=public"
```

### 4. Levantar PostgreSQL

```bash
docker compose --env-file .env.development up -d postgres
```

### 5. Aplicar migraciones y generar el cliente de Prisma

```bash
npx prisma migrate deploy
npx prisma generate
```

### 6. (Opcional) Cargar los datos de referencia

Inserta los 6 productos de referencia del enunciado (Agua Mineral, Jugo de
Naranja, Leche Entera, Yogur Natural, Papas Fritas, Detergente):

```bash
npm run db:seed
```

### 7. Levantar la aplicación

```bash
# desarrollo (watch mode)
npm run start:dev

# producción
npm run build
npm run start:prod
```

La API queda disponible en [http://localhost:3000](http://localhost:3000 'http://localhost:3000').

La Documentación esta disponible en [http://localhost:3000/api/docs](http://localhost:3000/api/docs 'http://localhost:3000/api/docs').

### Correr con Docker

También se puede construir y correr la API completa en un contenedor:

```bash
docker build -t mercado-express-server .
docker run --env-file .env.production -p 3000:3000 mercado-express-server
```

## Endpoints

| Método | Ruta                                   | Descripción                                            |
| ------ | -------------------------------------- | ------------------------------------------------------ |
| POST   | `/products`                            | Registra un producto (RF-01)                           |
| GET    | `/products`                            | Lista productos paginados con filtros (RF-06)          |
| POST   | `/products/:productId/stock-movements` | Registra un movimiento de stock (RF-02)                |
| GET    | `/alerts`                              | Lista alertas paginadas, filtrables por estado (RF-03) |
| POST   | `/purchase-orders`                     | Crea una orden de compra (RF-04)                       |
| PATCH  | `/purchase-orders/:id/approve`         | Aprueba una orden pendiente (RF-05)                    |
| PATCH  | `/purchase-orders/:id/reject`          | Rechaza una orden pendiente (RF-05)                    |
| PATCH  | `/purchase-orders/:id/receive`         | Recibe una orden e incrementa el stock (RF-05)         |

## Testing

Todos los `service` y `repository` están cubiertos con pruebas unitarias
usando Jest, mockeando `PrismaService` (sin requerir una base de datos real).

```bash
# unit tests
npm run test

# unit tests en modo watch
npm run test:watch

# cobertura (umbral mínimo configurado: 80%)
npm run test:cov

# tests end-to-end
npm run test:e2e
```

## Estructura del proyecto

```
src/
├── common/                # DTOs, interfaces, utilidades y constantes compartidas
├── prisma/                # PrismaService (conexión, adaptador pg)
├── products/               # RF-01 / RF-06
├── stock-movements/        # RF-02
├── alerts/                 # RF-03
├── purchase-orders/        # RF-04 / RF-05
└── app.module.ts

prisma/
├── schema.prisma           # Modelos, enums e índices
├── migrations/             # Migraciones SQL versionadas
└── seed.ts                 # Datos de referencia
```

Cada módulo sigue la misma convención interna:

```
<módulo>/
├── dto/
├── entities/
├── interfaces/
├── __TEST__/
├── <módulo>.controller.ts
├── <módulo>.service.ts
├── <módulo>.repository.ts
└── <módulo>.module.ts
```
