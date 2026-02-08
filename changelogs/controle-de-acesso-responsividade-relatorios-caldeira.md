---
title: "Controle de Acesso, Responsividade e Relatórios de Caldeira"
date: "2026-02-08"
version: "1.6.0"
description: "Controle de acesso por perfil, telas adaptadas para tablets e celulares e novos blocos nos relatórios de inspeção de caldeiras."
---

## v1.6.0 (2026-02-07)

### Controle de Acesso por Perfil, Uso em Tablets e Celulares e Novos Blocos nos Relatórios de Inspeção de Caldeiras

Esta versão traz **controle do que cada usuário pode ver e fazer** no sistema conforme seu perfil, **telas adaptadas para uso em tablets e celulares** (cadastros e edições em campo) e **novos blocos nos relatórios de inspeção de caldeiras**: fornalha, espelhos, tubos, corpo, operador, medidor injetor (manômetro), alimentação elétrica e testes externos realizados.

### Novidades

#### Controle de Acesso por Perfil

O sistema passou a respeitar **permissões por perfil** em todo o uso:

- O menu e a tela inicial mostram apenas o que o seu perfil permite acessar
- Cadastro e edição de **equipamentos** (bombas, instrumentos, válvulas, relatórios de caldeiras) e **manutenções** só aparecem ou são liberados conforme sua permissão
- Ao trabalhar com **clientes e empresas**, é possível filtrar por empresa e o sistema verifica se você tem permissão para aquela organização
- Antes de **excluir um equipamento**, o sistema pede confirmação para evitar exclusões acidentais

Assim, cada engenheiro ou técnico vê apenas o que precisa e pode alterar apenas o que seu perfil permite.

---

#### Uso em Tablets e Celulares

As telas de **cadastro e edição** foram adaptadas para uso em **tablets e celulares**:

- **Relatórios de inspeção de caldeira**: telas que se adaptam ao tamanho do dispositivo, campos organizados e seleção de cliente e engenheiro responsável
- **Documentos**: filtros e listagem com paginação para encontrar arquivos com mais facilidade
- **Armazenamento (pastas e arquivos)**: telas de criação e edição adaptadas, busca e opção de limpar filtros
- **Instrumentos, bombas e válvulas**: cadastro e edição com campos ajustados para leitura e preenchimento em tela pequena
- **Usuários**: cadastro e edição com seleção de empresa
- **Empresas e clientes**: cadastro e edição pensados para uso em campo

Você pode consultar dados, preencher relatórios e fazer cadastros diretamente no local da inspeção.

---

#### Novos Blocos nos Relatórios de Inspeção de Caldeiras

Os relatórios de inspeção de caldeiras ganharam **novas seções** para registrar informações técnicas conforme a prática de inspeção e as NRs:

**Testes externos realizados**

- Registro dos **testes realizados externamente** ao equipamento (ex.: hidrostático, inspeção visual externa), com data, responsável e resultado
- Referência às NRs aplicáveis
- Os dados ficam organizados por relatório e integrados ao fluxo por etapas

**Alimentação elétrica (bombas e equipamentos auxiliares)**

- Registro da **alimentação elétrica** de bombas e equipamentos auxiliares ligados à caldeira
- Tensão, corrente e proteções, com espaço para observações de inspeção
- Campos alinhados às NRs de referência

**Informações dos espelhos**

- Seção para **espelhos da caldeira**: identificação, materiais, espessuras, condição de fixação e soldas, medições e não-conformidades

**Medidor injetor (manômetro de pressão)**

- Registro do **manômetro de pressão** (faixa, classe de exatidão, condições de instalação e leitura)
- **Anexo de foto** da indicação do instrumento ou de detalhes relevantes em campo, vinculado ao relatório

**Informações da fornalha**

- Registro das **características da fornalha**: tipo, dimensões, material de revestimento, condições observadas na inspeção
- **Testes gerais** realizados durante a inspeção em um bloco próprio do relatório

**Tubos e corpo da caldeira**

- **Estrutura tubular**: quantidade e disposição dos tubos, materiais e espessuras de projeto, medições de espessura e observações por zona
- **Corpo da caldeira**: características construtivas, materiais, espessuras, condições operacionais e medições

**Dados da caldeira e do operador**

- **Identificação e projeto** da caldeira organizados em subseções (TAG, série, fabricante, pressões, temperaturas, capacidade, etc.); os dados já cadastrados no equipamento podem ser carregados e ajustados no relatório
- **Operador**: nome, função, certificado de capacitação (com validação de validade) e contato
- **Navegação por etapas**: o relatório pode ser preenchido seção por seção, com indicação do que já foi preenchido e acesso direto a cada parte

> Esses blocos complementam o prontuário do equipamento e facilitam o rastreio e a análise em inspeções futuras.

---

### Melhorias

#### Estabilidade e Consistência do Sistema

- Ajustes internos no controle de permissões e na organização dos dados dos relatórios de caldeira para maior estabilidade
- Mensagens de erro nos formulários (medidor injetor, corpo, tubos e demais seções) mais claras e padronizadas quando algum campo precisa ser corrigido
- Filtro de equipamentos na listagem simplificado para uso mais direto

---

### Correções

#### Preenchimento dos Relatórios de Caldeira

- **Espaçamento**: foi aumentado o espaço entre as seções na tela de preenchimento do relatório por etapas, para leitura mais confortável
- **Barra de ferramentas**: a barra com os botões de salvar e navegar entre etapas deixou de cobrir o conteúdo do formulário em diferentes tamanhos de tela
