import axios from 'axios';
import API from '../api/config';


class ClickTracker {
  constructor() {
    this.trackingEndpoint = `${API.BASE}/users/analytics/click`;
    this.userId = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    // Get initial user ID if available
    this.updateUserContext();

    // Listen for all clicks on the document
    document.addEventListener('click', (event) => this.handleGlobalClick(event), true);

    this.isInitialized = true;

  }

  updateUserContext() {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        this.userId = parsed.user_id || parsed.id;
      }
    } catch (e) {
      console.warn('ClickTracker: Could not get user context', e);
    }
  }

  handleGlobalClick(event) {
    const target = event.target;


    const shouldTrack =
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.closest('button') ||
      target.closest('a') ||
      target.id ||
      target.className;

    if (!shouldTrack) return;

    // Extract information
    const data = {
      element_id: target.id || target.closest('[id]')?.id || null,
      element_class: target.className || null,
      element_tag: target.tagName.toLowerCase(),
      page_url: window.location.pathname + window.location.search,
      text_content: (target.innerText || target.textContent || '').substring(0, 50).trim(),
      user_id: this.userId
    };


    if (!data.text_content) {
      const parent = target.closest('button') || target.closest('a');
      if (parent) {
        data.text_content = (parent.innerText || parent.textContent || '').substring(0, 50).trim();
      }
    }


    if (target.type === 'password') return;


    this.sendData(data);
  }

  async sendData(data) {
    try {


      const baseUrl = window.location.origin;

      // Update user ID just in case it changed since init
      if (!this.userId) this.updateUserContext();
      data.user_id = this.userId;

      // Use fetch for a lighter footprint if preferred, or axios
      fetch(this.trackingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch(err => {
        // Silently fail analytics
      });
    } catch (error) {
      // Analytics should never break the UI
    }
  }
}

export const clickTracker = new ClickTracker();
