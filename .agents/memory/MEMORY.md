# Memory Index

- [K8s DB startup ordering](k8s-db-startup.md) — API must await migrations/seed (with retry + exit) before listen; k8s has no depends_on ordering like Compose.
- [i18n conventions](i18n-conventions.md) — board names stay French in DB/API (display-only translation); namespaces self-register via side-effect imports; I.ROC DE/NL not official.
