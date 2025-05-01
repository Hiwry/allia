# Implementação de Valores de Personalização

Este documento descreve as modificações realizadas para implementar a funcionalidade de valores de personalização no painel de novos pedidos.

## Alterações Implementadas

### 1. Melhoria no Componente StepPersonalizacao

- Substituição do `fetch` direto por uma chamada à função `getPersonalizacoes` da API
- Adição de indicadores de carregamento e tratamento de erros
- Implementação de funcionalidade para recalcular valores quando a quantidade do item muda

### 2. Melhoria no Componente PersonalizacaoSerigrafia

- Aprimoramento da função `getValorFaixa` para tratar melhor o caso em que não existe faixa para a quantidade selecionada
- Adição de feedback visual para o usuário sobre os valores encontrados
- Criação de um componente para exibir as faixas de valores disponíveis
- Apresentação do valor correto na seleção de tamanho

### 3. Implementação no StepConfirmacao

- Adição de uma seção para visualizar detalhes dos valores de personalização durante a finalização do pedido
- Formatação aprimorada para valores monetários
- Exibição completa de detalhes de aplicações, incluindo tamanho, local, cores e valores

## Como Funciona

1. Quando o usuário chega na etapa de personalização, o sistema carrega as faixas de preços da API via `getPersonalizacoes`
2. Ao selecionar um tamanho, o sistema busca o valor correspondente na faixa adequada para a quantidade de itens
3. Se não encontrar uma faixa exata, usa uma abordagem de aproximação (menor faixa para quantidades inferiores, maior faixa para quantidades superiores)
4. Os valores são recalculados automaticamente se a quantidade do item mudar
5. Na etapa de confirmação, o usuário pode revisar todos os valores em detalhes

## Tratamento de Erros

- Se a API falhar ao carregar os valores, o sistema exibe uma mensagem informativa
- Valores padrão são utilizados como fallback em caso de problemas
- Alertas visuais são exibidos quando não há faixas de valores configuradas

## Próximos Passos

- Considerar a implementação de um cache local para os valores de personalização
- Melhorar o tratamento de transições entre faixas de valores
- Criar uma interface para o usuário administrador configurar as faixas de valores diretamente pela interface 