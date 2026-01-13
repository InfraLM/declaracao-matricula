# Configuração do Google Sheets (Service Account)

Para que o sistema possa acessar uma planilha central (para salvar logs ou solicitações) sem exigir permissões de cada usuário individualmente, usamos uma **Service Account**. É como um "robô" que tem permissão para ler/escrever na planilha.

## Passo a Passo para Gerar as Credenciais

1.  Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2.  Selecione o projeto que você já criou (ou crie um novo).
3.  No menu lateral, vá em **APIs e Serviços** > **Credenciais**.
4.  Clique em **+ CRIAR CREDENCIAIS** e selecione **Conta de serviço (Service Account)**.
5.  Preencha os dados:
    *   **Nome:** ex: `sistema-declaracoes`
    *   **ID:** será gerado automaticamente.
    *   Clique em **CRIAR E CONTINUAR**.
6.  (Opcional) Em "Papéis", você pode deixar em branco ou colocar "Editor" (mas controlaremos o acesso pela planilha). Clique em **CONCLUIR**.

### Criando a Chave (Private Key)

1.  Na lista de Credenciais, clique no **e-mail** da Conta de Serviço que você acabou de criar (ex: `sistema-declaracoes@seu-projeto.iam.gserviceaccount.com`).
2.  Vá na aba **CHAVES**.
3.  Clique em **ADICIONAR CHAVE** > **Criar nova chave**.
4.  Selecione o tipo **JSON** e clique em **CRIAR**.
5.  Um arquivo `.json` será baixado no seu computador. **Guarde-o com segurança!**

### Pegando os Dados

Abra esse arquivo `.json` (pode usar o bloco de notas ou VS Code). Você precisará de dois campos dele:

1.  `client_email`: O e-mail do robô.
2.  `private_key`: A chave privada inteira (incluindo `-----BEGIN PRIVATE KEY-----` e as quebras de linha `\n`).

### Compartilhando a Planilha

1.  Crie uma nova planilha no Google Sheets (ou abra uma existente).
2.  Clique no botão **Compartilhar** (Share) no canto superior direito.
3.  Cole o `client_email` da Conta de Serviço (o e-mail do robô) e dê permissão de **Editor**.
4.  Copie o **ID da Planilha** da URL.
    *   URL: `https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqrStuvWxYz/edit`
    *   ID: `1aBcDeFgHiJkLmNoPqrStuvWxYz`

### Resumo dos Dados Necessários

Envie no chat:
*   **Client Email**
*   **Private Key**
*   **Spreadsheet ID**
