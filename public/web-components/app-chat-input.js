"use strict";

/**
 * app-chat-input
 *
 * Attributes: none
 *
 * Events dispatched: app:chat-send (detail: { message })
 *
 * Expected children: none
 * CSS: styles/organisms/app-chat-input.css
 */

class AppChatInput extends HTMLElement {
  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="chat-input-container">
        <div class="claude-status-indicator u-hidden" id="claudeStatusIndicator">
          <div class="status-dot" id="statusDot"></div>
          <span id="statusText">Ready</span>
        </div>
        <form class="chat-input-form" role="search" aria-label="Chat input">
          <button type="button" id="micBtn" class="input-icon-button mic-button" title="Voice input" aria-label="Toggle voice input">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>
          <label for="messageInput" class="sr-only">Message</label>
          <input type="text" id="messageInput" class="main-text-input" placeholder="Talk to me..." maxlength="500" aria-label="Message input" />
          <button type="submit" class="input-icon-button send-button" id="sendBtn" title="Send message" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
          </button>
        </form>
      </div>
    `;

    this._form = this.querySelector(".chat-input-form");
    this._input = this.querySelector("#messageInput");
    this._sendBtn = this.querySelector("#sendBtn");
    this._micBtn = this.querySelector("#micBtn");

    this._onSubmit = (e) => {
      e.preventDefault();
      const msg = this._input.value.trim();
      if (!msg) return;
      this._input.value = "";
      this.dispatchEvent(
        new CustomEvent("app:chat-send", { bubbles: true, detail: { message: msg } })
      );
    };
    this._onKeyPress = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this._onSubmit(e);
      }
    };
    this._onMicClick = () => {
      this.dispatchEvent(new CustomEvent("app:chat-mic-toggle", { bubbles: true }));
    };

    this._form.addEventListener("submit", this._onSubmit);
    this._input.addEventListener("keypress", this._onKeyPress);
    this._micBtn.addEventListener("click", this._onMicClick);
  }

  disconnectedCallback() {
    if (this._form) this._form.removeEventListener("submit", this._onSubmit);
    if (this._input) this._input.removeEventListener("keypress", this._onKeyPress);
    if (this._micBtn) this._micBtn.removeEventListener("click", this._onMicClick);
  }
}

customElements.define("app-chat-input", AppChatInput);
