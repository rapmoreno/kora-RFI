// Debug helper
const _dbg = window.__debugLog || ((msg) => console.log(msg));
_dbg('[app.js] Module loading started');

// Import components (register before use)
import "/web-components/app-avatar.js";
_dbg('[app.js] app-avatar.js imported');
import "/web-components/app-chat-input.js";
_dbg('[app.js] app-chat-input.js imported');
import "/web-components/app-chat-status.js";
_dbg('[app.js] app-chat-status.js imported');

// Import modules
import { EmojiManager } from "./EmojiManager.js";
import { LinkButtonManager } from "./LinkButtonManager.js";
import { VoiceStateManager } from "./VoiceStateManager.js";
import { IdleTimerManager } from "./IdleTimerManager.js";
import { ConfigManager } from "./ConfigManager.js";
import { UIManager } from "./UIManager.js";
import { SpeechBubbleManager } from "./SpeechBubbleManager.js";
import { SpeechRecognitionManager } from "./SpeechRecognitionManager.js";
import { TTSManager } from "./TTSManager.js";
import { WebSocketManager } from "./WebSocketManager.js";
import { ChatManager } from "./ChatManager.js";
import { AvatarManager } from "./AvatarManager.js";
_dbg('[app.js] All modules imported successfully');

// =====================================================
// GLOBAL VARIABLES
// =====================================================
// Avatar variables moved to AvatarManager

// Manager instances
let linkButtonManager = null;
let emojiManager = null;
let voiceStateManager = null;
let idleTimerManager = null;
let configManager = null;
let uiManager = null;
let speechBubbleManager = null;
let speechRecognitionManager = null;
let ttsManager = null;
let webSocketManager = null;

// ================================
// CONFETTI APPRECIATION SYSTEM
// ================================
let confettiManager = null;
let chatManager = null;
let avatarManager = null;

// =====================================================
// PHASE 4: VOICE CONTROL VARIABLES
// =====================================================


// Configuration manager (moved to separate file)

// =====================================================
// IDLE TIMER MANAGER (moved to separate file)
// =====================================================

// =====================================================
// EMOJI MANAGER INITIALIZATION (moved to separate file)
// =====================================================

// =====================================================
// WEBSOCKET FUNCTIONS (moved to WebSocketManager)
// =====================================================

// handleClaudeResponse moved to ChatManager

// =====================================================
// INITIALIZATION FUNCTIONS (moved to AvatarManager)
// =====================================================
async function initializeApp() {
  _dbg('[init] initializeApp() started');
  // Initialize all managers first
  uiManager = new UIManager();
  speechBubbleManager = new SpeechBubbleManager();
  speechRecognitionManager = new SpeechRecognitionManager();
  ttsManager = new TTSManager();
  configManager = new ConfigManager();
  configManager.setUIManager(uiManager); // Allow ConfigManager to update UI on errors
  idleTimerManager = new IdleTimerManager();
  voiceStateManager = new VoiceStateManager();
  emojiManager = new EmojiManager();
  linkButtonManager = new LinkButtonManager();
  webSocketManager = new WebSocketManager();
  chatManager = new ChatManager();
  
  // ================================
  // BROWSER MEMORY SYSTEM
  // ================================
  if (typeof BrowserMemory !== 'undefined') {
    BrowserMemory.init();
    window.BrowserMemory = BrowserMemory; // Make globally accessible
    console.log('🧠 BrowserMemory initialized - Persistent conversation memory ready!');
  } else {
    console.warn('⚠️ BrowserMemory module not loaded');
  }
  
  // ================================
  // CONFETTI APPRECIATION SYSTEM
  // ================================
  if (window.CONFETTI_ENABLED && window.ConfettiManager) {
    confettiManager = new window.ConfettiManager();
    window.confettiManager = confettiManager; // Make globally accessible
    console.log('🎊 ConfettiManager initialized - Ready for appreciation!');
  } else {
    console.log('🎊 ConfettiManager disabled or not loaded');
  }
  
  // Initialize AnimationManager (loaded as global script)
  let animationManager = null;
  if (window.AnimationManager) {
    animationManager = new window.AnimationManager();
    console.log('🎭 AnimationManager created:', animationManager);
  } else {
    console.warn('⚠️ AnimationManager not available on window');
  }
  
  // Initialize AvatarManager with all dependencies
  avatarManager = new AvatarManager();
  avatarManager.setDependencies({
    configManager,
    uiManager,
    idleTimerManager,
    voiceStateManager,
    emojiManager,
    linkButtonManager,
    speechBubbleManager,
    speechRecognitionManager,
    ttsManager,
    webSocketManager,
    chatManager,
    animationManager // Pass AnimationManager to AvatarManager
  });
  
  // Initialize the avatar (this will initialize all other managers too)
  // Start avatar loading countdown immediately
  _dbg('[init] Starting avatar loading countdown');
  avatarManager.startAvatarLoadingCountdown();

  // Initialize avatar (will hide loading screen when ready)
  _dbg('[init] Calling avatarManager.initAvatar()');
  await avatarManager.initAvatar();
  _dbg('[init] avatarManager.initAvatar() finished');
  
  // Make managers available globally for interruption after initialization
  window.ttsManager = ttsManager;
  window.chatManager = chatManager;
  window.linkButtonManager = linkButtonManager;
  window.speechRecognitionManager = speechRecognitionManager;
  window.speechBubbleManager = speechBubbleManager;
  
  // Voice recognition is OFF by default - user must press mic button to enable
  // This prevents the mic from interrupting the avatar's speech
  console.log('🎤 Voice recognition available - press mic button to enable');
  
  // Add global keyboard interruption
  document.addEventListener('keydown', (event) => {
    if (ttsManager && ttsManager.isSpeaking && 
        !event.ctrlKey && !event.altKey && !event.metaKey &&
        event.key.length === 1) {
      ttsManager.interruptSpeech();
    }
  });

  // Wire app-chat-input events
  document.addEventListener('app:chat-send', (e) => {
    if (e.detail?.message) chatManager?.sendMessage(e.detail.message);
  });
  document.addEventListener('app:chat-mic-toggle', () => {
    speechRecognitionManager?.toggleVoice();
  });
}

// =====================================================
// CHAT FUNCTIONS (moved to ChatManager)
// =====================================================

// Loading management (moved to UIManager)

// =====================================================
// SPEECH BUBBLE FUNCTIONS (moved to SpeechBubbleManager)
// =====================================================

// Speech bubble functions moved to SpeechBubbleManager

// All speech bubble functions moved to SpeechBubbleManager

// =====================================================
// STATUS AND UI FUNCTIONS (moved to UIManager)
// =====================================================

// =====================================================
// UTILITY FUNCTIONS (chat functions moved to ChatManager)
// =====================================================

// =====================================================
// TEXT-TO-SPEECH FUNCTIONS (moved to TTSManager)
// =====================================================



// =====================================================
// VOICE STATE MANAGER (moved to separate file)
// =====================================================

// =====================================================
// AVATAR CONTROL FUNCTIONS (moved to AvatarManager)
// =====================================================

// =====================================================
// VOICE RECOGNITION FUNCTIONS (moved to SpeechRecognitionManager)
// =====================================================

// =====================================================
// BOOK COVER MANAGER (moved to separate file)
// =====================================================



// =====================================================
// GLOBAL EXPORTS AND INITIALIZATION
// =====================================================

// Make functions available globally
window.sendMessage = () => chatManager?.sendMessage();
window.handleKeyPress = (event) => chatManager?.handleKeyPress(event);
window.clearChat = () => chatManager?.clearChat();
window.reloadPrompt = () => chatManager?.reloadPrompt();
window.toggleAutoSpeak = () => chatManager?.toggleAutoSpeak();
window.toggleVoice = () => speechRecognitionManager?.toggleVoice();
window.triggerExpression = (emoji) => avatarManager?.triggerExpression(emoji);
window.changeView = (view) => avatarManager?.changeView(view);
window.resetAvatar = () => avatarManager?.resetAvatar();
window.resetVoiceSettings = () => voiceStateManager?.resetVoiceSettings();

// ================================
// CONFETTI CONSOLE HELPERS
// ================================
window.testConfetti = () => confettiManager?.test();
window.toggleConfetti = () => {
  if (confettiManager) {
    const isActive = !confettiManager.isActive;
    confettiManager.setActive(isActive);
    return `Confetti ${isActive ? 'ENABLED' : 'DISABLED'}`;
  }
  return 'Confetti manager not available';
};


// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  _dbg('[app.js] DOMContentLoaded - calling initializeApp()');
  initializeApp().then(() => {
    _dbg('[app.js] initializeApp() completed');
  }).catch((err) => {
    _dbg('[app.js] initializeApp() FAILED: ' + err.message, '#f44');
    console.error('initializeApp error:', err);
  });
});