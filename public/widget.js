(function () {
  'use strict';

  // Configuration
  const DEFAULT_CONFIG = {
    webhookUrl: null,
    position: 'bottom-right',
    primaryColor: '#8b5cf6',
    widgetUrl: null,
  };

  // Create widget container
  function createWidget(config) {
    // Check if widget already exists
    if (document.getElementById('ai-agent-widget-root')) {
      console.warn('AI Agent Widget is already loaded');
      return;
    }

    // Create root container
    const root = document.createElement('div');
    root.id = 'ai-agent-widget-root';
    document.body.appendChild(root);

    // Create iframe - starts small (just button visible), expands when opened
    const iframe = document.createElement('iframe');
    iframe.id = 'ai-agent-widget-iframe';
    iframe.src = `${config.widgetUrl}/widget?webhookUrl=${encodeURIComponent(config.webhookUrl || '')}`;
    iframe.allow = 'clipboard-write';
    
    // Initial state: just show the button area
    iframe.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 100px;
      height: 100px;
      border: none;
      z-index: 999999;
      background: transparent;
      pointer-events: auto;
    `;

    // Handle widget open/close state via postMessage
    window.addEventListener('message', function (event) {
      // Verify origin for security
      if (config.widgetUrl && !event.origin.includes(new URL(config.widgetUrl).host)) {
        return;
      }

      if (event.data.type === 'widget-open') {
        // Check if mobile
        const isMobile = window.innerWidth <= 480;
        if (isMobile) {
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.bottom = '0';
          iframe.style.right = '0';
          iframe.style.left = '0';
          iframe.style.top = '0';
        } else {
          iframe.style.width = '420px';
          iframe.style.height = '620px';
          iframe.style.bottom = '0';
          iframe.style.right = '0';
        }
      } else if (event.data.type === 'widget-close') {
        iframe.style.width = '100px';
        iframe.style.height = '100px';
        iframe.style.bottom = '0';
        iframe.style.right = '0';
        iframe.style.left = '';
        iframe.style.top = '';
      }
    });

    root.appendChild(iframe);
  }

  // Initialize widget
  function init() {
    // Get configuration from script tag data attributes
    const script = document.currentScript || 
      document.querySelector('script[src*="widget.js"]') ||
      document.querySelector('script[data-widget-url]');
    
    // Auto-detect widget URL from script src
    let widgetUrl = script?.getAttribute('data-widget-url');
    if (!widgetUrl && script?.src) {
      try {
        const url = new URL(script.src);
        widgetUrl = url.origin;
      } catch (e) {
        console.error('Failed to parse widget URL from script src');
      }
    }
    
    if (!widgetUrl) {
      console.error('AI Agent Widget: Could not determine widget URL. Please specify data-widget-url attribute.');
      return;
    }
    
    const config = {
      ...DEFAULT_CONFIG,
      webhookUrl: script?.getAttribute('data-webhook-url') || null,
      widgetUrl: widgetUrl,
    };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => createWidget(config));
    } else {
      createWidget(config);
    }
  }

  // Auto-initialize
  init();
})();
