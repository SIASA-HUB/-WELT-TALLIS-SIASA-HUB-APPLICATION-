.PHONY: up down restart logs ps

up: ## Start all services
	make -C server up
	make -C campaing up

down: ## Stop all services
	make -C campaing down
	make -C server down

restart: ## Restart all services
	make down
	make up

logs: ## Show logs
	make -C server logs
	make -C campaing logs

ps: ## Show status
	docker ps
