(function () {
  'use strict';

  // Configuration
  const DEFAULT_CONFIG = {
    webhookUrl: null,
    position: 'bottom-right',
    primaryColor: '#8b5cf6',
    widgetUrl: null,
  };

  // Iframe dimensions
  const BUTTON_SIZE = 96; // 56px button + 20px margin on each side
  const OPEN_WIDTH = 420; // 380px container + 40px margins
  const OPEN_HEIGHT = 620; // 500px container + 90px bottom + 30px top margin

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
    
    // Initial state: just show the button area (closed state)
    const setClosedState = () => {
      iframe.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        width: ${BUTTON_SIZE}px;
        height: ${BUTTON_SIZE}px;
        border: none;
        z-index: 999999;
        background: transparent;
        pointer-events: auto;
        overflow: hidden;
      `;
    };

    // Open state
    const setOpenState = () => {
      const isMobile = window.innerWidth <= 480;
      if (isMobile) {
        iframe.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          border: none;
          z-index: 999999;
          background: transparent;
          pointer-events: auto;
          overflow: hidden;
        `;
      } else {
        iframe.style.cssText = `
          position: fixed;
          bottom: 0;
          right: 0;
          width: ${OPEN_WIDTH}px;
          height: ${OPEN_HEIGHT}px;
          border: none;
          z-index: 999999;
          background: transparent;
          pointer-events: auto;
          overflow: hidden;
        `;
      }
    };

    // Set initial closed state
    setClosedState();

    // Handle widget open/close state via postMessage
    window.addEventListener('message', function (event) {
      // Verify origin for security
      if (config.widgetUrl) {
        try {
          const widgetHost = new URL(config.widgetUrl).host;
          if (!event.origin.includes(widgetHost)) {
            return;
          }
        } catch (e) {
          return;
        }
      }

      if (event.data.type === 'widget-open') {
        setOpenState();
      } else if (event.data.type === 'widget-close') {
        setClosedState();
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
