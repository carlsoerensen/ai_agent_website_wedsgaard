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

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'ai-agent-widget-iframe';
    iframe.src = `${config.widgetUrl}/widget?webhookUrl=${encodeURIComponent(config.webhookUrl || '')}`;
    iframe.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      max-width: calc(100vw - 40px);
      height: 600px;
      max-height: calc(100vh - 40px);
      border: none;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      z-index: 999999;
      background: white;
    `;

    // Mobile responsive
    const mobileStyle = `
      @media (max-width: 480px) {
        #ai-agent-widget-iframe {
          width: 100% !important;
          max-width: 100vw !important;
          height: 100vh !important;
          max-height: 100vh !important;
          bottom: 0 !important;
          right: 0 !important;
          border-radius: 0 !important;
        }
      }
    `;

    // Add mobile styles
    const style = document.createElement('style');
    style.textContent = mobileStyle;
    document.head.appendChild(style);

    root.appendChild(iframe);

    // Handle messages from iframe
    window.addEventListener('message', function (event) {
      // Verify origin for security
      if (event.origin !== config.widgetUrl) {
        return;
      }

      if (event.data.type === 'widget-resize') {
        iframe.style.height = event.data.height + 'px';
      }
    });
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

