# NASA APOD Explorer — Explorador do Universo

Aplicação web acadêmica para explorar o Astronomy Picture of the Day (APOD), da NASA. O projeto demonstra consumo de uma API externa, separação entre frontend e backend, validação de datas, proteção de credenciais e desenvolvimento incremental com Git.

## Funcionalidades

- Consulta automática da publicação do dia e busca por data, sem recarregar a página.
- Exibição de título, data, explicação e mídia. O usuário pode voltar à publicação do dia ou repetir uma consulta que falhou.
- Validação de datas reais, de 16/06/1995 até hoje, no formulário e no servidor.
- Interface responsiva com rótulo no seletor de data, navegação por teclado, foco visível, anúncios de carregamento e erro e respeito à preferência por movimento reduzido.

## Tecnologias e escolhas

O frontend usa HTML5 semântico, CSS3 com Grid e Flexbox e JavaScript moderno com Fetch API. Esses recursos cobrem o formulário, a responsividade e a atualização da página com poucas dependências. O Node.js permite usar JavaScript também no servidor. O Express serve os arquivos estáticos e organiza a rota de consulta, e o dotenv carrega a configuração local. O npm gerencia as dependências e o Git registra a evolução do projeto. O conteúdo vem do acervo da NASA e a aplicação não precisa armazenar dados em banco.

## Arquitetura

1. O navegador carrega a interface e consulta `GET /api/apod`, com ou sem `?date=AAAA-MM-DD`.
2. A rota Express valida a data e delega a consulta ao serviço.
3. O serviço usa HTTPS para consultar o endpoint oficial da NASA, aplica o limite de espera e devolve apenas os campos de publicação usados pela interface.
4. O navegador insere os textos com `textContent` e monta a mídia conforme o tipo retornado.

```text
NASA/
├── .github/
│   └── copilot-instructions.md
├── docs/
│   └── interacoes-copilot.md
├── public/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── src/
│   ├── routes/apodRoutes.js
│   ├── services/nasaService.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Instalação e execução

Use Node.js 24 ou superior, npm, um navegador moderno e conexão com a internet. Execute os comandos na raiz do projeto.

1. Instale as dependências.

   ```bash
   npm install
   ```

2. No portal NASA Open APIs, use o formulário **Generate API Key** para solicitar uma chave gratuita. Preencha os dados solicitados e guarde a chave recebida. [NASA Open APIs](https://api.nasa.gov/)

3. Copie `.env.example` para `.env` na raiz do projeto. Mantenha a porta indicada abaixo ou escolha outra e preencha o campo da chave localmente.

   ```dotenv
   PORT=3000
   NASA_API_KEY=
   ```

4. Inicie o servidor.

   ```bash
   npm start
   ```

   No PowerShell, se a execução de `npm.ps1` estiver bloqueada, use `npm.cmd install` e `npm.cmd start`.

5. Abra [http://127.0.0.1:3000/](http://127.0.0.1:3000/). Se modificou `PORT`, use a porta configurada. Reinicie o servidor após editar o `.env`.

## Uso e suporte a mídia

A página consulta o APOD atual ao abrir. Para buscar outra publicação, escolha uma data e pressione **Explorar o universo**. Use **Ver imagem de hoje** para voltar ao APOD atual.

Para uma resposta do tipo imagem, a interface usa a URL em alta resolução quando disponível ou um endereço compatível no campo `url`. A mídia mantém sua proporção. O iframe é usado para endereços de incorporação permitidos do YouTube e Vimeo. A interface oferece um link quando a publicação ou mídia original está disponível, inclusive quando a NASA fornece somente a página de uma publicação em vez do endereço necessário para incorporar o vídeo.

## Erros, timeouts e segurança

O backend limita a consulta externa a 15 segundos. O navegador limita a consulta local a 20 segundos e cancela a anterior quando o usuário inicia outra. Erros de configuração, limite de requisições, indisponibilidade e falta de conteúdo recebem mensagens próprias. **Tentar novamente** fica disponível para falhas recuperáveis.

A chave é lida pelo backend e usada somente na chamada HTTPS ao endpoint fixo da NASA. O navegador consulta apenas a API interna e recebe dados normalizados. As URLs retornadas são verificadas e o serviço estático expõe somente `public/`. O Git ignora `.env` e `node_modules/`, e `.env.example` mantém o campo da chave vazio.

## Validação e uso de IA

Os testes com respostas simuladas verificam o comportamento da interface. Os resultados de chamadas reais à NASA são registrados separadamente, pois o serviço externo apresentou respostas intermitentes, incluindo HTTP 504 na rota local.

O **Codex** auxiliou na pesquisa, implementação, revisão, testes e documentação. O arquivo de instruções foi criado para orientar o GitHub Copilot no repositório. As cinco interações registradas ocorreram com o Codex. [Registro das cinco interações](docs/interacoes-copilot.md)

## Créditos e referências

As publicações e os créditos de mídia constam no acervo oficial do APOD. Consulte a publicação original para identificar os autores e as condições de uso de cada conteúdo.

- [NASA Open APIs](https://api.nasa.gov/)
- [Documentação do serviço APOD](https://github.com/nasa/apod-api#docs)
- [Astronomy Picture of the Day — NASA Science](https://science.nasa.gov/apod/)
