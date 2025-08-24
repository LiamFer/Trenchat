# 🚆 Trenchat

O **Trenchat** é uma aplicação de chat em tempo real desenvolvida com **Spring Boot** e **WebSockets**, permitindo comunicação instantânea entre usuários de forma simples, rápida e escalável.
O frontend foi desenvolvido em **React** com **Ant Design**, garantindo uma interface moderna, responsiva e de fácil utilização.  

## ✨ Funcionalidades

- 📡 Mensagens em tempo real utilizando WebSockets
- 💬 Suporte a múltiplas salas de chat (Grupos e Privadas)
- 🔐 API REST simples para gerenciamento de usuários
- ⚡ Backend leve e escalável
- 🔗 Fácil integração com aplicações frontend modernas

## 🛠️ Tecnologias Utilizadas

- **Java 17+**
- **Spring Boot** (Web, WebSocket, Security)
- **STOMP sobre WebSocket**
- **Cloudinary** para armazenamento de Imagens
- **Maven**
- **Lombok**
- **Supabase PostgreSQL** (configurável)

## 📦 Instalação

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/LiamFer/Trenchat.git
   cd Trenchat
   ```

2. **Compilar e executar a aplicação**

   ```bash
   mvn spring-boot:run
   ```

3. **Acessar a aplicação**

   ```
   http://localhost:8080
   ```

## 🔌 Endpoints WebSocket

* Endpoint principal: `/ws`
* Prefixo de tópicos STOMP: `/topic`
* Prefixo de aplicação STOMP: `/app`

📍 **Exemplo de assinatura**:

```
/topic/messages
```

📍 **Exemplo de envio de mensagem**:

```
/app/chat.sendMessage
```

