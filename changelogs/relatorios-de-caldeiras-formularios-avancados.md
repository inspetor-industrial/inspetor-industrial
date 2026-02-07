---
title: "Formulários Avançados de Relatórios de Caldeiras"
date: "2026-02-07"
version: "1.5.0"
description: "Novos blocos de formulário para relatórios de inspeção de caldeiras: informações da fornalha, espelhos, tubos, corpo, operador, medidor injetor, testes externos e alimentação elétrica, além de melhorias na navegação entre etapas."
---

### Novidades

Esta atualização expande significativamente o **conteúdo dos relatórios de inspeção de caldeiras**. Novas seções permitem registrar informações técnicas detalhadas em formulários dedicados, mantendo o fluxo por etapas que você já conhece.

---

#### Informações da Fornalha

Agora você pode registrar as **características da fornalha** diretamente no relatório:

- Tipo e dimensões da fornalha
- Material de revestimento
- Condições observadas durante a inspeção
- Campos alinhados aos requisitos da NR-13

> Esses dados complementam o prontuário do equipamento e facilitam o rastreio em inspeções futuras.

---

#### Informações dos Espelhos

Incluímos uma seção específica para **espelhos da caldeira**:

- Identificação e localização dos espelhos
- Materiais e espessuras
- Condição de fixação e soldas
- Registro de medições e não-conformidades

---

#### Informações de Tubos

Registre os dados da **estrutura tubular** do equipamento:

- Quantidade e disposição dos tubos
- Materiais e espessuras de projeto
- Medições de espessura realizadas
- Observações por grupo ou zona

---

#### Informações do Corpo da Caldeira

Uma seção dedicada ao **corpo da caldeira**:

- Características construtivas
- Materiais e espessuras
- Condições operacionais e medições
- Histórico de reparos quando aplicável

---

#### Dados da Caldeira (Identificação e Projeto)

O formulário de **dados da caldeira** foi ampliado e organizado em subseções:

- **Identificação**: TAG, série, fabricante, categoria NR-13
- **Projeto**: pressões, temperaturas, capacidade
- **Operação**: condições de uso e parâmetros atuais

Os campos são preenchidos automaticamente com os dados já cadastrados no equipamento quando disponíveis, e você pode ajustar o que for necessário para a inspeção.

---

#### Dados do Operador

Registre quem está **responsável pela operação** do equipamento no momento da inspeção:

- Nome e função do operador
- Certificado de capacitação quando exigido
- Validação da validade do certificado
- Contato para esclarecimentos

---

#### Medidor Injetor (Manômetro de Pressão)

Nova seção para o **medidor injetor** (manômetro de pressão):

- Faixa de medição e classe de exatidão
- Condições de instalação e leitura
- **Anexo de foto**: registre a indicação do instrumento ou detalhes relevantes em campo

> A foto fica vinculada ao relatório e ajuda na documentação e em análises posteriores.

---

#### Testes Externos Realizados

Registre os **testes realizados externamente** ao equipamento, conforme NR-13:

- Tipo de teste (ex.: hidrostático, inspeção visual externa)
- Data e responsável pela execução
- Resultado e observações
- Referência às normas aplicáveis

---

#### Alimentação Elétrica (Bombas e Equipamentos Auxiliares)

Para caldeiras e equipamentos com **alimentação elétrica** associada:

- Dados da alimentação de bombas e equipamentos auxiliares
- Tensão, corrente e proteções
- Conformidade com as NRs aplicáveis
- Observações de inspeção

---

#### Testes Gerais Realizados no Relatório

Os **testes gerais** realizados durante a inspeção agora têm um bloco próprio no relatório:

- Listagem dos testes executados
- Resultados e conclusões
- Integração com as demais seções do relatório

---

### Melhorias

#### Navegação entre Etapas do Relatório

A navegação pelo relatório de caldeira foi aprimorada:

**Barra de ferramentas**
- Acesso rápido a salvar, voltar e avançar entre seções
- Posicionamento ajustado para não cobrir o conteúdo
- Comportamento consistente em diferentes tamanhos de tela

**Passos e layout**
- Mais espaço entre as seções (padding) para leitura confortável
- Navegação entre etapas mais fluida
- Indicadores claros da etapa atual

**Organização dos formulários**
- Cada bloco de informações tem seu próprio formulário
- Salvamento independente por seção
- Possibilidade de desabilitar temporariamente o preenchimento de formulários quando necessário (uso administrativo)

---

#### Tratamento de Erros nos Formulários

Quando algo sai errado no preenchimento, a experiência foi melhorada:

- **Mensagens mais claras**: os avisos de validação explicam melhor o que deve ser corrigido
- **Campos destacados**: fica fácil identificar onde está o problema
- **Consistência**: o mesmo padrão de erro em todos os formulários do relatório (dados da caldeira, corpo, tubos, medidor injetor, etc.)

---

### Correções

#### Posicionamento da Barra de Ferramentas

- A barra de ferramentas dos formulários de relatório deixou de usar posicionamento fixo e passou a usar posicionamento absoluto em relação ao conteúdo.
- Com isso, a barra não sobrepõe mais o formulário de forma indesejada e o layout fica correto em diferentes resoluções.

---

#### Espaçamento do Layout dos Passos

- Foi adicionado padding adequado ao layout da tela de passos do relatório de caldeira.
- O conteúdo não fica mais colado nas bordas e a leitura fica mais confortável.

---

#### Autenticação e Compatibilidade

- Ajustes na forma como a sessão do usuário é obtida garantem melhor compatibilidade com o sistema de autenticação.
- Remoção de código e modelos não utilizados para evitar erros e manter o sistema estável.

---

#### Mensagens de Erro em Relatórios e Armazenamento

- Em falhas durante o carregamento ou envio de relatórios e documentos, as mensagens exibidas passam a ser mais informativas.
- Isso facilita a identificação da causa do problema e o contato com o suporte quando necessário.
