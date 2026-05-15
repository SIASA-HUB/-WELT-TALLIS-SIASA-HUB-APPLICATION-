.PHONY: up down restart logs ps build clean socket-up socket-down socket-logs

up: ## Start all services
	docker compose up -d --build

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## Show logs for all services
	docker compose logs -f

ps: ## Show status of all services
	docker compose ps

build: ## Build all services without starting
	docker compose build

clean: ## Stop and remove all containers, networks, but preserve volumes
	docker compose down

# Socket.IO specific commands
socket-up: ## Start only socketio-service
	docker compose up -d socketio-service

socket-down: ## Stop socketio-service
	docker compose stop socketio-service

socket-logs: ## Show socketio-service logs
	docker compose logs -f socketio-service

socket-restart: ## Restart socketio-service
	docker compose restart socketio-service

# Individual service management
api-up: ## Start api-gateway only
	docker compose up -d api-gateway

leaders-up: ## Start leaders-service only
	docker compose up -d leaders-service

leaders-logs: ## Show leaders-service logs
	docker compose logs -f leaders-service

wallet-up: ## Start wallet-service only
	docker compose up -d wallet-service

users-up: ## Start users-service only
	docker compose up -d users-service

rally-up: ## Start rally-service only
	docker compose up -d rally-service

marketplace-up: ## Start marketplace-service only
	docker compose up -d marketplace-service

endorsement-up: ## Start endorsement-service only
	docker compose up -d endorsement-service

mpesa-up: ## Start mpesa-service only
	docker compose up -d mpesa-service

mpesa-logs: ## Show mpesa-service logs
	docker compose logs -f mpesa-service

# Status check
status: ## Show detailed status of all services
	@echo "=== Container Status ==="
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "=== Service Health ==="
	@curl -s http://localhost:8009/health 2>/dev/null && echo "✅ API Gateway" || echo "❌ API Gateway"
	@curl -s http://localhost:8006/health 2>/dev/null && echo "✅ Leaders Service" || echo "❌ Leaders Service"
	@curl -s http://localhost:8011/health 2>/dev/null && echo "✅ M-Pesa Service" || echo "❌ M-Pesa Service"
	@curl -s http://localhost:8010/socket.io/?EIO=4 2>/dev/null && echo "✅ Socket.IO" || echo "❌ Socket.IO"

# Battle images specific
battle-check: ## Check battle images
	@echo "=== Battle Files ==="
	@ls -la /opt/-WELT-TALLIS-SIASA-HUB-APPLICATION-/server/leaders-service/uploads/battles/ | wc -l
	@echo "Total battle files found"

help: ## Show help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'