# Contexto base — Duelo de Magos

O Duelo de Magos é um jogo local de combate 1v1 por turnos para dois jogadores humanos no mesmo computador.

A interface gráfica 2D roda em navegador desktop, com HTML, CSS e JavaScript em módulos. Uma webcam reconhece gestos para selecionar magias; os dados virtuais são gerados pelo software.

Manter responsabilidades separadas entre motor de combate, geração de dados, interface/controlador e visão computacional. Usar contratos explícitos nas entradas, saídas e transições de estado; distinguir comportamento especificado, comportamento implementado e evidência observada.

O objetivo final é um jogo local completo, do menu ao resultado da partida, acompanhado de instruções suficientes para iniciar e usar seus recursos.

Este arquivo contém somente a base estável. Regras e decisões vigentes, estado das entregas e evidências pertencem às [fontes do projeto](README.md). Para retomar uma etapa, seguir o [Pipeline Context Handoff](docs/handoffs/README.md) e os limites de [AGENTS.md](AGENTS.md).
