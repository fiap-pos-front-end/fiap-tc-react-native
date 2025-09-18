# App de Gestão Financeira - Tech Challenge 3

Um aplicativo de gestão financeira em React Native construído com Expo, Firebase e TypeScript. Este app fornece aos usuários ferramentas para gerenciar suas finanças pessoais, rastrear receitas e despesas, inserir arquivos como anexos, categorizar transações e visualizar seus dados financeiros através de dashboards interativos.

## 📱 Funcionalidades

### Autenticação

- Registro e login de usuários
- Verificação de email
- Funcionalidade de redefinição de senha
- Gerenciamento de perfil

### Gestão Financeira

- **Dashboard**: Visão geral do status financeiro com gráficos e estatísticas
- **Categorias**: Criar e gerenciar categorias de receitas/despesas
- **Transferências**: Registrar e rastrear transações financeiras
- **Perfil**: Gerenciamento da conta do usuário

### Visualização de Dados

- Gráficos de receitas/despesas mensais
- Análise de gastos por categoria
- Tendências e insights financeiros
- Dashboard interativo com dados em tempo real

## 🏗️ Estrutura do Projeto

```
fiap-tc-react-native/
├── app/                          # Diretório principal da aplicação (Expo Router)
│   ├── (auth)/                   # Telas de autenticação
│   │   ├── login/               # Tela de login
│   │   ├── signup/              # Tela de registro
│   │   └── forgot-password/     # Tela de redefinição de senha
│   ├── (tabs)/                  # Telas principais do app (navegação por abas)
│   │   ├── dashboard/           # Dashboard financeiro
│   │   ├── categories/          # Gerenciamento de categorias
│   │   ├── transfers/           # Gerenciamento de transações
│   │   └── profile/             # Perfil do usuário
│   ├── _layout.tsx              # Layout raiz
│   └── index.tsx                # Ponto de entrada
├── components/                   # Componentes de UI reutilizáveis
│   ├── ui/                      # Componentes específicos de UI
│   ├── AuthGuard.tsx            # Guard de autenticação
│   ├── CategoryPicker.tsx       # Componente de seleção de categoria
│   ├── DatePicker.tsx           # Componente de seleção de data
│   └── ...                      # Outros componentes
├── contexts/                     # Provedores de React Context
│   ├── AppContext.tsx           # Estado global do app
│   ├── AuthContext.tsx          # Estado de autenticação
│   ├── CategoryContext.tsx      # Gerenciamento de categorias
│   ├── DashboardContext.tsx     # Dados do dashboard
│   └── TransferContext.tsx      # Gerenciamento de transações
├── hooks/                        # Hooks customizados do React
│   ├── firebase/                # Hooks relacionados ao Firebase
│   │   ├── useAuth.ts           # Hook de autenticação
│   │   ├── useFirebaseCRUD.ts   # Operações CRUD
│   │   └── useStorage.ts        # Armazenamento de arquivos
│   ├── useCategories.ts         # Gerenciamento de categorias
│   ├── useTransfers.ts          # Gerenciamento de transações
│   └── ...                      # Outros hooks
├── services/                     # Serviços externos
│   ├── firebase.ts              # Configuração do Firebase
│   ├── firestore.ts             # Operações do Firestore
│   └── storage.ts                # Operações de armazenamento de arquivos
├── types/                        # Definições de tipos TypeScript
│   └── index.ts                 # Definições de tipos principais
├── utils/                        # Funções utilitárias
│   ├── calculations.ts          # Cálculos financeiros
│   ├── storage.ts               # Utilitários de armazenamento
│   └── seedData.ts              # Dados de exemplo
├── constants/                    # Constantes do app
│   ├── Colors.ts                # Definições de cores
│   ├── Icons.ts                 # Definições de ícones
│   └── LocaleConfig.ts          # Configurações de localização
└── assets/                       # Assets estáticos
    ├── fonts/                   # Fontes personalizadas
    └── images/                  # Imagens e ícones
```

**💡 Dicas:**

- **Novas telas**: Crie arquivos `.tsx` dentro de `app/(tabs)/` para telas principais ou `app/(auth)/` para telas de autenticação
- **Componentes reutilizáveis**: Adicione em `components/` com nomes descritivos (ex: `ButtonCustom.tsx`)
- **Lógica de negócio**: Crie hooks customizados em `hooks/` (ex: `useNewFeature.ts`)
- **Gerenciamento de estado**: Adicione novos contextos em `contexts/` se necessário
- **Serviços externos**: Implemente em `services/` para APIs ou integrações
- **Tipos TypeScript**: Defina interfaces em `types/index.ts`
- **Utilitários**: Adicione funções auxiliares em `utils/`

## 🛠️ Configuração de Desenvolvimento

### Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (para desenvolvimento iOS)
- Android Studio (para desenvolvimento Android)

### Instalação

1. **Clone o repositório e, então, acesse o diretório localmente na sua máquina**

   ```bash
   git clone https://github.com/fiap-pos-front-end/fiap-tc-react-native
   cd fiap-tc-react-native
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env` no diretório raiz com sua configuração do Firebase:

   ```env
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   USE_EMULATORS=true
   FIRESTORE_EMULATOR_PORT=8080
   ```

### Executando a Aplicação

1. **Inicie o servidor de desenvolvimento**

   ```bash
   npm start
   # ou
   npx expo start
   ```

2. **Execute em plataformas específicas**

   ```bash
   # iOS Simulator
   npm run ios

   # Android Emulator
   npm run android

   # Navegador web
   npm run web
   ```

3. **Build para produção**

   ```bash
   # iOS
   npx expo build:ios

   # Android
   npx expo build:android
   ```

## 🔧 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento do Expo
- `npm run android` - Executa no emulador Android
- `npm run ios` - Executa no simulador iOS
- `npm run web` - Executa no navegador web
- `npm run lint` - Executa ESLint para qualidade do código
- `npm run reset-project` - Reseta para um estado de projeto limpo

## 🚀 Stack Tecnológica

### Tecnologias Principais

- **React Native** (0.79.5) - Desenvolvimento mobile multiplataforma
- **Expo** (~53.0.22) - Plataforma e ferramentas de desenvolvimento
- **TypeScript** (~5.8.3) - Desenvolvimento JavaScript com tipagem
- **React** (19.0.0) - Biblioteca de interface

### Navegação e Roteamento

- **Expo Router** (~5.1.5) - Sistema de roteamento baseado em arquivos
- **React Navigation** (v7) - Biblioteca de navegação para React Native

### Backend e Banco de Dados

- **Firebase** - Backend-as-a-Service
- **Firebase Auth** - Autenticação de usuários
- **Firestore** - Banco de dados NoSQL
- **Firebase Storage** - Armazenamento de arquivos

### Bibliotecas de UI/UX

- **React Native Reanimated** (~3.17.4) - Animações avançadas
- **React Native Gesture Handler** (~2.24.0) - Gestos de toque
- **React Native Safe Area Context** (5.4.0) - Manipulação de área segura
- **React Native SVG** (^15.12.1) - Suporte a SVG
- **@gorhom/bottom-sheet** (^5.2.6) - Componentes de bottom sheet

### Gráficos e Visualização

- **React Native Chart Kit** (^6.12.0) - Visualização de dados
- **React Native Calendars** (^1.1313.0) - Componentes de calendário

### Recursos Adicionais

- **AsyncStorage** (2.1.2) - Persistência de dados local
- **React Native Image Picker** (^8.2.1) - Seleção de imagens
- **Expo Haptics** (~14.1.4) - Feedback háptico
- **Expo Image** (~2.4.0) - Componente de imagem otimizado

## 🏛️ Arquitetura

### Gerenciamento de Estado

O app usa React Context para gerenciamento de estado com os seguintes contextos:

- **AuthContext**: Gerencia o estado de autenticação do usuário
- **TransferContext**: Gerencia transações financeiras
- **CategoryContext**: Gerencia categorias
- **DashboardContext**: Gerencia dados e cálculos do dashboard

### Fluxo de Dados

1. **Autenticação**: Firebase Auth gerencia a autenticação do usuário
2. **Armazenamento de Dados**: Firestore armazena dados do usuário com atualizações em tempo real
3. **Armazenamento de Arquivos**: Firebase Storage gerencia uploads de imagens
4. **Armazenamento Local**: AsyncStorage para persistência de dados offline

### Navegação

- **Roteamento baseado em arquivos** usando Expo Router
- **Navegação por abas** para seções principais do app
- **Navegação em pilha** para fluxo de autenticação
- **Navegação aninhada** para visualizações detalhadas

## 🎨 Recursos de UI/UX

- **Feedback háptico** para melhor experiência do usuário
- **Design responsivo** para diferentes tamanhos de tela
- **Animações suaves** usando Reanimated
- **Suporte a gestos** para interações intuitivas
- Recursos de **acessibilidade** para design inclusivo

## 📊 Modelos de Dados

### Transfer (Transação)

```typescript
interface Transfer {
  id: string;
  userId?: string;
  description: string;
  amount: number;
  type: TransactionType; // 'income' | 'expense'
  categoryId: string;
  date: string;
  notes?: string;
}
```

### Category (Categoria)

```typescript
interface Category {
  id: string;
  userId?: string;
  name: string;
  icon: string;
}
```

## 🚀 Deploy

### iOS

1. Configure sua conta de desenvolvedor Apple
2. Atualize o bundle identifier em `app.config.ts`
3. Execute `npx expo build:ios`
4. Envie para a App Store

### Android

1. Gere APK/AAB assinado
2. Atualize o nome do pacote em `app.config.ts`
3. Execute `npx expo build:android`
4. Envie para a Google Play Store

## 📝 Licença

Este projeto faz parte do FIAP F3 Tech Challenge 3 e é para fins educacionais.

## 🆘 Suporte

Para suporte e dúvidas:

- Consulte a [documentação do Expo](https://docs.expo.dev/)
- Revise a [documentação do React Native](https://reactnative.dev/)
- Consulte a [documentação do Firebase](https://firebase.google.com/docs)
