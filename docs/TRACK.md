# HOW I BUILT IT?

## Day 1: Nestjs, Docker, Postgres, Pgadmin & TypeORM setup
[Guide for Setup -> Postgres v18+: no need of /data](https://dev.to/chukwutosin_/step-by-step-guide-setting-up-a-nestjs-application-with-docker-and-postgresql-5hei)

1. Setup Nestjs
    - npm i -g @nestjs/cli
    - nest new --strict .

2. Set Dockerfile
    ```
        FROM node:22

        WORKDIR /app

        COPY package*.json ./

        RUN npm install

        COPY . .

        RUN npm run build

        CMD ["npm", "run", "start:dev"]
    ```

3. Set docker-compose.yml
    ```
    services:
    db: 
        image: postgres
        restart: always
        environment:
            - POSTGRES_USER=postgres
            - POSTGRES_PASSWORD=postgres
        container_name: postgres
        volumes:
            - ./pgdata:/var/lib/postgresql
        ports:
            - '5432:5432'

    app:
        build: 
        context: .
        dockerfile: Dockerfile
        container_name: shelfAPI
        environment:
            - PORT=${PORT}
        ports:
            - '3000:3000'
        depends_on:
            - db
        volumes:
            - ./src:/app/src

    
    pgadmin:
        image: dpage/pgadmin4
        restart: always
        container_name: nest-pgadmin4
        ports:
            - '5050:80'
        environment:
            - PGADMIN_DEFAULT_EMAIL=admin@admin.com
            - PGADMIN_DEFAULT_PASSWORD=pgadmin4
        depends_on:
            - db
    ```
4. Create .dockerignore
    ```
        node_modules
        .env*
        *.log
        Dockerfile
        .dockerignore
        dist
    ```

5. Run 'docker compose up -d'

6. Set pgadmin
    - Open PgAdmin in the web browser by visiting http://localhost:5050 (assuming we're using the default configuration in the docker-compose.yml file).
    - Log in using your email and password in the docker-compose.yml file for the pgadmin service.
    - In the left-hand sidebar, click Servers to expand the Servers menu.
    - Right-click on Servers and select Register -> Server.
    - In the General tab of the Create - Server dialog, we can give the server a name of our choice.
    - In the Connection tab, fill in the following details:
        - Host name/address: db
        - Port: 5432
        - Maintenance database: postgres
        - Username: postgres
        - Password: postgres
    - Click Save to save the server configuration.

    **Note**: *Since the PostgreSQL server is running in a Docker container, the hostname/address would be the name of the Docker service for the database container as defined in the docker-compose.yml file. By default, the name of the service becomes the hostname/address of the container within the Docker network.*

7. Set node types
    - npm i --save-dev @types/node 
    - types: ["node"] in tsconfig

8. Rebuild docker image on node module changes:
    - docker compose down
    - docker compose up --build --pull always

    For DEV only: 
    - Add in docker-compose: 
        ```
           volumes:
            - ./src:/app/src
            - ./node_modules:/app/node_modules
        ```
---

## Day 2: 

1. **Error in dto:** Property 'password' has no initializer and is not definitely assigned in the constructor
    - Fix: set "strictPropertyInitialization": false in tsconfig.

2. Install Prisma
    - npm install prisma --save-dev
    - npx prisma
    - npx prisma init
    - Add DATABASE_URL: 
        - Structure: postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME?OPTIONS
        - URL: postgresql://postgres:postgres@localhost:5432/postgres?schema=public
    - Run **npx prisma db pull** to introspect your database.

3. Create config module to read .env variables
    - npm i --save @nestjs/config
