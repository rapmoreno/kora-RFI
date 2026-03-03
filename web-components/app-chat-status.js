"use strict";

/**
 * app-chat-status
 *
 * Attributes: none
 *
 * Events dispatched: none
 *
 * Expected children: none
 * CSS: styles/organisms/app-chat-status.css
 */

class AppChatStatus extends HTMLElement {
  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="claude-status-indicator u-hidden" id="claudeStatusIndicator">
        <div class="status-dot" id="statusDot"></div>
        <span id="statusText">Ready</span>
      </div>
    `;

    this._indicator = this.querySelector("#claudeStatusIndicator");
    this._text = this.querySelector("#statusText");

    this._onStateChanged = (e) => {
      const s = e.detail;
      if (s && typeof s.isLoading === "boolean") {
        this._indicator?.classList.toggle("u-hidden", !s.isLoading);
        if (this._text) this._text.textContent = s.isLoading ? "Thinking..." : "Ready";
      }
    };

    document.addEventListener("app:state-changed", this._onStateChanged);
  }

  disconnectedCallback() {
    document.removeEventListener("app:state-changed", this._onStateChanged);
  }
}

customElements.define("app-chat-status", AppChatStatus);
