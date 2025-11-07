/**
 * Motion Designer
 * Creates professional, brand-aligned animations for interactive PDFs
 *
 * Features:
 * - AI-powered animation design
 * - TEEI brand-compliant motion principles
 * - Scroll-triggered reveals
 * - Data visualization animations
 * - Microinteractions
 */

const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

class MotionDesigner {
  constructor(config = {}) {
    this.config = config;
    this.openai = config.openai || new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Animation timing principles (Material Design inspired)
    this.principles = {
      timing: {
        instant: 100,      // Instant feedback (buttons, toggles)
        quick: 200,        // Quick transitions (dropdowns, tooltips)
        standard: 300,     // Standard animations (modals, slides)
        deliberate: 500,   // Deliberate actions (page transitions)
        slow: 1000,        // Slow, dramatic (hero animations)
        data: 1500         // Data visualizations (charts, counters)
      },
      easing: {
        // Standard easing functions
        ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
        easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',

        // Custom easing for brand feel
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
        emphasized: 'cubic-bezier(0.0, 0.0, 0.2, 1)'
      }
    };

    // TEEI brand motion personality
    this.brandMotion = {
      personality: 'warm, professional, empowering',
      speed: 'moderate', // Not too fast (anxious), not too slow (boring)
      style: 'smooth', // Smooth, fluid transitions
      emphasis: 'subtle' // Subtle, not flashy
    };
  }

  /**
   * Design complete motion system for interactive document
   */
  async designMotionSystem(documentContext) {
    console.log('🎬 Designing motion system for:', documentContext.title);

    const system = {
      pageTransitions: this.designPageTransitions(),
      elementAnimations: await this.designElementAnimations(documentContext.elements || []),
      microInteractions: this.designMicroInteractions(),
      reveals: this.designRevealAnimations(),
      dataAnimations: this.designDataAnimations(),
      scrollEffects: this.designScrollEffects(),
      metadata: {
        brandAlignment: 'TEEI',
        designedAt: new Date().toISOString(),
        documentTitle: documentContext.title
      }
    };

    return system;
  }

  /**
   * Design page transition animations
   */
  designPageTransitions() {
    return {
      fade: {
        name: 'Page Fade',
        duration: this.principles.timing.standard,
        easing: this.principles.easing.ease,
        description: 'Smooth fade between pages',
        css: `
          @keyframes pageFade {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .page-transition-fade {
            animation: pageFade 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }
        `,
        usage: 'General page navigation'
      },

      slideUp: {
        name: 'Slide Up',
        duration: this.principles.timing.deliberate,
        easing: this.principles.easing.easeOut,
        description: 'Content slides up smoothly',
        css: `
          @keyframes slideUp {
            from {
              transform: translateY(30px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .page-transition-slide-up {
            animation: slideUp 500ms cubic-bezier(0, 0, 0.58, 1);
          }
        `,
        usage: 'New content appearing'
      },

      reveal: {
        name: 'Reveal',
        duration: this.principles.timing.deliberate,
        easing: this.principles.easing.easeInOut,
        description: 'Wipe reveal effect',
        css: `
          @keyframes reveal {
            from {
              clip-path: inset(0 100% 0 0);
            }
            to {
              clip-path: inset(0 0 0 0);
            }
          }

          .page-transition-reveal {
            animation: reveal 500ms cubic-bezier(0.42, 0, 0.58, 1);
          }
        `,
        usage: 'Dramatic page reveals'
      },

      scale: {
        name: 'Scale In',
        duration: this.principles.timing.standard,
        easing: this.principles.easing.emphasized,
        description: 'Scale up from center',
        css: `
          @keyframes scaleIn {
            from {
              transform: scale(0.95);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          .page-transition-scale {
            animation: scaleIn 300ms cubic-bezier(0.0, 0.0, 0.2, 1);
          }
        `,
        usage: 'Modal overlays, pop-ups'
      }
    };
  }

  /**
   * Design element-specific animations using AI
   */
  async designElementAnimations(elements) {
    if (!elements || elements.length === 0) {
      return this.getDefaultElementAnimations();
    }

    console.log(`  🎨 Designing animations for ${elements.length} elements...`);

    const animations = {};

    for (const element of elements) {
      try {
        const animation = await this.designSingleElementAnimation(element);
        animations[element.id] = animation;
      } catch (error) {
        console.warn(`  ⚠️  Failed to design animation for ${element.id}:`, error.message);
        animations[element.id] = this.getDefaultAnimation(element.type);
      }
    }

    return animations;
  }

  /**
   * Design animation for a single element using AI
   */
  async designSingleElementAnimation(element) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: `You are an expert motion designer creating animations for ${this.brandMotion.personality} brand.

Design principles:
- Speed: ${this.brandMotion.speed}
- Style: ${this.brandMotion.style}
- Emphasis: ${this.brandMotion.emphasis}

Timing guidelines:
- Instant feedback: 100ms
- Quick transitions: 200ms
- Standard: 300ms
- Deliberate: 500ms
- Slow/dramatic: 1000ms

Return JSON only with these fields:
- animation_name: descriptive name
- duration: milliseconds
- easing: cubic-bezier function
- keyframes: array of {percent, properties}
- trigger: 'load' | 'hover' | 'click' | 'scroll'
- description: what the animation does`
      }, {
        role: 'user',
        content: `Design animation for:

Element Type: ${element.type}
Purpose: ${element.purpose || 'general content'}
Context: ${element.context || 'main document body'}
Importance: ${element.importance || 'normal'}

Should it draw attention? ${element.shouldAttract ? 'Yes' : 'No, be subtle'}
Is it interactive? ${element.interactive ? 'Yes' : 'No'}

Return JSON with animation specification.`
      }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Default element animations for common types
   */
  getDefaultElementAnimations() {
    return {
      heading: {
        animation_name: 'fade-in-up',
        duration: 600,
        easing: 'cubic-bezier(0, 0, 0.58, 1)',
        trigger: 'scroll',
        keyframes: [
          { percent: 0, properties: { opacity: 0, transform: 'translateY(20px)' } },
          { percent: 100, properties: { opacity: 1, transform: 'translateY(0)' } }
        ]
      },
      card: {
        animation_name: 'gentle-lift',
        duration: 200,
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        trigger: 'hover',
        keyframes: [
          { percent: 0, properties: { transform: 'translateY(0)', boxShadow: 'none' } },
          { percent: 100, properties: { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(0,57,63,0.12)' } }
        ]
      },
      button: {
        animation_name: 'button-press',
        duration: 100,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        trigger: 'click',
        keyframes: [
          { percent: 0, properties: { transform: 'scale(1)' } },
          { percent: 50, properties: { transform: 'scale(0.96)' } },
          { percent: 100, properties: { transform: 'scale(1)' } }
        ]
      },
      image: {
        animation_name: 'image-fade',
        duration: 800,
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        trigger: 'scroll',
        keyframes: [
          { percent: 0, properties: { opacity: 0, transform: 'scale(1.05)' } },
          { percent: 100, properties: { opacity: 1, transform: 'scale(1)' } }
        ]
      }
    };
  }

  /**
   * Get default animation for element type
   */
  getDefaultAnimation(type) {
    const defaults = this.getDefaultElementAnimations();
    return defaults[type] || defaults.card;
  }

  /**
   * Design microinteractions (small, delightful animations)
   */
  designMicroInteractions() {
    return {
      buttonHover: {
        name: 'Subtle Button Lift',
        description: 'Button lifts slightly on hover',
        css: `
          .btn {
            transition: transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1),
                        box-shadow 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 57, 63, 0.15);
          }

          .btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 6px rgba(0, 57, 63, 0.1);
          }
        `,
        usage: 'All buttons and clickable elements'
      },

      linkUnderline: {
        name: 'Smooth Link Underline',
        description: 'Underline grows from left to right',
        css: `
          .link {
            position: relative;
            text-decoration: none;
            color: #00393F;
          }

          .link::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: #BA8F5A; /* TEEI Gold */
            transition: width 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .link:hover::after {
            width: 100%;
          }
        `,
        usage: 'Text links throughout document'
      },

      cardExpand: {
        name: 'Gentle Card Expand',
        description: 'Card scales up subtly',
        css: `
          .card {
            transition: transform 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .card:hover {
            transform: scale(1.02);
          }
        `,
        usage: 'Content cards, program sections'
      },

      iconPulse: {
        name: 'Icon Pulse',
        description: 'Icon pulses to draw attention',
        css: `
          @keyframes iconPulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }

          .icon-pulse {
            animation: iconPulse 2000ms cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
          }
        `,
        usage: 'Call-to-action icons, important indicators'
      },

      inputFocus: {
        name: 'Input Focus Glow',
        description: 'Input glows with brand color on focus',
        css: `
          .input {
            border: 2px solid #C9E4EC; /* TEEI Sky */
            transition: border-color 200ms cubic-bezier(0.25, 0.1, 0.25, 1),
                        box-shadow 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .input:focus {
            border-color: #00393F; /* TEEI Nordshore */
            box-shadow: 0 0 0 3px rgba(0, 57, 63, 0.1);
            outline: none;
          }
        `,
        usage: 'Form inputs, text fields'
      },

      toggleSwitch: {
        name: 'Toggle Switch Slide',
        description: 'Smooth toggle animation',
        css: `
          .toggle-switch {
            position: relative;
            width: 50px;
            height: 26px;
          }

          .toggle-slider {
            position: absolute;
            width: 22px;
            height: 22px;
            background: white;
            border-radius: 50%;
            top: 2px;
            left: 2px;
            transition: transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
          }

          .toggle-switch.active .toggle-slider {
            transform: translateX(24px);
          }
        `,
        usage: 'Toggle switches, checkboxes'
      }
    };
  }

  /**
   * Design reveal animations (scroll-triggered)
   */
  designRevealAnimations() {
    return {
      fadeUp: {
        name: 'Fade Up on Scroll',
        trigger: 'scroll',
        threshold: 0.2, // Trigger when 20% visible
        duration: this.principles.timing.deliberate,
        css: `
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .reveal-fade-up {
            opacity: 0;
            animation: fadeUp 600ms cubic-bezier(0, 0, 0.58, 1) forwards;
          }
        `,
        javascript: `
          const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
          };

          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('reveal-fade-up');
                observer.unobserve(entry.target);
              }
            });
          }, observerOptions);

          document.querySelectorAll('.reveal-on-scroll').forEach(el => {
            observer.observe(el);
          });
        `
      },

      staggered: {
        name: 'Staggered Reveal',
        trigger: 'scroll',
        threshold: 0.3,
        delay: 100, // 100ms between each element
        css: `
          @keyframes staggerFade {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .stagger-reveal {
            opacity: 0;
            animation: staggerFade 500ms cubic-bezier(0, 0, 0.58, 1) forwards;
          }
        `,
        javascript: `
          // Stagger children of container
          const staggerContainers = document.querySelectorAll('.stagger-container');

          staggerContainers.forEach(container => {
            const children = container.querySelectorAll('.stagger-item');

            const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  children.forEach((child, index) => {
                    setTimeout(() => {
                      child.classList.add('stagger-reveal');
                    }, index * 100); // 100ms stagger
                  });
                  observer.unobserve(entry.target);
                }
              });
            }, { threshold: 0.3 });

            observer.observe(container);
          });
        `
      },

      slideFromSide: {
        name: 'Slide from Side',
        trigger: 'scroll',
        threshold: 0.25,
        css: `
          @keyframes slideFromLeft {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideFromRight {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .reveal-from-left {
            animation: slideFromLeft 600ms cubic-bezier(0, 0, 0.58, 1) forwards;
          }

          .reveal-from-right {
            animation: slideFromRight 600ms cubic-bezier(0, 0, 0.58, 1) forwards;
          }
        `
      },

      scaleIn: {
        name: 'Scale In',
        trigger: 'scroll',
        threshold: 0.3,
        css: `
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .reveal-scale {
            animation: scaleIn 500ms cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
          }
        `
      }
    };
  }

  /**
   * Design data visualization animations
   */
  designDataAnimations() {
    return {
      countUp: {
        name: 'Number Count Up',
        description: 'Numbers animate from 0 to target value',
        implementation: `
          function countUp(element, target, duration = 2000) {
            const start = 0;
            const range = target - start;
            const increment = range / (duration / 16); // 60fps
            let current = start;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }

              // Format with commas for large numbers
              element.textContent = Math.round(current).toLocaleString();
            }, 16);
          }

          // Usage on scroll reveal
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                countUp(entry.target, target);
                observer.unobserve(entry.target);
              }
            });
          }, { threshold: 0.5 });

          document.querySelectorAll('.count-up').forEach(el => {
            observer.observe(el);
          });
        `,
        usage: 'Student counts, impact numbers, statistics'
      },

      chartDraw: {
        name: 'Chart Draw Animation',
        description: 'SVG charts animate drawing in',
        implementation: `
          function animateChartDraw(paths, duration = 1500) {
            paths.forEach((path, index) => {
              const length = path.getTotalLength();

              // Set up the starting positions
              path.style.strokeDasharray = length;
              path.style.strokeDashoffset = length;

              // Stagger the animation
              const delay = index * 200;

              setTimeout(() => {
                path.style.transition = \`stroke-dashoffset \${duration}ms cubic-bezier(0, 0, 0.58, 1)\`;
                path.style.strokeDashoffset = '0';
              }, delay);
            });
          }

          // CSS keyframes version
          @keyframes drawPath {
            to {
              stroke-dashoffset: 0;
            }
          }

          .chart-path {
            animation: drawPath 1500ms cubic-bezier(0, 0, 0.58, 1) forwards;
          }
        `,
        usage: 'Line charts, bar charts, progress indicators'
      },

      progressBar: {
        name: 'Progress Bar Fill',
        description: 'Progress bars fill smoothly',
        implementation: `
          function animateProgress(bar, targetPercent, duration = 1500) {
            bar.style.width = '0%';
            bar.style.transition = \`width \${duration}ms cubic-bezier(0, 0, 0.58, 1)\`;

            // Trigger reflow
            bar.offsetWidth;

            // Animate
            setTimeout(() => {
              bar.style.width = targetPercent + '%';
            }, 50);
          }

          // On scroll reveal
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const bar = entry.target.querySelector('.progress-fill');
                const target = parseInt(entry.target.dataset.progress);
                animateProgress(bar, target);
                observer.unobserve(entry.target);
              }
            });
          }, { threshold: 0.5 });
        `,
        css: `
          .progress-container {
            width: 100%;
            height: 8px;
            background: #F5F5F5;
            border-radius: 4px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00393F, #BA8F5A);
            border-radius: 4px;
          }
        `,
        usage: 'Completion rates, goal progress, metrics'
      },

      pieChart: {
        name: 'Pie Chart Slice Reveal',
        description: 'Pie chart slices animate in sequence',
        implementation: `
          function animatePieChart(slices) {
            slices.forEach((slice, index) => {
              // Set initial state
              slice.style.strokeDasharray = '0 100';

              // Animate with stagger
              setTimeout(() => {
                const percentage = slice.dataset.percentage;
                slice.style.transition = 'stroke-dasharray 800ms cubic-bezier(0, 0, 0.58, 1)';
                slice.style.strokeDasharray = \`\${percentage} 100\`;
              }, index * 300);
            });
          }
        `,
        usage: 'Distribution charts, percentage breakdowns'
      },

      metricReveal: {
        name: 'Metric Card Reveal',
        description: 'Metric cards reveal with number animation',
        css: `
          @keyframes metricReveal {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .metric-card {
            animation: metricReveal 600ms cubic-bezier(0, 0, 0.58, 1) forwards;
          }
        `,
        implementation: `
          // Combine card reveal with number count up
          const metricCards = document.querySelectorAll('.metric-card');

          metricCards.forEach((card, index) => {
            card.style.animationDelay = \`\${index * 150}ms\`;

            const number = card.querySelector('.metric-number');
            if (number) {
              const target = parseInt(number.dataset.value);
              setTimeout(() => {
                countUp(number, target, 2000);
              }, index * 150);
            }
          });
        `,
        usage: 'Dashboard metrics, key statistics'
      }
    };
  }

  /**
   * Design scroll effects (parallax, sticky elements)
   */
  designScrollEffects() {
    return {
      parallax: {
        name: 'Subtle Parallax',
        description: 'Background moves slower than foreground',
        implementation: `
          window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');

            parallaxElements.forEach(element => {
              const speed = element.dataset.speed || 0.5;
              element.style.transform = \`translateY(\${scrolled * speed}px)\`;
            });
          });
        `,
        css: `
          .parallax {
            will-change: transform;
          }
        `,
        usage: 'Hero sections, background images'
      },

      stickyHeader: {
        name: 'Sticky Header with Shadow',
        description: 'Header becomes sticky with shadow on scroll',
        css: `
          .header {
            position: sticky;
            top: 0;
            z-index: 100;
            transition: box-shadow 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
          }

          .header.scrolled {
            box-shadow: 0 2px 8px rgba(0, 57, 63, 0.1);
          }
        `,
        implementation: `
          const header = document.querySelector('.header');

          window.addEventListener('scroll', () => {
            if (window.pageYOffset > 50) {
              header.classList.add('scrolled');
            } else {
              header.classList.remove('scrolled');
            }
          });
        `,
        usage: 'Document navigation headers'
      },

      fadeOnScroll: {
        name: 'Fade on Scroll Down',
        description: 'Elements fade out as you scroll down',
        implementation: `
          window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const fadeElements = document.querySelectorAll('.fade-on-scroll');

            fadeElements.forEach(element => {
              const elementTop = element.offsetTop;
              const distance = scrolled - elementTop;
              const opacity = 1 - (distance / 500); // Fade over 500px

              element.style.opacity = Math.max(0, Math.min(1, opacity));
            });
          });
        `,
        usage: 'Hero text that fades as you scroll'
      }
    };
  }

  /**
   * Generate CSS file from motion system
   */
  generateCSS(motionSystem) {
    let css = `/**
 * TEEI Motion Design System
 * Generated: ${new Date().toISOString()}
 *
 * Brand Personality: ${this.brandMotion.personality}
 * Motion Style: ${this.brandMotion.style}
 */

/* ========== GLOBAL ANIMATION SETTINGS ========== */

* {
  /* Smooth animations across all elements */
  transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ========== PAGE TRANSITIONS ========== */\n\n`;

    // Add page transitions
    Object.values(motionSystem.pageTransitions).forEach(transition => {
      css += `/* ${transition.name} */\n`;
      css += `${transition.css}\n\n`;
    });

    // Add microinteractions
    css += `/* ========== MICROINTERACTIONS ========== */\n\n`;
    Object.values(motionSystem.microInteractions).forEach(micro => {
      css += `/* ${micro.name} - ${micro.description} */\n`;
      css += `${micro.css}\n\n`;
    });

    // Add reveal animations
    css += `/* ========== REVEAL ANIMATIONS ========== */\n\n`;
    Object.values(motionSystem.reveals).forEach(reveal => {
      css += `/* ${reveal.name} */\n`;
      css += `${reveal.css}\n\n`;
    });

    // Add data animations
    css += `/* ========== DATA ANIMATIONS ========== */\n\n`;
    Object.values(motionSystem.dataAnimations).forEach(data => {
      if (data.css) {
        css += `/* ${data.name} */\n`;
        css += `${data.css}\n\n`;
      }
    });

    return css;
  }

  /**
   * Generate JavaScript file from motion system
   */
  generateJavaScript(motionSystem) {
    let js = `/**
 * TEEI Motion Design System - Interactive Behaviors
 * Generated: ${new Date().toISOString()}
 */

(function() {
  'use strict';

  // ========== INITIALIZATION ==========

  document.addEventListener('DOMContentLoaded', function() {
    initializeScrollReveal();
    initializeDataAnimations();
    initializeScrollEffects();
  });

  // ========== SCROLL REVEAL ==========

  function initializeScrollReveal() {
    ${motionSystem.reveals.fadeUp.javascript}
  }

  // ========== DATA ANIMATIONS ==========

  function initializeDataAnimations() {
    // Count up animation
    ${motionSystem.dataAnimations.countUp.implementation}

    // Progress bars
    ${motionSystem.dataAnimations.progressBar.implementation}
  }

  // ========== SCROLL EFFECTS ==========

  function initializeScrollEffects() {
    // Sticky header
    ${motionSystem.scrollEffects.stickyHeader.implementation}
  }

})();
`;

    return js;
  }

  /**
   * Save motion system to files
   */
  async saveMotionSystem(motionSystem, outputDir) {
    await fs.mkdir(outputDir, { recursive: true });

    // Save JSON definition
    await fs.writeFile(
      path.join(outputDir, 'motion-system.json'),
      JSON.stringify(motionSystem, null, 2)
    );

    // Save CSS
    const css = this.generateCSS(motionSystem);
    await fs.writeFile(
      path.join(outputDir, 'motion.css'),
      css
    );

    // Save JavaScript
    const js = this.generateJavaScript(motionSystem);
    await fs.writeFile(
      path.join(outputDir, 'motion.js'),
      js
    );

    console.log(`✅ Motion system saved to ${outputDir}`);

    return {
      json: path.join(outputDir, 'motion-system.json'),
      css: path.join(outputDir, 'motion.css'),
      js: path.join(outputDir, 'motion.js')
    };
  }
}

module.exports = MotionDesigner;
