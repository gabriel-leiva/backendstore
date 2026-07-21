# Backend Store

Proyecto final del curso **Backend I de Coderhouse**.

La aplicación implementa una API REST para administrar productos y carritos de compra. Utiliza MongoDB como sistema de persistencia principal, Handlebars para las vistas y Socket.IO para actualizar productos en tiempo real.

## Funcionalidades principales

- Gestión completa de productos.
- Gestión completa de carritos.
- Persistencia de datos en MongoDB.
- Paginación de productos.
- Filtrado por categoría y disponibilidad.
- Ordenamiento por precio.
- Vistas dinámicas con Handlebars.
- Actualización de productos en tiempo real con Socket.IO.
- Conservación de la implementación anterior basada en FileSystem.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- Handlebars
- Socket.IO
- dotenv
- mongoose-paginate-v2

## Requisitos previos

Para ejecutar el proyecto es necesario tener instalado:

- Node.js
- npm
- MongoDB Community Server

También se puede utilizar MongoDB Compass para visualizar la base de datos.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/gabriel-leiva/backendstore.git
```

Entrar en la carpeta del proyecto:

```bash
cd backendstore
```

Instalar las dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo llamado `.env` en la raíz del proyecto.

Se puede tomar como referencia el archivo `.env.example`.

Contenido esperado:

```env
MONGO_URL=mongodb://127.0.0.1:27017/ecommerce
PORT=8080
```

## Ejecución

Para iniciar el proyecto normalmente:

```bash
npm start
```

Para iniciar el proyecto en modo desarrollo con reinicio automático:

```bash
npm run dev
```
El script de desarrollo utiliza `node --watch` para reiniciar automáticamente el servidor cuando se modifican archivos.

La aplicación se ejecuta en:

```text
http://localhost:8080
```

## Base de datos

La aplicación utiliza una base de datos MongoDB llamada:

```text
ecommerce
```

Colecciones utilizadas:

```text
products
carts
```

## Endpoints de productos

Ruta base:

```text
/api/products
```

### Obtener todos los productos

```http
GET /api/products
```

Parámetros opcionales:

- `limit`: cantidad de productos por página.
- `page`: número de página.
- `query`: categoría o disponibilidad.
- `sort`: orden por precio ascendente o descendente.

Valores predeterminados:

```text
limit=10
page=1
```

Ejemplos:

```http
GET /api/products?limit=10&page=1
GET /api/products?query=Periféricos
GET /api/products?query=available
GET /api/products?sort=asc
GET /api/products?sort=desc
```

La respuesta incluye:

- `status`
- `payload`
- `totalPages`
- `prevPage`
- `nextPage`
- `page`
- `hasPrevPage`
- `hasNextPage`
- `prevLink`
- `nextLink`

### Obtener un producto por ID

```http
GET /api/products/:pid
```

Ejemplo:

```http
GET /api/products/6a5bce83aaebc1df4ddfae8e
```

### Crear un producto

```http
POST /api/products
```

Ejemplo de body:

```json
{
  "title": "Parlante Bluetooth",
  "description": "Parlante portátil con conexión Bluetooth",
  "code": "PAR-BT-001",
  "price": 55000,
  "status": true,
  "stock": 12,
  "category": "Audio",
  "thumbnails": [
    "parlante.jpg"
  ]
}
```

Campos utilizados:

- `title`
- `description`
- `code`
- `price`
- `status`
- `stock`
- `category`
- `thumbnails`

El identificador del producto se genera automáticamente en MongoDB.

### Actualizar un producto

```http
PUT /api/products/:pid
```

Ejemplo de body:

```json
{
  "price": 62000,
  "stock": 8
}
```

El identificador del producto no puede modificarse.

### Eliminar un producto

```http
DELETE /api/products/:pid
```

## Endpoints de carritos

Ruta base:

```text
/api/carts
```

### Crear un carrito

```http
POST /api/carts
```

Crea un carrito vacío con un identificador generado automáticamente.

### Obtener un carrito por ID

```http
GET /api/carts/:cid
```

La consulta utiliza `populate()` para devolver la información completa de los productos almacenados en el carrito.

### Agregar un producto al carrito

```http
POST /api/carts/:cid/products/:pid
```

Si el producto ya se encuentra en el carrito, su cantidad aumenta en una unidad.

### Actualizar la cantidad de un producto

```http
PUT /api/carts/:cid/products/:pid
```

Ejemplo de body:

```json
{
  "quantity": 5
}
```

### Reemplazar todos los productos del carrito

```http
PUT /api/carts/:cid
```

Ejemplo de body:

```json
{
  "products": [
    {
      "product": "6a5bce83aaebc1df4ddfae8e",
      "quantity": 3
    },
    {
      "product": "6a5bd5fc89c8f215b5e73ee5",
      "quantity": 1
    }
  ]
}
```

Esta operación reemplaza completamente el contenido anterior del carrito.

### Eliminar un producto del carrito

```http
DELETE /api/carts/:cid/products/:pid
```

Elimina únicamente el producto indicado.

### Vaciar el carrito

```http
DELETE /api/carts/:cid
```

El carrito sigue existiendo, pero su arreglo de productos queda vacío.

## Vistas disponibles

### Listado de productos

```text
/products
```

Muestra:

- título;
- descripción;
- precio;
- stock;
- categoría;
- enlace al detalle;
- paginación.

### Detalle de producto

```text
/products/:pid
```

Muestra la información completa del producto y permite agregarlo a un carrito ingresando el ID del carrito.

### Vista de carrito

```text
/carts/:cid
```

Muestra:

- ID del carrito;
- productos;
- precio unitario;
- cantidad;
- categoría;
- opción para eliminar un producto;
- opción para vaciar el carrito.

### Productos en tiempo real

```text
/realtimeproducts
```

Esta vista se actualiza automáticamente cuando se crea, modifica o elimina un producto.

## Tiempo real

La aplicación utiliza Socket.IO.

Cuando se realiza alguna de estas operaciones:

```text
POST /api/products
PUT /api/products/:pid
DELETE /api/products/:pid
```

el servidor emite el evento:

```text
productsUpdated
```

La vista `/realtimeproducts` recibe ese evento y actualiza la lista sin necesidad de recargar manualmente la página.

## Persistencia con MongoDB

La persistencia principal se implementa con Mongoose.

Managers utilizados:

```text
dao/ProductMongoManager.js
dao/CartMongoManager.js
```

Modelos utilizados:

```text
models/product.model.js
models/cart.model.js
```

## Persistencia con FileSystem

También se conserva la implementación anterior basada en archivos.

Managers:

```text
dao/ProductManager.js
dao/CartManager.js
```

Archivos de datos:

```text
data/products.json
data/carts.json
```

Esta implementación queda disponible dentro del proyecto, aunque la aplicación actual utiliza MongoDB como persistencia principal.

## Estructura del proyecto

```text
backendstore/
├── config/
│   └── database.js
├── dao/
│   ├── CartManager.js
│   ├── CartMongoManager.js
│   ├── ProductManager.js
│   └── ProductMongoManager.js
├── data/
│   ├── carts.json
│   └── products.json
├── models/
│   ├── cart.model.js
│   └── product.model.js
├── routes/
│   ├── carts.router.js
│   ├── products.router.js
│   └── views.router.js
├── views/
│   ├── layouts/
│   │   └── main.handlebars
│   ├── cart.handlebars
│   ├── home.handlebars
│   ├── productDetail.handlebars
│   ├── products.handlebars
│   └── realTimeProducts.handlebars
├── .env.example
├── .gitignore
├── app.js
├── package.json
├── package-lock.json
└── README.md
```

## Manejo de errores

La aplicación incluye validaciones para:

- identificadores inválidos;
- productos inexistentes;
- carritos inexistentes;
- códigos de producto duplicados;
- campos obligatorios faltantes;
- valores incorrectos;
- páginas o límites inválidos;
- parámetros de ordenamiento incorrectos.

Se utilizan códigos HTTP como:

- `200` para operaciones exitosas.
- `201` para recursos creados.
- `400` para solicitudes inválidas.
- `404` para recursos no encontrados.
- `500` para errores internos.

## Pruebas realizadas

Los endpoints fueron probados con Thunder Client.

Se verificaron:

- creación de productos;
- consulta de productos;
- paginación;
- filtros;
- ordenamiento;
- actualización;
- eliminación;
- creación de carritos;
- agregado de productos;
- incremento de cantidades;
- actualización de cantidades;
- reemplazo completo del carrito;
- eliminación individual;
- vaciado del carrito;
- uso de `populate()`;
- actualización en tiempo real;
- persistencia en MongoDB.

## Autor

Gabriel