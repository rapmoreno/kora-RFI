"use strict";

/**
 * app-avatar
 *
 * Attributes: none
 *
 * Events dispatched: none
 *
 * Expected children: none
 * CSS: styles/organisms/app-avatar.css
 */

class AppAvatar extends HTMLElement {
  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="avatar-loading-screen" id="loadingScreen">
        <div class="avatar-loading-backdrop"></div>
        <div class="avatar-loading-content">
          <div class="avatar-loading-title">Initializing Avatar</div>
          <div class="avatar-loading-subtitle" id="loadingText">Preparing your experience...</div>
          <div class="avatar-loading-countdown-wrapper">
            <div class="avatar-loading-countdown" id="loadingCounter">4</div>
            <div class="countdown-label">seconds</div>
          </div>
          <div class="avatar-loading-progress">
            <div class="progress-bar" id="loadingProgressBar"></div>
          </div>
        </div>
      </div>
      <div class="avatar-section">
        <div id="avatar" role="img" aria-label="3D avatar"></div>
        <div class="status" id="status" role="status" aria-live="polite">Initializing ReadyPlayerMe Avatar...</div>
        <div class="speech-bubble" id="speechBubble">
          <div class="speech-bubble-content">
            <div class="speech-bubble-tail"></div>
            <div class="speech-bubble-tail-inner"></div>
            <div id="speechBubbleText"></div>
          </div>
        </div>
        <div class="confetti-container" id="confettiContainer" aria-hidden="true"></div>
        <div class="knowledge-base-thinking" id="knowledgeBaseThinking">
          <div class="knowledge-base-thinking-content">
            <div class="kb-thinking-icon">🧠</div>
            <div class="kb-thinking-text">give me a moment while i check</div>
            <div class="kb-thinking-dots">...</div>
          </div>
        </div>
        <div class="events-thinking" id="eventsThinking">
          <div class="events-thinking-content">
            <div class="events-thinking-icon">📅</div>
            <div class="events-thinking-text">let me check the calendar</div>
            <div class="events-thinking-dots">...</div>
          </div>
        </div>
        <div class="link-buttons-container" id="linkButtonsContainer"></div>
      </div>
    `;
  }

  disconnectedCallback() {
    /* No listeners to remove - innerHTML only */
  }
}

customElements.define("app-avatar", AppAvatar);
