# NASA APOD — Explorador do Universo

## Tecnologias utilizadas

- Use HTML5 semântico, CSS3 e JavaScript ES6+ com Fetch API no frontend. Use Node.js, Express e dotenv no backend. Gerencie as dependências com npm.
- Trabalhe com VS Code, GitHub Copilot Chat, Git e GitHub. Não introduza React, Angular, Vue, TypeScript, Bootstrap, Tailwind, banco de dados ou dependências sem necessidade demonstrada.
- Implemente somente a etapa aprovada. Antes de criar código da aplicação, confirme que este arquivo foi aprovado e commitado. Para cada etapa, descreva as mudanças, apresente o código, confira estas regras, indique como testar e aguarde confirmação antes de avançar.
- Sugira commits semânticos após a validação e execute-os somente com autorização. Em `docs/interacoes-copilot.md`, registre pelo menos cinco interações reais confirmadas pelo usuário. Declare quais testes foram executados e quais ficaram pendentes.

## Arquitetura do sistema

- Use `public/index.html` para a estrutura da página, `public/css/style.css` para estilos e `public/js/app.js` para eventos, requisições e atualização da interface.
- Use `src/server.js` para configurar e iniciar o Express, `src/routes/apodRoutes.js` para validar e atender `GET /api/apod` e `src/services/nasaService.js` para consultar a NASA e normalizar a resposta.
- Ao abrir a página, consulte `/api/apod` sem data para obter a publicação do dia. Ao enviar o formulário, consulte `/api/apod?date=AAAA-MM-DD` e atualize a página sem recarregá-la.
- Valide datas de calendário no formato `AAAA-MM-DD`, de `1995-06-16` até hoje, inclusive. Aplique os limites na interface e valide novamente no servidor.
- Exiba título, data, explicação e mídia conforme `media_type`. Trate `hdurl` e `copyright` como opcionais e preserve o crédito quando disponível. Verifique se `url` aponta para uma página ou para um recurso de mídia. Se não houver uma mídia compatível para exibição, ofereça o link validado da publicação quando disponível.
- Mostre um estado de carregamento durante a consulta e mensagens amigáveis para data inválida, conteúdo indisponível, limite de requisições e falha de comunicação.
- Documente no `README.md` a arquitetura, a instalação, a configuração, o uso, a proteção da chave, os créditos e o trabalho com o Copilot.

## Estilização do frontend

- Use CSS mobile-first com Flexbox ou Grid. Verifique o layout em celular, tablet e computador, sem rolagem horizontal. Preserve a proporção da mídia sem distorção ou recorte.
- Use fundo azul-marinho escuro, detalhes em azul, roxo e branco e contraste adequado. Inclua o cabeçalho “NASA APOD — Explorador do Universo”, uma introdução breve, o campo de data, o botão “Explorar o universo”, a área do APOD e o rodapé com créditos à NASA.
- Associe um `label` ao campo de data. Mantenha o foco visível, forneça texto alternativo para imagens e título para vídeos incorporados. Anuncie carregamento e erros em regiões acessíveis.

## Segurança

- Carregue `NASA_API_KEY` com dotenv exclusivamente no backend. Mantenha `.env` e arquivos locais sensíveis fora do Git. Inclua `.env` e `node_modules/` no `.gitignore` e use apenas valores de exemplo em `.env.example`.
- Consulte a NASA via HTTPS no endpoint fixo `https://api.nasa.gov/planetary/apod`. Use a chave somente na requisição de saída. Mantenha a chave e a URL autenticada fora dos arquivos públicos, respostas ao cliente, mensagens de erro e logs.
- Sirva apenas `public/` como diretório estático. Nas requisições de dados, use somente `/api/apod` no frontend. Retorne apenas os campos necessários à interface e responda a falhas sem repassar o corpo bruto da NASA, rastros de execução ou detalhes internos.
- Trate a resposta da NASA como entrada externa. Extraia texto da explicação e renderize-o como texto. Valide URLs antes de retorná-las e aceite somente HTTPS, sem credenciais nem chave de API. Incorpore vídeos apenas de origens explicitamente permitidas e use um link validado para os demais casos.
