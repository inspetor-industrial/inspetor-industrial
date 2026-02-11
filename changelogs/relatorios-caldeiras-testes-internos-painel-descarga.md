---
title: "Relatórios de Caldeiras: Testes Internos, Painel Elétrico e Sistema de Descarga"
date: "2026-02-11"
version: "1.7.0"
description: "Novos blocos nos relatórios de inspeção de caldeiras (testes internos, testes de instalação local, painel elétrico e sistema de descarga), tabela de equipamentos por perfil e permissões ampliadas para o OPERATOR."
---

## v1.7.0 (2026-02-11)

### Novos Blocos nos Relatórios de Caldeiras, Tabela por Perfil e Permissões do OPERATOR

Esta versão adiciona **quatro novos blocos** ao relatório de inspeção de caldeiras (fluxo por etapas): sistema de descarga, painel elétrico, testes de instalação local realizados e testes internos realizados. Inclui também **melhorias na tabela de equipamentos** (colunas visíveis conforme o perfil) e **permissões ampliadas** para o perfil OPERATOR em manutenção diária e equipamentos.

### Novidades

#### Sistema de Descarga

O relatório de inspeção de caldeiras passa a contar com uma seção dedicada ao **sistema de descarga**:

- Registro das características e condições do sistema de descarga do equipamento
- Tipos e opções alinhados às NRs de referência
- Formulário integrado ao fluxo por etapas do relatório
- Dados salvos e vinculados ao relatório da caldeira

> Essas informações complementam o prontuário e facilitam o rastreio em inspeções futuras.

---

#### Painel Elétrico

Nova seção para registrar o **painel elétrico** no relatório:

- Características e condições do painel elétrico da caldeira
- Tipos e dados iniciais conforme referências normativas
- Formulário acessível na navegação por etapas do relatório
- Informações vinculadas ao relatório de inspeção

---

#### Testes de Instalação Local Realizados

Os relatórios ganham um bloco para **testes de instalação local realizados**:

- Registro dos testes realizados na instalação local do equipamento
- Tipos e itens conforme NRs, com dados iniciais para preenchimento rápido
- Formulário integrado ao fluxo por etapas
- Histórico dos testes associado ao relatório da caldeira

---

#### Testes Internos Realizados

Incluímos uma seção específica para **testes internos realizados**:

- Registro dos testes realizados no interior do equipamento
- Tipos e definições alinhados às normas de referência
- Formulário dentro do fluxo por etapas do relatório
- Dados organizados por relatório para consulta e análise

> Os blocos de testes (internos e de instalação local) permitem documentar de forma padronizada o que foi executado em cada inspeção, atendendo às exigências das NRs.

---

### Melhorias

#### Tabela de Equipamentos por Perfil

A listagem de **equipamentos de manutenção** passou a exibir colunas conforme o perfil do usuário:

- **Perfil ADMIN**: visualiza todas as colunas disponíveis na tabela
- **Perfil OPERATOR**: visualiza um conjunto de colunas adequado à operação do dia a dia

Assim, cada perfil vê apenas as informações relevantes para seu uso, mantendo a tela mais objetiva.

---

#### Permissões do Perfil OPERATOR

As permissões do perfil **OPERATOR** foram ampliadas:

- **Manutenção diária**: o OPERATOR pode gerenciar (criar, ler, atualizar e excluir) registros de manutenção diária
- **Equipamentos de manutenção**: o OPERATOR tem permissão de leitura na listagem e nos dados dos equipamentos de manutenção

Isso permite que operadores registrem e consultem manutenções e equipamentos dentro do escopo de sua atuação, sem precisar de perfil ADMIN.

---

#### Estabilidade e Consistência do Sistema

- Atualização do Prisma e do cliente de banco de dados para a versão 7.3.0, com melhorias de compatibilidade e desempenho
- Ajustes no projeto: inclusão no `.gitignore` de arquivos de restore e backup (ex.: `restore_neon` e arquivos de backup), evitando que sejam versionados por engano
