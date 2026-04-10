.PHONY: up down restart build logs ps

up: ## Start frontend service
	docker compose up -d --build

down: ## Stop frontend service
	docker compose down

restart: ## Restart frontend service
	docker compose restart

build: ## Build frontend service
	docker compose build

logs: ## Show logs
	docker compose logs -f

ps: ## Show status
	docker compose ps

help: ## Show help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'
