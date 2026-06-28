from pathlib import Path

ROOT = Path(".")

directories = [

    # =========================
    # shared
    # =========================
    "shared/contracts",
    "shared/events",
    "shared/constants",
    "shared/docs",

    # =========================
    # backend-service
    # =========================
    "backend-service/app",
    "backend-service/api",
    "backend-service/services",
    "backend-service/db",
    "backend-service/tests",

    # =========================
    # infra
    # =========================
    "infra/nginx",
    "infra/nginx/conf.d",

    "infra/redis",

    "infra/postgres",

    "infra/kafka",

    "infra/vault",
    "infra/vault/policies",

    "infra/kubernetes",
]

files = [

    # =========================
    # shared
    # =========================

    "shared/contracts/request_examples.json",
    "shared/contracts/response_examples.json",

    "shared/events/tourist_created.py",
    "shared/events/tourist_moved.py",
    "shared/events/sos_triggered.py",
    "shared/events/anomaly_detected.py",

    "shared/constants/risk_levels.py",
    "shared/constants/danger_zones.py",

    "shared/docs/api-spec.md",
    "shared/docs/architecture.md",
    "shared/docs/deployment.md",

    # Optional package files
    "shared/events/__init__.py",
    "shared/constants/__init__.py",

    # =========================
    # backend-service
    # =========================

    "backend-service/app/__init__.py",
    "backend-service/api/__init__.py",
    "backend-service/services/__init__.py",
    "backend-service/db/__init__.py",
    "backend-service/tests/__init__.py",

    # Git keep files since structure doesn't specify files yet
    "backend-service/app/.gitkeep",
    "backend-service/api/.gitkeep",
    "backend-service/services/.gitkeep",
    "backend-service/db/.gitkeep",
    "backend-service/tests/.gitkeep",

    # =========================
    # infra/nginx
    # =========================

    "infra/nginx/nginx.conf",

    "infra/nginx/conf.d/ai-service.conf",
    "infra/nginx/conf.d/blockchain-service.conf",
    "infra/nginx/conf.d/model-service.conf",

    # =========================
    # infra/redis
    # =========================

    "infra/redis/redis.conf",

    # =========================
    # infra/postgres
    # =========================

    "infra/postgres/init.sql",
    "infra/postgres/postgresql.conf",

    # =========================
    # infra/kafka
    # =========================

    "infra/kafka/kafka.conf",

    # =========================
    # infra/vault
    # =========================

    "infra/vault/policies/.gitkeep",

    # =========================
    # infra/kubernetes
    # =========================

    "infra/kubernetes/ai-service.yaml",
    "infra/kubernetes/blockchain-service.yaml",
    "infra/kubernetes/model-service.yaml",
    "infra/kubernetes/backend-service.yaml",
    "infra/kubernetes/postgres.yaml",
    "infra/kubernetes/redis.yaml",
    "infra/kubernetes/kafka.yaml",
    "infra/kubernetes/ingress.yaml",
]

# Create folders
for folder in directories:
    (ROOT / folder).mkdir(parents=True, exist_ok=True)

# Create files
for file_path in files:
    path = ROOT / file_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.touch(exist_ok=True)

print("✅ shared, backend-service and infra structure created successfully.")
print(f"📁 Location: {ROOT.resolve()}")