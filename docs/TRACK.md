# HOW I BUILT IT?

## Day 1: Nestjs, Docker, Postgres, Pgadmin & TypeORM setup

[Guide for Setup -> Postgres v18+: no need of /data](https://dev.to/chukwutosin_/step-by-step-guide-setting-up-a-nestjs-application-with-docker-and-postgresql-5hei)

### Setup Nestjs

    - npm i -g @nestjs/cli
    - nest new --strict .

### Set Dockerfile

```
    FROM node:22

    WORKDIR /app

    COPY package*.json ./

    RUN npm install

    COPY . .

    RUN npm run build

    CMD ["npm", "run", "start:dev"]
```

### Set docker-compose.yml

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

### Create .dockerignore

```
    node_modules
    .env*
    *.log
    Dockerfile
    .dockerignore
    dist
```

### Run 'docker compose up -d'

### Set pgadmin

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

**Note**: _Since the PostgreSQL server is running in a Docker container, the hostname/address would be the name of the Docker service for the database container as defined in the docker-compose.yml file. By default, the name of the service becomes the hostname/address of the container within the Docker network._

### Set node types

- npm i --save-dev @types/node
- types: ["node"] in tsconfig

### Rebuild docker image on node module changes:

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

### _Error in dto:_ Property 'password' has no initializer and is not definitely assigned in the constructor

- Fix -> set "strictPropertyInitialization": false in tsconfig.

### Install Prisma

- npm install prisma --save-dev
- npx prisma
- npx prisma init
- Add DATABASE_URL:
  - Structure: postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME?OPTIONS
  - URL: postgresql://postgres:postgres@localhost:5432/postgres?schema=public
- Run **npx prisma db pull** to introspect your database.

### Create config module to read .env variables

- npm i --save @nestjs/config

---

## Day 3:

### uuid vs cuid (Reference: [Medium](https://osamadev.medium.com/understanding-unique-identifiers-uid-uuid-guid-cuid-and-nano-id-3ef2d104ecdf), [Dev.to](https://dev.to/_d7eb1c1703182e3ce1782/uuid-vs-ulid-vs-cuid-which-should-you-use-4n73))

- Chosen: UUID()
- The scale doesn't need CUID's actual advantage. CUID's whole reason to exist is index locality on high-throughput inserts. A personal document vault isn't writing fast enough for random-UUID fragmentation to ever show up as a real problem — we'd need a genuinely high-write workload before this matters.
- createdAt already does the sorting job. CUID's other selling point — IDs that are roughly time-ordered — is redundant here, because the domain model already has a (userId, createdAt) composite index doing exactly that, on purpose. We don't need an ID that moonlights as a timestamp when we already have a timestamp.
- UUID gets the smaller, purpose-built binary representation Postgres was designed to index efficiently. Full randomness is a small security plus, not a downside.

### How to upload and fetch images/docs from S3 ([Medium](https://medium.com/@pranav6640/efficiently-store-retrieve-image-assets-in-s3-with-node-js-b155a9fd22ae))

-

---

## Day 4:

### Save the schema - migration

- npx prisma migrate dev --name init
- npx prisma generate (to generate the client)

### Updated method to run DB on docker and app on local machine in Development

#### docker-compose.yml

```
version: "3.9"

services:
  db:
    image: postgres:16
    container_name: shelf-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: shelf
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d shelf"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

#### Run app locally

- npm install
- npm run start:dev

### Running the app in Development

### When running the app on production

1. Set .env

```
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres?schema=public
NODE_ENV=development
```

2. Run the docker

- docker compose up -d db

3.  Install dependencies

- npm install

4. Generate Prisma client

- npx prisma generate

5. Apply the existing Prisma migration

- npx prisma migrate deploy

6. Start the app locally

- npm run start:dev

7. Verify DB is alive

- docker ps
  OR
- docker logs postgres

#### Dockerfile

```
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

- This is the pattern used by companies:
  - use a build stage
  - install dependencies
  - compile TypeScript
  - run the compiled app
  - do not use watch mode in production

### What is wrong with docker pull --always

- docker pull means: “download the newest image from Docker Hub / registry”.
- It does not mean: “sync my local source code”.
- Our app code is not in the image while we are developing if we are mounting local files or running locally.

### Install adapter and client for prisma

- npm install @prisma/adapter-pg
- npm install @prisma/client

### Create src/prisma.service.ts

```
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
        super({ adapter });
    }
}
```

### Inject service from outside module ([Guide](https://felixastner.com/articles/how-to-inject-a-nestjs-service-from-another-module-a-step-by-step-guide))

### Avoid `output = "../src/generated/prisma"` in prisma generator

- Else below error i thrown

```
If i remove the output path, below error is thrown, else {Object.defineProperty(exports, "__esModule", { value: true });
^

ReferenceError: exports is not defined in ES module scope } is thrown :
Prisma schema loaded from prisma\schema.prisma.
Error: An output path is required for the prisma-client generator. Please provide an output path in your schema file:

generator client {
provider = "prisma-client"
output = "../src/generated"
}

Note: the output path is relative to the schema directory.
```

### Implement Centralized error handler ([Guide](https://medium.com/@kaygeea/centralized-error-handling-the-black-box-your-application-needs-9acd01ef80cb))

- Create files in src/common:
  - app-base.error.ts
  - errors/exception-mapping.ts
  - global-exception.filter.ts

- Register it in main.ts
  - app.useGlobalFilters(new GlobalExceptionFilter());


### Setting up login endpoint
- Install cookie-parser and register in main.ts
  - npm install cookie-parser
  - npm i --save-dev @types/cookie-parser

- Install jwt & register in auth.module
  - npm install --save @nestjs/jwt

### Setting up validation
- Create a validation pipe 
  - npm i --save class-validator class-transformer

- Register it in main.ts
  - app.useGlobalPipes(new ValidationPipe());

- Use it by - @UseGuards(AuthGuard) before a request in controllers.


### Setting up Zod-based validation
- Install Zod: npm install --save zod
- Ensure "strictNullChecks: true" in tsconfig
- Create the Validation pipe:
```
  import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
  import { ZodSchema  } from 'zod';

  export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) {}

    transform(value: unknown, metadata: ArgumentMetadata) {
      try {
        const parsedValue = this.schema.parse(value);
        return parsedValue;
      } catch (error) {
        throw new BadRequestException('Validation failed');
      }
    }
  }
```

### 

---

## Day 5

### How companies do it in AWS

#### Recommended architecture

- CloudFront
  - CDN / TLS termination
  - optional static asset caching
- Nginx on EC2
  - reverse proxy to Node app
  - handles gzip, headers, SSL, request forwarding
- Node app on EC2
  - runs compiled NestJS app
  - listens on localhost:3000
- RDS Postgres
  - production database
- IAM
  - EC2 role for AWS resources
  - no hardcoded keys
- Secrets Manager
  - store DB credentials / tokens

#### Typical flow

1. developer changes code locally
2. pushes to GitHub
3. GitHub Actions or CodePipeline runs:
   - install deps
   - run tests
   - build Docker image
   - push image to ECR
4. deploy on EC2 or ECS
5. app starts with env variables from Secrets Manager
6. database is on RDS

#### Where CI fits

CI runs when: - a pull request is opened - a commit is pushed to a branch - a merge happens to main

Typical CI jobs: - install dependencies - run unit tests - run lint - run build - build Docker image - push image to registry - scan for vulnerabilities

So, CI is about “is the code good enough to ship?”

#### Where CD fits

CD runs after CI passes and a branch is approved for deployment.

Typical CD jobs: - pull new image from registry - update ECS / EC2 service / container - restart app - health-check - rollback if failure

So, CD is about “ship this approved version to the environment”.
After merge to main, CD deploys to staging or production depending on branch policy.

#### Real flow with GitHub + AWS

A very common setup is:

- GitHub repo
- GitHub Actions
- Docker image built in CI
- pushed to Amazon ECR
- deployed to EC2 or ECS
- database on RDS Postgres
- Nginx and CloudFront in front if needed

Example flow:

1. dev pushes code to feature branch
2. GitHub Actions runs tests
3. PR is created
4. merge to main
5. GitHub Actions builds image
6. image is pushed to ECR
7. deployment job updates EC2/ECS container
8. app restarts and serves new version

#### How AWS deployment usually works

1. Option A: EC2 + Docker
   Simplest and common for small/medium apps

- GitHub Actions builds Docker image
- pushes it to ECR
- deploy job SSHs into EC2 or uses CodeDeploy
- container is stopped/restarted with new image
- app uses RDS for Postgres

2. Option B: ECS Fargate
   Common for more scalable production apps

- GitHub Actions builds image
- pushes to ECR
- ECS service updates to new task definition
- no need to manage VM infrastructure manually

3. Option C: App Runner / Elastic Beanstalk

- Simpler managed deployment
- GitHub repo triggers deployment
- AWS handles runtime
- good for smaller teams

### What happens on branch changes

1. On feature branch

- runs CI only
- does not deploy to production
- useful for validation

2. On main branch

- CI runs
- then CD deploys to staging environment
- sometimes production deploy is gated by QA approval

3. On tag or release branch

- deploy to production
- can use manual approval gates

---

## THE REAL WORLD PIPELINE

### The industry flow is:

1. code is pushed to GitHub
2. CI validates it
3. a Docker image is built
4. image is pushed to AWS ECR
5. AWS deploys that image
6. app uses RDS PostgreSQL
7. Nginx sits in front of the app
8. CloudFront is optional in front of Nginx/ALB

### Step-by-step pipeline

1. Local development
   This stays exactly as you are doing it:

- Postgres in Docker
- app runs locally on your machine
- hot reload with Nest watch mode

The current local pattern is already valid for development:

```
docker compose up db
npm install
npm run start:dev
```

2. GitHub repository
   Your source of truth is GitHub.

Branch strategy:

- feature/* → for development
- main → for production-ready code
- optional staging or release branch → for pre-prod deployment

This means:

- developers push code to feature branches
- merge to main only after review and tests

3. CI pipeline runs on push / PR
   A CI system (usually GitHub Actions) runs automatically.

Typical steps:

```
- checkout code
- setup Node
- npm ci
- npm run build
- npm test
- npx prisma generate
- docker build -t app:sha
- docker push to ECR
```

This is the “quality gate”.

Important:

- feature branches usually run CI only
- main branch can trigger deployment as well

4. Build a Docker image
   The production image is built from the app source, not from the local dev container.

This is where Dockerfile matters.

In real deployment, the build is:

```
docker build -t myapp:latest .
```

Then:

```
docker tag myapp:latest <aws-account>.dkr.ecr.us-east-1.amazonaws.com/myapp:latest
docker push <aws-account>.dkr.ecr.us-east-1.amazonaws.com/myapp:latest
```

That image is versioned and stored in ECR.

5. Push image to AWS ECR
   ECR is Amazon’s container registry.

The pipeline pushes the built image there.

Then AWS knows:

- which version is valid
- which image should be deployed
- how to roll back if needed

This is the correct production pattern.

6. Deploy to EC2 or ECS
   For your app, the easiest real-world path is:

- EC2 for hosting
- Docker container running the app
- Nginx in front
- RDS Postgres in AWS
- Deployment flow for EC2:

GitHub Action sees main branch change

- It builds image
- pushes to ECR
- on EC2, pull the latest image
- stop old container
- start new container
- app serves from port 3000

Example:

```
docker pull <aws-account>.dkr.ecr.us-east-1.amazonaws.com/myapp:latest
docker stop shelf-api || true
docker rm shelf-api || true
docker run -d --name shelf-api -p 3000:3000 --env-file .env <aws-account>.dkr.ecr.us-east-1.amazonaws.com/myapp:latest
```

7. Use RDS Postgres instead of local Docker DB
   In production, your database should not be local Docker Postgres.

You move it to:

- Amazon RDS PostgreSQL

Then app environment uses:

```
DATABASE_URL=postgresql://user:password@rds-endpoint:5432/shelf?schema=public
```

This is how real apps do it.

8. Nginx in front of Node app
   On EC2, Nginx receives traffic and forwards to Node.

Example configuration:

```
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

This is standard:

- public internet → Nginx
- Nginx → NestJS app on localhost:3000

9. CloudFront in front of Nginx or ALB
   CloudFront is optional but common.

Use it for:

- HTTPS
- edge acceleration
- caching static content
- better global delivery

For a backend API, it is often used with:

- CloudFront + ALB or EC2
- custom domain
- certificate from ACM

### The exact real-world pattern for your app

This is the simplest industry-safe pipeline:

1. Local dev:
   - Postgres in Docker
   - Nest app on localhost
2. GitHub:
   - repo is source of truth
3. GitHub Actions:
   - install
   - build
   - test
   - docker build
   - push to ECR
4. AWS:
   - EC2 runs container
   - RDS stores Postgres
   - Nginx proxies app
     CloudFront optional
5. IAM:
   - app uses AWS role
   - secrets from Secrets Manager
6. Production deploy:
   - only when main branch or release tag is approved

_**“every time code changes, build a new versioned artifact, run tests, and deploy intentionally”**_
