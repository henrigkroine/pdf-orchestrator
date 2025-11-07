/**
 * Interaction Builder
 * Creates interactive elements for PDFs and HTML documents
 *
 * Features:
 * - Button interactions
 * - Form animations
 * - Navigation transitions
 * - Cursor effects
 * - Touch gestures
 */

const fs = require('fs').promises;
const path = require('path');

class InteractionBuilder {
  constructor(config = {}) {
    this.config = config;

    // Interaction patterns
    this.patterns = {
      button: ['hover', 'active', 'disabled', 'loading'],
      form: ['focus', 'error', 'success', 'validation'],
      navigation: ['current', 'hover', 'active'],
      tooltip: ['hover', 'click', 'focus'],
      modal: ['open', 'close', 'backdrop']
    };

    // TEEI brand colors for interactions
    this.colors = {
      primary: '#00393F',      // Nordshore
      secondary: '#C9E4EC',    // Sky
      accent: '#BA8F5A',       // Gold
      success: '#65873B',      // Moss
      error: '#913B2F',        // Clay
      disabled: '#CCCCCC'
    };
  }

  /**
   * Build complete interaction system
   */
  async buildInteractionSystem(documentStructure) {
    console.log('🎮 Building interaction system...');

    const system = {
      buttons: this.buildButtonInteractions(),
      forms: this.buildFormInteractions(),
      navigation: this.buildNavigationInteractions(),
      tooltips: this.buildTooltipInteractions(),
      modals: this.buildModalInteractions(),
      cards: this.buildCardInteractions(),
      dropdowns: this.buildDropdownInteractions(),
      tabs: this.buildTabInteractions(),
      cursors: this.buildCursorEffects(),
      keyboard: this.buildKeyboardNavigation()
    };

    return system;
  }

  /**
   * Build button interactions
   */
  buildButtonInteractions() {
    return {
      primary: {
        name: 'Primary Button',
        states: {
          default: {
            background: this.colors.primary,
            color: '#FFFFFF',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 200ms cubic-bezier(0.25, 0.1, 0.25, 1)'
          },
          hover: {
            background: '#00494F',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 57, 63, 0.2)'
          },
          active: {
            transform: 'translateY(0)',
            boxShadow: '0 2px 6px rgba(0, 57, 63, 0.15)'
          },
          focus: {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(0, 57, 63, 0.2)'
          },
          disabled: {
            background: this.colors.disabled,
            cursor: 'not-allowed',
            opacity: 0.6
          }
        },
        css: `
          .btn-primary {
            background: ${this.colors.primary};
            color: #FFFFFF;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-family: 'Roboto Flex', sans-serif;
            font-weight: 500;
            font-size: 16px;
            cursor: pointer;
            transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .btn-primary:hover:not(:disabled) {
            background: #00494F;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 57, 63, 0.2);
          }

          .btn-primary:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: 0 2px 6px rgba(0, 57, 63, 0.15);
          }

          .btn-primary:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(0, 57, 63, 0.2);
          }

          .btn-primary:disabled {
            background: ${this.colors.disabled};
            cursor: not-allowed;
            opacity: 0.6;
          }
        `
      },

      secondary: {
        name: 'Secondary Button',
        css: `
          .btn-secondary {
            background: transparent;
            color: ${this.colors.primary};
            border: 2px solid ${this.colors.primary};
            padding: 12px 24px;
            border-radius: 4px;
            font-family: 'Roboto Flex', sans-serif;
            font-weight: 500;
            font-size: 16px;
            cursor: pointer;
            transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .btn-secondary:hover:not(:disabled) {
            background: ${this.colors.primary};
            color: #FFFFFF;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 57, 63, 0.15);
          }

          .btn-secondary:active:not(:disabled) {
            transform: translateY(0);
          }

          .btn-secondary:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(0, 57, 63, 0.2);
          }
        `
      },

      cta: {
        name: 'Call-to-Action Button',
        css: `
          .btn-cta {
            background: linear-gradient(135deg, ${this.colors.primary} 0%, ${this.colors.accent} 100%);
            color: #FFFFFF;
            border: none;
            padding: 16px 32px;
            border-radius: 4px;
            font-family: 'Roboto Flex', sans-serif;
            font-weight: 600;
            font-size: 18px;
            cursor: pointer;
            transition: all 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
            position: relative;
            overflow: hidden;
          }

          .btn-cta::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.2);
            transition: left 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .btn-cta:hover::before {
            left: 100%;
          }

          .btn-cta:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 8px 20px rgba(0, 57, 63, 0.3);
          }

          .btn-cta:active {
            transform: translateY(0) scale(1);
          }
        `
      },

      loading: {
        name: 'Loading Button State',
        css: `
          .btn-loading {
            position: relative;
            color: transparent !important;
            pointer-events: none;
          }

          .btn-loading::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            top: 50%;
            left: 50%;
            margin-left: -8px;
            margin-top: -8px;
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            border-top-color: transparent;
            animation: btnSpin 600ms linear infinite;
          }

          @keyframes btnSpin {
            to { transform: rotate(360deg); }
          }
        `
      }
    };
  }

  /**
   * Build form interactions
   */
  buildFormInteractions() {
    return {
      input: {
        name: 'Text Input',
        css: `
          .form-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid ${this.colors.secondary};
            border-radius: 4px;
            font-family: 'Roboto Flex', sans-serif;
            font-size: 16px;
            transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .form-input:focus {
            outline: none;
            border-color: ${this.colors.primary};
            box-shadow: 0 0 0 3px rgba(0, 57, 63, 0.1);
          }

          .form-input.error {
            border-color: ${this.colors.error};
          }

          .form-input.success {
            border-color: ${this.colors.success};
          }

          .form-input:disabled {
            background: #F5F5F5;
            cursor: not-allowed;
            opacity: 0.6;
          }
        `,
        javascript: `
          // Add floating label effect
          document.querySelectorAll('.form-group').forEach(group => {
            const input = group.querySelector('.form-input');
            const label = group.querySelector('.form-label');

            input.addEventListener('focus', () => {
              label.classList.add('floating');
            });

            input.addEventListener('blur', () => {
              if (!input.value) {
                label.classList.remove('floating');
              }
            });
          });
        `
      },

      validation: {
        name: 'Form Validation',
        javascript: `
          function validateForm(form) {
            const inputs = form.querySelectorAll('.form-input[required]');
            let isValid = true;

            inputs.forEach(input => {
              const errorMsg = input.parentElement.querySelector('.error-message');

              // Clear previous errors
              input.classList.remove('error', 'success');
              if (errorMsg) errorMsg.remove();

              // Validate
              if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
                showError(input, 'This field is required');
              } else if (input.type === 'email' && !isValidEmail(input.value)) {
                isValid = false;
                input.classList.add('error');
                showError(input, 'Please enter a valid email');
              } else {
                input.classList.add('success');
              }
            });

            return isValid;
          }

          function showError(input, message) {
            const error = document.createElement('div');
            error.className = 'error-message';
            error.textContent = message;
            input.parentElement.appendChild(error);

            // Shake animation
            input.style.animation = 'shake 300ms cubic-bezier(0.36, 0.07, 0.19, 0.97)';
            setTimeout(() => {
              input.style.animation = '';
            }, 300);
          }

          function isValidEmail(email) {
            return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
        `
      },

      select: {
        name: 'Custom Select Dropdown',
        css: `
          .form-select {
            position: relative;
            width: 100%;
          }

          .form-select select {
            width: 100%;
            padding: 12px 40px 12px 16px;
            border: 2px solid ${this.colors.secondary};
            border-radius: 4px;
            font-family: 'Roboto Flex', sans-serif;
            font-size: 16px;
            background: white;
            cursor: pointer;
            appearance: none;
            transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .form-select::after {
            content: '▼';
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            color: ${this.colors.primary};
            transition: transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .form-select:focus-within::after {
            transform: translateY(-50%) rotate(180deg);
          }

          .form-select select:focus {
            outline: none;
            border-color: ${this.colors.primary};
            box-shadow: 0 0 0 3px rgba(0, 57, 63, 0.1);
          }
        `
      },

      checkbox: {
        name: 'Custom Checkbox',
        css: `
          .form-checkbox {
            position: relative;
            display: inline-flex;
            align-items: center;
            cursor: pointer;
          }

          .form-checkbox input[type="checkbox"] {
            position: absolute;
            opacity: 0;
            cursor: pointer;
          }

          .form-checkbox .checkmark {
            width: 20px;
            height: 20px;
            border: 2px solid ${this.colors.secondary};
            border-radius: 4px;
            margin-right: 8px;
            transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
            position: relative;
          }

          .form-checkbox input:checked + .checkmark {
            background: ${this.colors.primary};
            border-color: ${this.colors.primary};
          }

          .form-checkbox .checkmark::after {
            content: '';
            position: absolute;
            display: none;
            left: 6px;
            top: 2px;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
          }

          .form-checkbox input:checked + .checkmark::after {
            display: block;
          }

          .form-checkbox:hover .checkmark {
            border-color: ${this.colors.primary};
          }

          .form-checkbox input:focus + .checkmark {
            box-shadow: 0 0 0 3px rgba(0, 57, 63, 0.1);
          }
        `
      },

      radio: {
        name: 'Custom Radio Button',
        css: `
          .form-radio {
            position: relative;
            display: inline-flex;
            align-items: center;
            cursor: pointer;
          }

          .form-radio input[type="radio"] {
            position: absolute;
            opacity: 0;
            cursor: pointer;
          }

          .form-radio .radio-mark {
            width: 20px;
            height: 20px;
            border: 2px solid ${this.colors.secondary};
            border-radius: 50%;
            margin-right: 8px;
            transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
            position: relative;
          }

          .form-radio input:checked + .radio-mark {
            border-color: ${this.colors.primary};
          }

          .form-radio .radio-mark::after {
            content: '';
            position: absolute;
            display: none;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: ${this.colors.primary};
          }

          .form-radio input:checked + .radio-mark::after {
            display: block;
            animation: radioScale 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          @keyframes radioScale {
            0% { transform: translate(-50%, -50%) scale(0); }
            50% { transform: translate(-50%, -50%) scale(1.2); }
            100% { transform: translate(-50%, -50%) scale(1); }
          }
        `
      }
    };
  }

  /**
   * Build navigation interactions
   */
  buildNavigationInteractions() {
    return {
      menu: {
        name: 'Navigation Menu',
        css: `
          .nav-menu {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
          }

          .nav-item {
            position: relative;
          }

          .nav-link {
            display: block;
            padding: 12px 20px;
            color: ${this.colors.primary};
            text-decoration: none;
            font-family: 'Roboto Flex', sans-serif;
            font-weight: 500;
            transition: color 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 20px;
            right: 20px;
            height: 3px;
            background: ${this.colors.accent};
            transform: scaleX(0);
            transition: transform 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .nav-link:hover::after,
          .nav-link.active::after {
            transform: scaleX(1);
          }

          .nav-link.active {
            color: ${this.colors.accent};
          }
        `
      },

      breadcrumb: {
        name: 'Breadcrumb Navigation',
        css: `
          .breadcrumb {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
          }

          .breadcrumb-item {
            display: flex;
            align-items: center;
          }

          .breadcrumb-item:not(:last-child)::after {
            content: '›';
            margin: 0 8px;
            color: ${this.colors.secondary};
          }

          .breadcrumb-link {
            color: ${this.colors.primary};
            text-decoration: none;
            transition: color 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .breadcrumb-link:hover {
            color: ${this.colors.accent};
            text-decoration: underline;
          }

          .breadcrumb-item:last-child .breadcrumb-link {
            color: #666;
            pointer-events: none;
          }
        `
      },

      pagination: {
        name: 'Pagination',
        css: `
          .pagination {
            display: flex;
            list-style: none;
            gap: 8px;
          }

          .pagination-item {
            min-width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid ${this.colors.secondary};
            border-radius: 4px;
            color: ${this.colors.primary};
            cursor: pointer;
            transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .pagination-item:hover {
            border-color: ${this.colors.primary};
            background: ${this.colors.secondary};
          }

          .pagination-item.active {
            background: ${this.colors.primary};
            border-color: ${this.colors.primary};
            color: #FFFFFF;
          }

          .pagination-item.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
          }
        `
      }
    };
  }

  /**
   * Build tooltip interactions
   */
  buildTooltipInteractions() {
    return {
      simple: {
        name: 'Simple Tooltip',
        css: `
          .tooltip {
            position: relative;
            display: inline-block;
          }

          .tooltip-text {
            visibility: hidden;
            opacity: 0;
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%) translateY(4px);
            background: ${this.colors.primary};
            color: #FFFFFF;
            padding: 8px 12px;
            border-radius: 4px;
            white-space: nowrap;
            font-size: 14px;
            z-index: 1000;
            transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .tooltip-text::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: ${this.colors.primary} transparent transparent transparent;
          }

          .tooltip:hover .tooltip-text {
            visibility: visible;
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        `
      },

      rich: {
        name: 'Rich Tooltip with Arrow',
        javascript: `
          class RichTooltip {
            constructor(trigger, options = {}) {
              this.trigger = trigger;
              this.content = options.content || trigger.dataset.tooltip;
              this.position = options.position || 'top';
              this.create();
            }

            create() {
              this.tooltip = document.createElement('div');
              this.tooltip.className = 'rich-tooltip';
              this.tooltip.innerHTML = this.content;
              document.body.appendChild(this.tooltip);

              this.trigger.addEventListener('mouseenter', () => this.show());
              this.trigger.addEventListener('mouseleave', () => this.hide());
            }

            show() {
              const rect = this.trigger.getBoundingClientRect();
              const tooltipRect = this.tooltip.getBoundingClientRect();

              let top, left;

              switch(this.position) {
                case 'top':
                  top = rect.top - tooltipRect.height - 8;
                  left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                  break;
                case 'bottom':
                  top = rect.bottom + 8;
                  left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                  break;
                case 'left':
                  top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                  left = rect.left - tooltipRect.width - 8;
                  break;
                case 'right':
                  top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                  left = rect.right + 8;
                  break;
              }

              this.tooltip.style.top = top + 'px';
              this.tooltip.style.left = left + 'px';
              this.tooltip.classList.add('visible');
            }

            hide() {
              this.tooltip.classList.remove('visible');
            }
          }

          // Initialize all tooltips
          document.querySelectorAll('[data-tooltip]').forEach(el => {
            new RichTooltip(el);
          });
        `
      }
    };
  }

  /**
   * Build modal interactions
   */
  buildModalInteractions() {
    return {
      basic: {
        name: 'Basic Modal',
        css: `
          .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .modal-backdrop.open {
            opacity: 1;
            visibility: visible;
          }

          .modal {
            background: white;
            border-radius: 8px;
            padding: 32px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.9) translateY(20px);
            transition: transform 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .modal-backdrop.open .modal {
            transform: scale(1) translateY(0);
          }

          .modal-close {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 32px;
            height: 32px;
            border: none;
            background: none;
            cursor: pointer;
            font-size: 24px;
            color: #666;
            transition: color 200ms;
          }

          .modal-close:hover {
            color: ${this.colors.primary};
          }
        `,
        javascript: `
          function openModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
          }

          function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.remove('open');
            document.body.style.overflow = '';
          }

          // Close on backdrop click
          document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
              if (e.target === backdrop) {
                backdrop.classList.remove('open');
                document.body.style.overflow = '';
              }
            });
          });

          // Close on ESC key
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              document.querySelectorAll('.modal-backdrop.open').forEach(modal => {
                modal.classList.remove('open');
                document.body.style.overflow = '';
              });
            }
          });
        `
      }
    };
  }

  /**
   * Build card interactions
   */
  buildCardInteractions() {
    return {
      hover: {
        name: 'Card Hover Effect',
        css: `
          .card {
            background: white;
            border-radius: 8px;
            padding: 24px;
            border: 2px solid ${this.colors.secondary};
            transition: all 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
            cursor: pointer;
          }

          .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 57, 63, 0.15);
            border-color: ${this.colors.primary};
          }

          .card:active {
            transform: translateY(-2px);
          }
        `
      },

      flip: {
        name: 'Card Flip Effect',
        css: `
          .card-flip {
            perspective: 1000px;
            width: 300px;
            height: 400px;
          }

          .card-flip-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 600ms cubic-bezier(0.25, 0.1, 0.25, 1);
            transform-style: preserve-3d;
          }

          .card-flip:hover .card-flip-inner {
            transform: rotateY(180deg);
          }

          .card-flip-front,
          .card-flip-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 8px;
            padding: 24px;
          }

          .card-flip-back {
            transform: rotateY(180deg);
          }
        `
      }
    };
  }

  /**
   * Build dropdown interactions
   */
  buildDropdownInteractions() {
    return {
      menu: {
        name: 'Dropdown Menu',
        css: `
          .dropdown {
            position: relative;
            display: inline-block;
          }

          .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            min-width: 200px;
            background: white;
            border: 2px solid ${this.colors.secondary};
            border-radius: 4px;
            margin-top: 4px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-8px);
            transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
            z-index: 100;
          }

          .dropdown.open .dropdown-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }

          .dropdown-item {
            padding: 12px 16px;
            cursor: pointer;
            transition: background 200ms;
          }

          .dropdown-item:hover {
            background: ${this.colors.secondary};
          }
        `,
        javascript: `
          document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
              e.stopPropagation();
              const dropdown = toggle.closest('.dropdown');
              dropdown.classList.toggle('open');
            });
          });

          // Close dropdowns when clicking outside
          document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown.open').forEach(dropdown => {
              dropdown.classList.remove('open');
            });
          });
        `
      }
    };
  }

  /**
   * Build tab interactions
   */
  buildTabInteractions() {
    return {
      basic: {
        name: 'Tab Navigation',
        css: `
          .tabs {
            border-bottom: 2px solid ${this.colors.secondary};
          }

          .tab-list {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
          }

          .tab-button {
            padding: 12px 24px;
            border: none;
            background: none;
            cursor: pointer;
            position: relative;
            color: #666;
            transition: color 200ms;
          }

          .tab-button::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: ${this.colors.accent};
            transform: scaleX(0);
            transition: transform 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .tab-button.active {
            color: ${this.colors.primary};
          }

          .tab-button.active::after {
            transform: scaleX(1);
          }

          .tab-panel {
            padding: 24px 0;
            display: none;
          }

          .tab-panel.active {
            display: block;
            animation: tabFadeIn 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          @keyframes tabFadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `,
        javascript: `
          document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
              const tabId = button.dataset.tab;

              // Deactivate all tabs
              button.parentElement.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
              });

              // Activate clicked tab
              button.classList.add('active');

              // Show corresponding panel
              const container = button.closest('.tabs');
              container.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
              });
              container.querySelector(\`#\${tabId}\`).classList.add('active');
            });
          });
        `
      }
    };
  }

  /**
   * Build cursor effects
   */
  buildCursorEffects() {
    return {
      custom: {
        name: 'Custom Cursor Trail',
        css: `
          .cursor-trail {
            position: fixed;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: ${this.colors.accent};
            pointer-events: none;
            opacity: 0.5;
            z-index: 9999;
            transition: transform 150ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }
        `,
        javascript: `
          // Create cursor trail effect
          const trailCount = 10;
          const trails = [];

          for (let i = 0; i < trailCount; i++) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.opacity = (trailCount - i) / trailCount * 0.5;
            document.body.appendChild(trail);
            trails.push(trail);
          }

          let mouseX = 0, mouseY = 0;

          document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            trails.forEach((trail, index) => {
              setTimeout(() => {
                trail.style.left = mouseX + 'px';
                trail.style.top = mouseY + 'px';
              }, index * 50);
            });
          });
        `
      }
    };
  }

  /**
   * Build keyboard navigation
   */
  buildKeyboardNavigation() {
    return {
      arrowKeys: {
        name: 'Arrow Key Navigation',
        javascript: `
          // Navigate through focusable elements with arrow keys
          document.addEventListener('keydown', (e) => {
            const focusable = Array.from(document.querySelectorAll(
              'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ));

            const currentIndex = focusable.indexOf(document.activeElement);

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              e.preventDefault();
              const nextIndex = (currentIndex + 1) % focusable.length;
              focusable[nextIndex].focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              e.preventDefault();
              const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
              focusable[prevIndex].focus();
            }
          });
        `
      },

      shortcuts: {
        name: 'Keyboard Shortcuts',
        javascript: `
          // Define keyboard shortcuts
          const shortcuts = {
            'ctrl+k': () => openSearch(),
            'ctrl+/': () => openHelp(),
            'escape': () => closeModals()
          };

          document.addEventListener('keydown', (e) => {
            const key = [];
            if (e.ctrlKey) key.push('ctrl');
            if (e.shiftKey) key.push('shift');
            if (e.altKey) key.push('alt');
            key.push(e.key.toLowerCase());

            const shortcut = key.join('+');

            if (shortcuts[shortcut]) {
              e.preventDefault();
              shortcuts[shortcut]();
            }
          });
        `
      }
    };
  }

  /**
   * Generate CSS for all interactions
   */
  generateCSS(interactionSystem) {
    let css = `/**
 * TEEI Interaction System
 * Generated: ${new Date().toISOString()}
 */\n\n`;

    Object.entries(interactionSystem).forEach(([category, items]) => {
      css += `/* ========== ${category.toUpperCase()} ========== */\n\n`;

      Object.values(items).forEach(item => {
        if (item.css) {
          css += `/* ${item.name} */\n`;
          css += `${item.css}\n\n`;
        }
      });
    });

    return css;
  }

  /**
   * Generate JavaScript for all interactions
   */
  generateJavaScript(interactionSystem) {
    let js = `/**
 * TEEI Interaction System - JavaScript
 * Generated: ${new Date().toISOString()}
 */\n\n(function() {\n  'use strict';\n\n`;

    Object.entries(interactionSystem).forEach(([category, items]) => {
      js += `  // ========== ${category.toUpperCase()} ==========\n\n`;

      Object.values(items).forEach(item => {
        if (item.javascript) {
          js += `  // ${item.name}\n`;
          js += `  ${item.javascript}\n\n`;
        }
      });
    });

    js += `})();\n`;

    return js;
  }

  /**
   * Save interaction system to files
   */
  async saveInteractionSystem(interactionSystem, outputDir) {
    await fs.mkdir(outputDir, { recursive: true });

    // Save JSON
    await fs.writeFile(
      path.join(outputDir, 'interactions.json'),
      JSON.stringify(interactionSystem, null, 2)
    );

    // Save CSS
    const css = this.generateCSS(interactionSystem);
    await fs.writeFile(
      path.join(outputDir, 'interactions.css'),
      css
    );

    // Save JavaScript
    const js = this.generateJavaScript(interactionSystem);
    await fs.writeFile(
      path.join(outputDir, 'interactions.js'),
      js
    );

    console.log(`✅ Interaction system saved to ${outputDir}`);

    return {
      json: path.join(outputDir, 'interactions.json'),
      css: path.join(outputDir, 'interactions.css'),
      js: path.join(outputDir, 'interactions.js')
    };
  }
}

module.exports = InteractionBuilder;
