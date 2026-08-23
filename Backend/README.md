# Smart Safety Tour Backend

## Run with Docker

```bash
docker compose up --build
```

The app will be available at http://localhost:5001 and PostgreSQL at localhost:5432.

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

## Run tests

From the backend folder:

```bash
npm install
npm run build
npm test
```

If you are starting from the workspace root, use:

```bash
cd Backend
npm install
npm run build
npm test
```

## API Health Check

```bash
curl http://localhost:5001/health
```
