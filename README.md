
## AdoptMe

API REST desarrollada con Node.js, Express y MongoDB. Gestiona usuarios, mascotas y adopciones.
Incluye Swagger para documentación, tests funcionales, y Docker.

---

### Imagen en Docker Hub
Repositorio: [leysaguardia/proyectadoptme](https://hub.docker.com/r/leysaguardia/proyectadoptme)  
Tags disponibles: 1.0.0, latest

---

### Para ejecutar el proyecto con Docker:

####  1.Usando archivo `.env`
Colocar un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=8080
MONGO_URL=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/adoptme
```

####  2.Definiendo variables 

docker run -d -p 8080:8080 \
  -e PORT=8080 \
  -e MONGO_URL=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/adoptme \ 
  leysaguardia/proyectadoptme:1.0.0

#### Endpoints principales

| Método | Endpoint                   | Descripción             |
| :----- | :------------------------- | :---------------------- |
| GET    | `/api/users`               | Listar usuarios         |
| GET    | `/api/pets`                | Listar mascotas         |
| POST   | `/api/adoptions/:uid/:pid` | Crear adopción          |
| GET    | `/api/adoptions`           | Listar adopciones       |
| POST   | `/api/mocks/generateData`  | Generar datos de prueba |


#### Documentación Swagger

http://localhost:8080/docs

#### Tests funcionales

Ejecutar:

npm test






