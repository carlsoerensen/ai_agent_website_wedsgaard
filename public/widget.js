(function () {
  'use strict';

  // Configuration
  const DEFAULT_CONFIG = {
    position: 'bottom-right',
  };

  // Iframe dimensions - generous to allow full shadow/glow and popup rendering
  // Closed state needs space for: button (56px) + glow (40px each side) + popup bubble above
  const CLOSED_WIDTH = 340; // popup (260px) + right margin (20px) + glow space (60px)
  const CLOSED_HEIGHT = 220; // button area (100px) + popup bubble (~120px)
  const OPEN_WIDTH = 500; // 380px container + 40px margins + shadow space
  // Height: container (500px) + bottom spacing (100px) + top shadow (50px) = 650px
  const OPEN_HEIGHT = 650;

  // Create widget container
  function createWidget(config) {
    // Check if widget already exists
    if (document.getElementById('ai-agent-widget-root')) {
      console.warn('AI Agent Widget is already loaded');
      return;
    }

    // Validate client ID
    if (!config.clientId) {
      console.error('AI Agent Widget: data-client attribute is required');
      return;
    }

    // Create root container
    const root = document.createElement('div');
    root.id = 'ai-agent-widget-root';
    document.body.appendChild(root);

    // Create iframe - uses dynamic route with client ID
    const iframe = document.createElement('iframe');
    iframe.id = 'ai-agent-widget-iframe';
    iframe.src = `${config.widgetUrl}/widget/${config.clientId}`;
    iframe.allow = 'clipboard-write';
    
    // Initial state: larger area to show button + popup bubble + glow
    const setClosedState = () => {
      iframe.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        width: ${CLOSED_WIDTH}px;
        height: ${CLOSED_HEIGHT}px;
        border: none;
        z-index: 999999;
        background: transparent;
        pointer-events: auto;
        overflow: visible;
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
          overflow: visible;
        `;
      } else {
        // Position iframe to allow shadows to render properly
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
          overflow: visible;
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
      document.querySelector('script[data-client]');
    
    // Get client ID (required for multi-tenant support)
    const clientId = script?.getAttribute('data-client');
    
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

    if (!clientId) {
      console.error('AI Agent Widget: data-client attribute is required. Example: <script src="..." data-client="your-client-id"></script>');
      return;
    }
    
    const config = {
      ...DEFAULT_CONFIG,
      clientId: clientId,
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
