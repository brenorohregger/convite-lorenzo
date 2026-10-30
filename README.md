# Convite do Lorenzo 🕸️

Site em **Vue 3 + Vite**, com convite de aniversário, lista de presentes sem login e reservas compartilhadas em **Supabase / PostgreSQL**. Tema azul e vermelho com teias, inspirado no modelo do Canva enviado.

## Comece por aqui

**Quer só ver como ficou?** Abra **`ABRIR_PREVIA.html`** com dois cliques. Ela funciona sem instalar nada e é uma demonstração com escolhas locais. Depois de editar o código, gere novamente esse arquivo com `npm run preview:file`.

1. Extraia o ZIP e abra a pasta `convite-lorenzo` no VS Code.
2. Instale o [Node.js](https://nodejs.org/): versão **22.12 ou superior**, preferencialmente uma versão LTS.
3. No terminal, dentro dessa pasta:

   ```bash
   npm install
   npm run dev
   ```

4. Abra o endereço que aparecer no terminal, geralmente `http://localhost:5173`.

Sem `.env`, `npm run dev` abre uma **demonstração identificada por uma faixa amarela**. É possível experimentar a seleção e usar “Reiniciar” para limpar os testes. As escolhas da demonstração ficam somente nesse navegador e não são compartilhadas pela internet.

Para ter reservas reais entre celulares e computadores, siga a configuração do banco abaixo. Nenhum convidado precisa criar conta ou informar o nome.

## Alterar nome, data, horário e local

Abra **`src/config/event.js`**. Tudo do convite está concentrado nele:

```js
name: 'Lorenzo',
date: 'xx/xx/xxxx',
time: 'xx:xx',
location: 'xxxxxxxx',
mapsUrl: '',
```

Substitua os campos quando tiver as informações. `mapsUrl` é opcional: cole um link HTTPS do Google Maps para aparecer “Ver no mapa”. A mensagem, o texto sobre presentes e a assinatura também são editáveis nesse arquivo. Depois de publicar, alterações no código precisam de um novo deploy para aparecerem no site.

## O que já está incluído

- Convite responsivo com os campos provisórios solicitados.
- Botão “Ver lista de presentes” e navegação pelo convite.
- Nove sugestões do modelo: perfume; dois tênis tamanho 25; calça, conjunto e casaco tamanho 5; brinquedo do Homem-Aranha e dois brinquedos de escolha livre.
- Confirmação antes de reservar, filtro de disponíveis e escolhidos e avisos de sucesso ou indisponibilidade.
- Reserva anônima e definitiva para o visitante. Apenas você, pelo painel do banco, pode liberar uma reserva.
- Atualização automática da lista a cada 8 segundos enquanto a página está visível, ao voltar à aba e pelo botão de atualizar.
- Bloqueio de duplicidade no banco, inclusive com tentativas simultâneas. A atualização visual pode levar alguns segundos, mas um item já reservado não pode ser confirmado por outro visitante.
- Estados de carregamento, lista vazia, erro de conexão e acesso por teclado.
- Fontes e ilustrações locais, sem depender de imagens externas.

Os tênis e os brinquedos repetidos têm identificadores separados: representam **duas unidades desejadas**, como no modelo. Se quiser apenas um de cada, remova ou desative a segunda opção no banco.

## 1. Criar o banco online no Supabase

1. Entre em [supabase.com](https://supabase.com/) e crie sua conta de administrador.
2. Crie um projeto. Anote a senha do banco em um lugar privado; ela **não é usada no site**.
3. Abra **SQL Editor → New query**.
4. Copie todo o conteúdo de **`supabase/schema.sql`**, cole no editor e clique em **Run**.
5. No **Table Editor**, confira se a tabela **`gifts`** tem as nove sugestões.
6. No diálogo **Connect** do projeto ou em **Settings → API Keys**, copie:
   - a **Project URL**, no formato `https://seu-projeto.supabase.co`;
   - a **Publishable key**, iniciada por **`sb_publishable_`**.

O SQL já configura as permissões dos convidados: eles podem ler os presentes ativos e chamar a função de reserva. Não podem editar, excluir, adicionar itens ou desfazer escolhas diretamente.

**Use somente a publishable key no frontend. Não coloque senha do PostgreSQL, chave `sb_secret_` ou `service_role` no código nem em variáveis `VITE_`.** As variáveis `VITE_` vão para o navegador. A publishable key foi feita para esse uso, com as permissões limitadas pelo SQL.

Não é necessário configurar Supabase Auth, login anônimo, Realtime, servidor Node ou WebSocket. A lista usa a API do banco e consulta periódica.

## 2. Conectar o site ao banco

Copie **`.env.example`** para **`.env`** na raiz do projeto e preencha:

```dotenv
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_sua_chave_publica_real
VITE_DEMO_MODE=false
```

Pare o servidor com `Ctrl+C` e execute `npm run dev` novamente. A faixa amarela deve desaparecer e os presentes devem ser carregados do banco.

Se não carregar, confirme que o projeto Supabase está ativo, que o SQL foi executado inteiro e que as duas variáveis correspondem ao mesmo projeto. Confirme também que a Data API está habilitada para o schema `public`, caso tenha modificado essa configuração no Supabase.

Em caso de erro, o site pausa novas escolhas e oferece atualizar a lista. Ele nunca troca silenciosamente uma reserva real por uma simulação local.

## 3. Hospedar na Vercel — opção sugerida

O frontend fica na **Vercel** e os dados persistem no **Supabase**. O seu computador pode estar desligado.

### Pelo GitHub

1. Crie um repositório na sua conta e envie os arquivos da pasta `convite-lorenzo`.
2. Não envie `node_modules`, `dist` nem `.env`. O `.gitignore` já exclui esses arquivos.
3. Acesse [vercel.com](https://vercel.com/), escolha **Add New → Project** e importe o repositório.
4. Selecione **Vite** como framework. A raiz deve ser a pasta que contém `package.json`.
5. Use **Build Command:** `npm run build` e **Output Directory:** `dist`.
6. Em **Environment Variables**, adicione as três variáveis do `.env`, com os valores reais. Mantenha `VITE_DEMO_MODE=false`.
7. Clique em **Deploy**. O projeto já inclui `vercel.json` com a configuração.
8. Abra a URL de produção fornecida pela Vercel. Confira se o convite aparece sem pedir login. Se a plataforma ativar proteção de acesso para a produção, ajuste **Deployment Protection** para permitir os convidados.

Mudou uma variável no painel? Faça **Redeploy**: o Vite incorpora as variáveis durante a compilação. Mudou `event.js`? Envie o novo código ao repositório para gerar outro deploy.

### Pelo terminal, sem GitHub

Com o `.env` preenchido, você pode usar o CLI oficial:

```bash
npm install -g vercel
vercel login
vercel
```

Vincule o projeto à sua conta. No painel da Vercel, configure as três variáveis de ambiente para **Production**. Depois publique com:

```bash
vercel --prod
```

### Alternativa: Netlify

O projeto também inclui `netlify.toml`. Importe o repositório em [netlify.com](https://www.netlify.com/), adicione as mesmas variáveis e use `npm run build` com saída em `dist`. Também é possível gerar `dist` com o `.env` real localmente e usar o upload manual da pasta na Netlify.

## 4. Conferir antes de enviar o convite

1. Abra o endereço **de produção** em dois navegadores ou celulares diferentes.
2. Confirme que **não aparece “Modo demonstração”** e que ninguém precisa fazer login.
3. Escolha um presente no primeiro aparelho e confirme.
4. No segundo, atualize a lista: ele deve estar marcado como escolhido.
5. Se os dois tentarem reservar o mesmo item ao mesmo tempo, somente uma reserva será confirmada; o outro verá que o item já foi escolhido.
6. Libere esse presente de teste pelo painel, conforme abaixo.

O código e as permissões SQL foram testados localmente com PostgreSQL via PGlite. A conexão com o **seu projeto Supabase** só pode ser verificada depois de configurá-lo.

## Administrar os presentes

Use **Supabase → Table Editor → gifts**, conectado à sua conta de administrador.

| Campo | Para que serve |
| --- | --- |
| `id` | Identificador único; use algo como `livro-1`. Não altere depois de divulgar. |
| `title` | Nome exibido no cartão. |
| `description` | Tamanho, observações e detalhes da opção. |
| `category` | Pequena etiqueta, como Roupinhas ou Diversão. |
| `icon` | Ilustração: `perfume`, `shoe`, `pants`, `outfit`, `jacket`, `spider`, `blocks`, `rocket` ou `gift`. |
| `sort_order` | Ordem dos cartões: 1, 2, 3… |
| `active` | `true` mostra; `false` esconde e impede novas reservas. |
| `reserved_at` | Vazio/NULL = disponível; preenchido = escolhido. Não é um campo de texto vazio. |

Para **liberar uma reserva**, escolha o registro e defina `reserved_at` como **NULL**. Você também pode executar no SQL Editor:

```sql
-- Troque o identificador pelo presente que deseja liberar.
update public.gifts set reserved_at = null where id = 'perfume';
```

Para **incluir um presente**:

```sql
insert into public.gifts
  (id, title, description, category, icon, sort_order)
values
  ('livro-1', 'Livro infantil', 'Uma história para se aventurar.', 'Diversão', 'gift', 10);
```

Essas mudanças no banco aparecem no site sem recompilar. O arquivo `src/data/gifts.js` é somente para a demonstração. O SQL inicial usa `ON CONFLICT DO NOTHING`: executá-lo de novo preserva reservas e não sobrescreve edições de presentes já cadastrados.

## Por que duas pessoas não conseguem reservar o mesmo item?

O visitante chama `reserve_gift(id)`. Dentro do PostgreSQL, a função executa um único `UPDATE` com a condição `reserved_at IS NULL`. O bloqueio da linha e a reavaliação dessa condição garantem que apenas a primeira tentativa mude o registro. Não há uma verificação de disponibilidade seguida de gravação separada no navegador.

Sem login, qualquer pessoa que possua o endereço pode fazer escolhas. O site não identifica quem reservou e não limita uma escolha por pessoa. A janela de confirmação evita toques acidentais; a administração das reservas fica com você. Não há coleta de nomes ou e-mails no aplicativo; os provedores de hospedagem mantêm seus próprios registros operacionais.

## Planos de hospedagem

A documentação consultada em **28/10/2026** oferece opções gratuitas para pequenos projetos. Verifique os limites e as condições atuais diretamente nos provedores antes de ativar um plano.

No Supabase Free, projetos com baixa atividade podem ser pausados após um período de sete dias. Se isso acontecer, use **Resume project** no painel antes de divulgar ou reabrir o convite. Projetos pagos não ficam sujeitos à pausa automática por inatividade. Não é necessário contratar domínio próprio: você pode usar o endereço fornecido pela hospedagem.

## Comandos e verificação

```bash
npm run dev           # Desenvolvimento; sem .env usa a demonstração
npm test              # Testes do SQL, permissões e validação da configuração
npm run build         # Versão real: exige variáveis preenchidas e demo=false
npm run build:preview # Gera apenas uma demonstração identificada
npm run preview:file  # Recria ABRIR_PREVIA.html após editar o código
npm run preview       # Serve o último build gerado
```

`npm run build` recusa configuração ausente, chave secreta e modo demonstração, para evitar publicar reservas que só existiriam em um navegador. `build:preview` é apenas para avaliar o visual, e mantém a faixa amarela visível.

## Estrutura

```text
src/config/event.js       Informações do convite
src/App.vue               Convite, lista e fluxo de reserva
src/style.css             Cores, layout e adaptação para celular
src/components/           Ícones, ilustrações e janela de confirmação
src/services/gifts.js     Acesso ao Supabase e modo demonstração
src/data/gifts.js         Presentes apenas da demonstração
supabase/schema.sql       Tabela, sugestões, permissões e reserva atômica
scripts/                  Validação para gerar o site
tests/                    Verificação do banco e da configuração
```

## Referências oficiais

- [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Funções no Supabase](https://supabase.com/docs/guides/database/functions)
- [Segurança de linhas no Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Chaves públicas e secretas](https://supabase.com/docs/guides/getting-started/api-keys)
- [Pausa de projetos gratuitos](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Planos Supabase](https://supabase.com/pricing)

O modelo do Canva foi usado como referência de tema e sugestões. O ZIP contém código e ilustrações vetoriais próprios; o arquivo original do Canva permanece intacto.
