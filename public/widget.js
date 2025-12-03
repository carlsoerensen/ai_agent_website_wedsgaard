(function () {
  'use strict';

  // Configuration
  const DEFAULT_CONFIG = {
    webhookUrl: null,
    position: 'bottom-right',
    primaryColor: '#8b5cf6',
    widgetUrl: null, // Will be auto-detected from script src
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

    // Create iframe - starts small (button size), expands when opened
    const iframe = document.createElement('iframe');
    iframe.id = 'ai-agent-widget-iframe';
    iframe.src = `${config.widgetUrl}/widget?webhookUrl=${encodeURIComponent(config.webhookUrl || '')}`;
    iframe.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      max-width: calc(100vw - 40px);
      border: none;
      border-radius: 50%;
      box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
      z-index: 999999;
      background: transparent;
      overflow: hidden;
      transition: width 0.3s ease, height 0.3s ease, border-radius 0.3s ease, bottom 0.3s ease, right 0.3s ease;
    `;

    // Handle widget open/close state via postMessage
    window.addEventListener('message', function (event) {
      // Verify origin for security
      if (event.origin !== config.widgetUrl) {
        return;
      }

      if (event.data.type === 'widget-open') {
        // On desktop, position chat above button; on mobile, full screen
        if (window.innerWidth > 480) {
          iframe.style.width = '400px';
          iframe.style.height = '600px';
          iframe.style.maxHeight = 'calc(100vh - 110px)';
          iframe.style.borderRadius = '16px';
          iframe.style.bottom = '90px'; // Above the button
          iframe.style.right = '20px';
        } else {
          // Mobile: full screen
          iframe.style.width = '100%';
          iframe.style.height = '100dvh';
          iframe.style.maxHeight = '100dvh';
          iframe.style.borderRadius = '0';
          iframe.style.bottom = '0';
          iframe.style.right = '0';
          iframe.style.left = '0';
          iframe.style.top = '0';
        }
      } else if (event.data.type === 'widget-close') {
        iframe.style.width = '60px';
        iframe.style.height = '60px';
        iframe.style.borderRadius = '50%';
        iframe.style.bottom = '20px';
        iframe.style.right = '20px';
        iframe.style.left = 'auto';
        iframe.style.top = 'auto';
        iframe.style.maxHeight = 'none';
      } else if (event.data.type === 'widget-resize') {
        iframe.style.height = event.data.height + 'px';
      }
    });

    // Mobile responsive
    const mobileStyle = `
      @media (max-width: 480px) {
        #ai-agent-widget-iframe {
          width: 100% !important;
          max-width: 100vw !important;
          height: 100dvh !important;
          max-height: 100dvh !important;
          bottom: 0 !important;
          right: 0 !important;
          left: 0 !important;
          top: 0 !important;
          border-radius: 0 !important;
        }
      }
    `;

    // Add mobile styles
    const style = document.createElement('style');
    style.textContent = mobileStyle;
    document.head.appendChild(style);

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

