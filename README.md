# BetLab

Mini plataforma de apuestas deportivas **ficticias** creada para estudiar un despliegue full-stack realista. No usa dinero real ni se conecta con casas de apuestas.

## Arranque rápido

1. Copia `.env.example` a `.env` y cambia las contraseñas (para una prueba local también funcionan los valores por defecto de Compose).
2. Ejecuta `docker compose up -d --build`.
3. Abre [http://localhost](http://localhost).
4. Comprueba el estado con `docker compose ps` y los logs con `docker compose logs -f`.

Sólo Nginx publica un puerto. La API, el frontend y PostgreSQL no son accesibles directamente desde el host.

## Arquitectura

```text
Browser
   │
   │ :80 / :443
   ▼
Nginx (único punto público)
   │
   ├──── / ─────────► Angular (frontend:8080)
   │
   └──── /api/ ─────► NestJS (api:3000)
                            │
                            │ postgres:5432
                            ▼
                        PostgreSQL
                            │
                            ▼
                     Volume postgres_data
```

Hay dos redes. `web` une Nginx, frontend y API. `backend`, marcada `internal`, une exclusivamente API y PostgreSQL. Docker Compose aporta DNS: los nombres `api`, `frontend` y `postgres` se resuelven a sus contenedores sin conocer IPs cambiantes.

El navegador llama rutas relativas `/api`. Nginx decide el destino: `/` va al servidor estático Angular y `/api/` a NestJS. Esto evita CORS y URLs de backend codificadas en el frontend.

## Funcionalidad y API

- Registro, login JWT, perfil y saldo inicial de $1,000.
- Eventos precargados automáticamente al iniciar una base vacía.
- Apuestas `HOME`, `DRAW` o `AWAY`, historial y saldo actualizado.
- `POST /api/auth/register`, `POST /api/auth/login`.
- `GET /api/users/me` (JWT).
- `GET /api/events`, `GET /api/events/:id`.
- `POST /api/bets`, `GET /api/bets/me` (JWT).
- `GET /health`.

Al apostar, el cliente sólo envía `eventId`, `selection` y `amount`. El servicio abre una transacción, bloquea la fila del usuario, vuelve a leer evento y cuota, valida estado/fecha/saldo, calcula el pago, descuenta saldo y crea la apuesta. Si algo falla, PostgreSQL revierte todo. Los importes se redondean a centavos y las columnas usan `decimal`.

> `synchronize` está habilitado en este laboratorio (`NODE_ENV=development`). En producción real se debe desactivar y usar migraciones TypeORM.

## Comandos Docker Compose

| Comando | Qué hace |
|---|---|
| `docker compose build` | Construye las imágenes sin iniciar contenedores. |
| `docker compose up` | Crea/inicia todo y deja los logs en primer plano. |
| `docker compose up -d` | Igual, pero en segundo plano. |
| `docker compose up -d --build` | Reconstruye imágenes y luego inicia; es el comando habitual tras cambiar código. |
| `docker compose ps` | Muestra contenedores, estado (`starting`, `healthy`, `unhealthy`) y puertos. |
| `docker compose logs` | Imprime logs agregados. Añade un servicio, por ejemplo `logs api`. |
| `docker compose logs -f` | Sigue logs en tiempo real; `Ctrl+C` sólo deja de seguirlos. |
| `docker compose exec api sh` | Abre una shell dentro de un contenedor ya iniciado. |
| `docker compose restart api` | Reinicia un servicio sin reconstruir su imagen. |
| `docker compose down` | Elimina contenedores y redes del proyecto, conserva imágenes y volúmenes. |
| `docker compose down -v` | También elimina `postgres_data`: **borra usuarios, apuestas y eventos**. |

`down` seguido de `up` crea un contenedor PostgreSQL nuevo que vuelve a montar el mismo volumen; los datos sobreviven. `down -v` elimina ese almacenamiento y la siguiente subida comienza con una base vacía y vuelve a ejecutar el seed.

## Networking, localhost y puertos

Dentro de `api`, `localhost` significa **el propio contenedor API**, no el Mac/PC ni PostgreSQL. Por eso Nest usa `postgres:5432`: `postgres` es el nombre DNS del servicio y `5432` su puerto interno.

Un mapeo `80:80` significa `HOST:CONTAINER`: el puerto 80 del host se reenvía al 80 de Nginx. `EXPOSE` documenta el puerto previsto de una imagen, pero no lo publica. API, frontend y base pueden escuchar dentro de sus redes sin tener una entrada `ports`; `expose` tampoco es obligatorio para que se comuniquen.

## Volúmenes

`postgres_data:/var/lib/postgresql/data` es un volumen nombrado administrado por Docker. Los archivos de PostgreSQL viven fuera de la capa reemplazable del contenedor. Puedes localizarlo con `docker volume inspect betlab_postgres_data`; normalmente no se editan sus archivos a mano. Destruir o recrear `betlab-postgres-1` no destruye el volumen.

## Nginx como reverse proxy

Un *reverse proxy* recibe la petición pública y la reenvía a un servicio privado. En `nginx/nginx.conf`, los bloques `upstream` dan nombres lógicos a `frontend:8080` y `api:3000`; `proxy_pass` entrega la petición al upstream apropiado. Los headers preservan contexto:

- `Host`: dominio solicitado.
- `X-Real-IP`: IP inmediata del cliente.
- `X-Forwarded-For`: cadena de proxies e IP original.
- `X-Forwarded-Proto`: protocolo original (`http` o `https`).

El `proxy_pass http://api_upstream;` no incluye una barra final, por lo que conserva `/api/...`; esto coincide con el prefijo global de NestJS.

## Dockerfiles y multi-stage builds

- `FROM` selecciona una imagen base o inicia una etapa.
- `WORKDIR` fija el directorio de las instrucciones posteriores.
- `COPY` incorpora archivos al sistema de la imagen.
- `RUN` ejecuta durante la **construcción** y guarda el resultado en una capa (por ejemplo, compilar TypeScript).
- `CMD` define el proceso por defecto al **arrancar el contenedor** (por ejemplo, `node dist/main.js`). Sólo el último `CMD` efectivo se usa.
- `ENV` fija variables persistentes en imagen/contenedor; no se usa para secretos.
- `ARG` es un valor disponible únicamente durante el build; tampoco debe considerarse seguro para secretos.
- `EXPOSE` documenta el puerto interno previsto, pero no lo publica.

Los builds son multi-stage para dejar herramientas de desarrollo fuera del resultado. Nest compila con Node y la etapa final copia `dist` y dependencias de producción, ejecutándose como usuario `node`. Angular compila con Node y la etapa final contiene solamente Nginx y archivos estáticos. Así se reducen tamaño y superficie de ataque.

## Health checks y orden de inicio

PostgreSQL usa `pg_isready`; API consulta `/health`, que a su vez ejecuta `SELECT 1`; frontend y Nginx comprueban HTTP. Durante el periodo inicial Compose muestra `starting`, después `healthy`, o `unhealthy` tras fallos consecutivos. `depends_on` incluye `condition: service_healthy`, de modo que no confunde “proceso creado” con “servicio listo”. Además TypeORM conserva su lógica de conexión: el health check no sustituye el manejo de errores.

Consulta detalles con `docker inspect --format '{{json .State.Health}}' betlab-api-1` o `docker compose ps`.

## Seguridad básica

Las contraseñas se almacenan con bcrypt (12 rondas), los DTO se validan con lista blanca, las rutas privadas usan guard JWT y los secretos llegan por variables de entorno. `.env` está ignorado y `.env.example` sólo contiene marcadores. PostgreSQL y API no publican puertos. El backend no acepta cuotas ni pagos calculados por Angular. Para producción usa secretos largos, una cuenta PostgreSQL con privilegios mínimos, migraciones, rate limiting y rotación/expiración adecuada de tokens.

## HTTPS en un servidor Linux

El flujo sería `DNS betlab.example.com → IP del servidor → firewall 80/443 → Nginx → red Docker`. Nginx termina TLS: descifra HTTPS y habla HTTP privado con frontend/API.

Una opción sencilla es instalar Certbot en el host y usar el desafío webroot o detener brevemente el Nginx de Compose para emitir el certificado: `sudo certbot certonly --standalone -d betlab.example.com`. Después se montan `/etc/letsencrypt/live/betlab.example.com/fullchain.pem` y `privkey.pem` como sólo lectura en Nginx, se publica `443:443`, y se añade un bloque `listen 443 ssl` con `ssl_certificate`/`ssl_certificate_key`; el puerto 80 redirige a HTTPS. `certbot renew` renueva y un hook ejecuta `docker compose exec nginx nginx -s reload`. Asegura primero que DNS apunta a la IP y que 80/443 están permitidos. No hacen falta certificados para localhost.

## Debugging Docker

### La API no inicia

Empieza con `docker compose ps` para saber si está reiniciándose, esperando o unhealthy; después `docker compose logs api`. Distingue una compilación fallida (ocurre durante `build`) de un fallo de ejecución (variables ausentes, conexión o esquema). Comprueba variables efectivas con `docker compose exec api env` y el proceso con `docker compose top api`.

### PostgreSQL no conecta

Lee `docker compose logs postgres`: busca inicialización, contraseña, disco o corrupción. Comprueba el health check con `docker compose ps`. Entra con `docker compose exec api sh`; desde ahí `postgres`, no `localhost`, debe ser el host. El contenedor Alpine no incluye todas las herramientas de red, pero `getent hosts postgres` verifica DNS. Confirma también que ambos servicios comparten `backend` mediante `docker network inspect betlab_backend`.

### Nginx devuelve 502

Un 502 significa que Nginx sí respondió pero su upstream no. Sigue la cadena por capas: ¿`api`/`frontend` están healthy?, ¿sus logs muestran escucha?, ¿Docker DNS resuelve el nombre?, ¿el puerto de `upstream` coincide? Ejecuta `docker compose exec nginx wget -S -O- http://api:3000/health` y revisa `docker compose logs nginx`. No intentes arreglarlo publicando la API: la comunicación correcta ocurre en `web`.

### Angular carga pero `/api` falla

La capa estática funciona, así que inspecciona la petición en Network del navegador (ruta, método, status y payload), luego `docker compose logs nginx api`. Prueba `curl -i http://localhost/health` para salud directa de API a través de Nginx y `curl -i http://localhost/api/events` para el prefijo. Revisa que `location /api/` y `proxy_pass` preserven `/api`, y que Nest tenga el mismo prefijo. Un 401 indica que el proxy funciona pero falta/expiró JWT; 404 suele ser una ruta/prefijo; 502 es conectividad al upstream; 500 pertenece a la aplicación o base.

## Pruebas manuales por HTTP

```bash
curl -s http://localhost/health
curl -s http://localhost/api/events
curl -s -X POST http://localhost/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","password":"aprendiendo123"}'
```

Copia `accessToken` y prueba una apuesta (usa un `eventId` retornado por eventos):

```bash
curl -s -X POST http://localhost/api/bets \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TU_TOKEN' \
  -d '{"eventId":1,"selection":"HOME","amount":100}'
```

Consulta después `/api/users/me` y `/api/bets/me` con el mismo header para ver el saldo de 900 y la apuesta.

## Archivos para estudiar, en orden

1. `compose.yaml`: servicios, redes, volumen, variables y checks.
2. `nginx/nginx.conf`: enrutamiento público hacia los dos upstreams.
3. `backend/src/app.module.ts`: conexión TypeORM mediante DNS Docker.
4. `backend/src/bets/bets.service.ts`: transacción y reglas que no se confían al cliente.
5. `backend/src/auth/`: bcrypt, JWT, estrategia y guard.
6. `frontend/src/app/core/`: token, interceptor y guard de rutas.
7. `frontend/src/app/pages/events.component.ts` y `components/bet-modal.component.ts`: flujo UI → API.
8. Ambos `Dockerfile`: diferencia entre construcción y ejecución.

La estructura se mantiene intencionalmente pequeña: un monolito NestJS, una SPA Angular, una base y un proxy; sin tecnologías adicionales que oculten los conceptos de despliegue.
