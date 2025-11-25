<template>
  <div class="chatbot-container">
    <!-- Toggle Button -->
    <button 
      v-if="!isOpen" 
      @click="toggleChat" 
      class="chat-toggle"
      title="Trợ lý ảo"
    >
      💬
    </button>

    <!-- Chat Window -->
    <div v-if="isOpen" class="chat-window">
      <!-- Header -->
      <div class="chat-header">
        <div class="header-info">
          <div class="bot-avatar">🤖</div>
          <div>
            <h3>Trợ lý ảo FUTA</h3>
            <p class="status">● Online</p>
          </div>
        </div>
        <button @click="toggleChat" class="close-btn">✕</button>
      </div>

      <!-- Messages -->
      <div class="chat-messages" ref="messagesContainer">
        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="welcome-msg">
          <div class="bot-avatar-lg">🤖</div>
          <h4>Xin chào! 👋</h4>
          <p>Tôi là trợ lý ảo của FUTA Bus</p>
          <p>Tôi có thể giúp bạn:</p>
          <div class="features">
            <span>🎫 Đặt vé</span>
            <span>📋 Tra cứu</span>
            <span>💰 Giá vé</span>
          </div>
        </div>

        <!-- Chat Messages -->
        <div 
          v-for="(msg, index) in messages" 
          :key="index"
          :class="['message', msg.sender]"
        >
          <div class="msg-avatar" v-if="msg.sender === 'bot'">🤖</div>
          <div class="msg-content">
            <p>{{ msg.text }}</p>
            <span class="msg-time">{{ formatTime(msg.timestamp) }}</span>
          </div>
          <div class="msg-avatar" v-if="msg.sender === 'user'">👤</div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="message bot">
          <div class="msg-avatar">🤖</div>
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <!-- Quick Replies -->
      <div v-if="quickReplies.length > 0" class="quick-replies">
        <button 
          v-for="(reply, index) in quickReplies" 
          :key="index"
          @click="sendQuickReply(reply)"
          class="quick-reply-btn"
        >
          {{ reply }}
        </button>
      </div>

      <!-- Suggestions -->
      <div v-if="suggestions.length > 0 && messages.length === 0" class="suggestions">
        <p class="suggestions-title">Câu hỏi gợi ý:</p>
        <button 
          v-for="(suggestion, index) in suggestions" 
          :key="index"
          @click="sendMessage(suggestion)"
          class="suggestion-btn"
        >
          {{ suggestion }}
        </button>
      </div>

      <!-- Input -->
      <div class="chat-input">
        <input 
          v-model="userInput"
          @keyup.enter="sendMessage()"
          placeholder="Nhập tin nhắn..."
          :disabled="isTyping"
        />
        <button 
          @click="sendMessage()"
          :disabled="!userInput.trim() || isTyping"
          class="send-btn"
        >
          ➤
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import api from '@/services/api'

const isOpen = ref(false)
const messages = ref([])
const userInput = ref('')
const isTyping = ref(false)
const quickReplies = ref([])
const suggestions = ref([])
const messagesContainer = ref(null)

onMounted(async () => {
  await loadSuggestions()
})

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && messages.value.length === 0) {
    loadSuggestions()
  }
}

const loadSuggestions = async () => {
  try {
    const res = await api.get('/chatbot/suggestions')
    suggestions.value = res.data.data || []
  } catch (err) {
    console.error('Error loading suggestions:', err)
  }
}

const sendMessage = async (text = null) => {
  const messageText = text || userInput.value.trim()
  if (!messageText) return

  // Add user message
  messages.value.push({
    sender: 'user',
    text: messageText,
    timestamp: Date.now()
  })

  userInput.value = ''
  suggestions.value = []
  isTyping.value = true
  scrollToBottom()

  try {
    // Call chatbot API
    const res = await api.post('/chatbot/chat', {
      message: messageText
    })

    const data = res.data.data

    // Add bot response
    setTimeout(() => {
      messages.value.push({
        sender: 'bot',
        text: data.message,
        timestamp: Date.now()
      })

      quickReplies.value = data.quickReplies || []
      isTyping.value = false
      scrollToBottom()
    }, 1000) // Simulate typing delay

  } catch (err) {
    console.error('Chat error:', err)
    messages.value.push({
      sender: 'bot',
      text: 'Xin lỗi, tôi gặp sự cố. Vui lòng thử lại sau.',
      timestamp: Date.now()
    })
    isTyping.value = false
  }
}

const sendQuickReply = (reply) => {
  quickReplies.value = []
  sendMessage(reply)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
}

/* Toggle Button */
.chat-toggle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-color);
  border: none;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.chat-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

/* Chat Window */
.chat-window {
  width: 380px;
  height: 550px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.chat-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bot-avatar {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.status {
  font-size: 12px;
  margin: 0;
  opacity: 0.9;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.close-btn:hover {
  opacity: 1;
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f5f5;
}

.welcome-msg {
  text-align: center;
  padding: 20px;
}

.bot-avatar-lg {
  width: 60px;
  height: 60px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 16px;
}

.welcome-msg h4 {
  margin: 12px 0 8px;
  font-size: 18px;
}

.welcome-msg p {
  color: var(--gray-600);
  font-size: 14px;
  margin: 4px 0;
}

.features {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
  flex-wrap: wrap;
}

.features span {
  background: var(--primary-color);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* Message */
.message {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: flex-end;
}

.message.user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 32px;
  height: 32px;
  background: var(--gray-200);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.msg-content {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 12px;
  position: relative;
}

.message.bot .msg-content {
  background: white;
  border-bottom-left-radius: 4px;
}

.message.user .msg-content {
  background: var(--primary-color);
  color: white;
  border-bottom-right-radius: 4px;
}

.msg-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.msg-time {
  font-size: 10px;
  opacity: 0.6;
  margin-top: 4px;
  display: block;
}

/* Typing Indicator */
.typing-indicator {
  padding: 10px 14px;
  background: white;
  border-radius: 12px;
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--gray-400);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* Quick Replies */
.quick-replies {
  padding: 8px 16px;
  background: white;
  border-top: 1px solid var(--gray-200);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-reply-btn {
  padding: 8px 14px;
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-reply-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Suggestions */
.suggestions {
  padding: 12px 16px;
  background: white;
  border-top: 1px solid var(--gray-200);
}

.suggestions-title {
  font-size: 12px;
  color: var(--gray-600);
  margin-bottom: 8px;
}

.suggestion-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  margin-bottom: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Input */
.chat-input {
  padding: 12px 16px;
  background: white;
  border-top: 1px solid var(--gray-200);
  display: flex;
  gap: 8px;
}

.chat-input input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--gray-300);
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.chat-input input:focus {
  border-color: var(--primary-color);
}

.send-btn {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
}

.send-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .chat-window {
    width: calc(100vw - 32px);
    height: calc(100vh - 100px);
    max-height: 600px;
  }
}
</style>