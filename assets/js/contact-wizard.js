/**
 * Conversational Contact Wizard for Cornerstone Group Of Schools
 * Inspired by yuyu.ng's multi-step interactive contact experience.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const wizard = document.getElementById('schoolInquiryWizard');
    if (!wizard) return;

    const WA_NUMBER = '2348060307628';
    const EMAIL_RECIPIENT = 'admissions@cornerstonecollege.com';
    const EMAIL_CC = 'info@cornerstonecollege.com';

    const totalQuestionSteps = 6; // Steps 0 to 5
    let currentStep = 0;

    const answers = {
      name: '',
      role: '',
      level: '',
      purpose: '',
      phone: '',
      email: '',
      message: ''
    };

    // DOM Elements
    const qContainers = wizard.querySelectorAll('.convo-q');
    const progressBar = document.getElementById('convoProgressBar');
    const stepLabel = document.getElementById('convoStepLabel');
    const btnBack = document.getElementById('convoBtnBack');
    const btnNext = document.getElementById('convoBtnNext');
    const convoNav = document.getElementById('convoNav');
    const successBox = document.getElementById('convoSuccessBox');
    const progressContainer = document.getElementById('convoProgress');

    // Specific Inputs
    const inputName = document.getElementById('q-name');
    const roleOtherInput = document.getElementById('q-role-other');
    const inputPhone = document.getElementById('q-phone');
    const inputEmail = document.getElementById('q-email');
    const inputMessage = document.getElementById('q-message');

    // Send Buttons
    const sendWhatsappBtn = document.getElementById('sendWhatsappBtn');
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    const sendDirectBtn = document.getElementById('sendDirectBtn');
    const convoResetBtn = document.getElementById('convoResetBtn');

    function updateStepView(stepIndex) {
      qContainers.forEach(function (q) {
        q.classList.remove('active');
      });

      if (stepIndex === 'send') {
        const sendStepEl = wizard.querySelector('[data-step="send"]');
        if (sendStepEl) sendStepEl.classList.add('active');

        if (progressBar) progressBar.style.width = '100%';
        if (stepLabel) stepLabel.textContent = 'Final Step: Dispatch';
        if (convoNav) convoNav.style.display = 'none';
        return;
      }

      const activeQ = wizard.querySelector('[data-step="' + stepIndex + '"]');
      if (activeQ) {
        activeQ.classList.add('active');
        const focusable = activeQ.querySelector('input:not([style*="display: none"]), textarea');
        if (focusable) {
          setTimeout(function () {
            focusable.focus();
          }, 150);
        }
      }

      // Progress bar & label
      const progressPercent = Math.round(((stepIndex + 1) / totalQuestionSteps) * 100);
      if (progressBar) progressBar.style.width = progressPercent + '%';
      if (stepLabel) stepLabel.textContent = 'Step ' + (stepIndex + 1) + ' of ' + totalQuestionSteps;

      // Nav buttons visibility & text
      if (convoNav) convoNav.style.display = 'flex';
      if (btnBack) {
        btnBack.style.visibility = stepIndex === 0 ? 'hidden' : 'visible';
      }

      if (btnNext) {
        if (stepIndex === totalQuestionSteps - 1) {
          btnNext.innerHTML = 'Review &amp; Send →';
        } else {
          btnNext.innerHTML = 'Continue →';
        }
      }

      // Update echo name
      if (answers.name) {
        const echoes = wizard.querySelectorAll('.convo-echo-name');
        echoes.forEach(function (el) {
          el.textContent = answers.name;
        });
      }
    }

    function validateStep(stepIndex) {
      clearInvalidFlags();

      if (stepIndex === 0) {
        const val = inputName ? inputName.value.trim() : '';
        if (!val) {
          if (inputName) inputName.classList.add('convo-invalid');
          return false;
        }
        answers.name = val;
        return true;
      }

      if (stepIndex === 1) {
        const container = document.getElementById('q-role-options');
        const selected = container ? container.querySelector('.convo-pill.selected') : null;
        if (!selected) {
          if (container) container.classList.add('convo-invalid');
          return false;
        }
        let val = selected.dataset.value;
        if (val === 'Other') {
          const otherVal = roleOtherInput ? roleOtherInput.value.trim() : '';
          if (!otherVal) {
            if (roleOtherInput) roleOtherInput.classList.add('convo-invalid');
            return false;
          }
          val = otherVal;
        }
        answers.role = val;
        return true;
      }

      if (stepIndex === 2) {
        const container = document.getElementById('q-level-options');
        const selected = container ? container.querySelector('.convo-pill.selected') : null;
        if (!selected) {
          if (container) container.classList.add('convo-invalid');
          return false;
        }
        answers.level = selected.dataset.value;
        return true;
      }

      if (stepIndex === 3) {
        const container = document.getElementById('q-purpose-options');
        const selected = container ? container.querySelector('.convo-pill.selected') : null;
        if (!selected) {
          if (container) container.classList.add('convo-invalid');
          return false;
        }
        answers.purpose = selected.dataset.value;
        return true;
      }

      if (stepIndex === 4) {
        const phone = inputPhone ? inputPhone.value.trim() : '';
        const email = inputEmail ? inputEmail.value.trim() : '';

        let valid = true;
        if (!phone) {
          if (inputPhone) inputPhone.classList.add('convo-invalid');
          valid = false;
        }
        if (!email || !email.includes('@')) {
          if (inputEmail) inputEmail.classList.add('convo-invalid');
          valid = false;
        }

        if (valid) {
          answers.phone = phone;
          answers.email = email;
        }
        return valid;
      }

      if (stepIndex === 5) {
        answers.message = inputMessage ? inputMessage.value.trim() : '';
        return true;
      }

      return true;
    }

    function clearInvalidFlags() {
      wizard.querySelectorAll('.convo-invalid').forEach(function (el) {
        el.classList.remove('convo-invalid');
      });
    }

    function goNext() {
      if (!validateStep(currentStep)) return;

      if (currentStep < totalQuestionSteps - 1) {
        currentStep++;
        updateStepView(currentStep);
      } else {
        // Go to final dispatch screen
        updateStepView('send');
      }
    }

    function goBack() {
      if (currentStep > 0) {
        currentStep--;
        updateStepView(currentStep);
      }
    }

    // Set up Pill Selectors with auto-advance (yuyu.ng style)
    function setupPillGroup(containerId, otherInputId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const pills = container.querySelectorAll('.convo-pill');
      pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
          pills.forEach(function (p) {
            p.classList.remove('selected');
          });
          pill.classList.add('selected');
          container.classList.remove('convo-invalid');

          if (pill.dataset.value === 'Other' && otherInputId) {
            const otherInput = document.getElementById(otherInputId);
            if (otherInput) {
              otherInput.style.display = 'block';
              otherInput.focus();
            }
          } else {
            if (otherInputId) {
              const otherInput = document.getElementById(otherInputId);
              if (otherInput) {
                otherInput.style.display = 'none';
                otherInput.value = '';
              }
            }
            // Auto advance after 220ms delay for seamless flow
            setTimeout(function () {
              goNext();
            }, 220);
          }
        });
      });
    }

    setupPillGroup('q-role-options', 'q-role-other');
    setupPillGroup('q-level-options', null);
    setupPillGroup('q-purpose-options', null);

    // Enter key support for text inputs
    wizard.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        goNext();
      }
    });

    // Remove invalid style as soon as user types
    wizard.querySelectorAll('input, textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        input.classList.remove('convo-invalid');
      });
    });

    if (btnNext) {
      btnNext.addEventListener('click', goNext);
    }

    if (btnBack) {
      btnBack.addEventListener('click', goBack);
    }

    // Message Builder
    function buildSummaryMessage(isMarkdown) {
      const bullet = isMarkdown ? '• ' : '- ';
      const bold = function (text) {
        return isMarkdown ? '*' + text + '*' : text;
      };
      const separator = '━━━━━━━━━━━━━━━━━━━━━━━━━';

      const lines = [
        '🏫 ' + bold('CORNERSTONE GROUP OF SCHOOLS — ADMISSIONS INQUIRY'),
        separator,
        bullet + bold('Full Name:') + ' ' + (answers.name || '—'),
        bullet + bold('Inquiring As:') + ' ' + (answers.role || '—'),
        bullet + bold('Academic Level:') + ' ' + (answers.level || '—'),
        bullet + bold('Inquiry Goal:') + ' ' + (answers.purpose || '—'),
        bullet + bold('Phone / WhatsApp:') + ' ' + (answers.phone || '—'),
        bullet + bold('Email Address:') + ' ' + (answers.email || '—'),
        '',
        '📝 ' + bold('Message / Child Details:'),
        answers.message ? answers.message : 'No additional notes provided.',
        separator,
        '_Sent from Cornerstone School Website (cornerstonecollege.com)_'
      ];

      return lines.join('\n');
    }

    function showConfirmationScreen() {
      qContainers.forEach(function (q) {
        q.classList.remove('active');
      });
      if (convoNav) convoNav.style.display = 'none';
      if (progressContainer) progressContainer.style.display = 'none';

      const nameEl = document.getElementById('successName');
      if (nameEl) nameEl.textContent = answers.name || 'Friend';

      if (successBox) successBox.style.display = 'block';
    }

    // Dispatch Option 1: WhatsApp
    if (sendWhatsappBtn) {
      sendWhatsappBtn.addEventListener('click', function () {
        const text = buildSummaryMessage(true);
        const url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
        window.open(url, '_blank');
        showConfirmationScreen();
      });
    }

    // Dispatch Option 2: Email
    if (sendEmailBtn) {
      sendEmailBtn.addEventListener('click', function () {
        const subject = 'New School Inquiry: ' + answers.name + ' (' + (answers.level || 'General') + ')';
        const body = buildSummaryMessage(false);
        const mailtoUrl = 'mailto:' + EMAIL_RECIPIENT +
          '?cc=' + encodeURIComponent(EMAIL_CC) +
          '&subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);
        window.location.href = mailtoUrl;
        showConfirmationScreen();
      });
    }

    // Dispatch Option 3: Direct Web Submission
    if (sendDirectBtn) {
      sendDirectBtn.addEventListener('click', function () {
        const titleEl = sendDirectBtn.querySelector('.convo-send-title');
        const originalTitle = titleEl ? titleEl.textContent : '';
        if (titleEl) titleEl.textContent = 'Submitting Request...';

        setTimeout(function () {
          if (titleEl) titleEl.textContent = originalTitle;
          showConfirmationScreen();
        }, 600);
      });
    }

    // Reset Form
    if (convoResetBtn) {
      convoResetBtn.addEventListener('click', function () {
        answers.name = '';
        answers.role = '';
        answers.level = '';
        answers.purpose = '';
        answers.phone = '';
        answers.email = '';
        answers.message = '';

        if (inputName) inputName.value = '';
        if (roleOtherInput) {
          roleOtherInput.value = '';
          roleOtherInput.style.display = 'none';
        }
        if (inputPhone) inputPhone.value = '';
        if (inputEmail) inputEmail.value = '';
        if (inputMessage) inputMessage.value = '';

        wizard.querySelectorAll('.convo-pill.selected').forEach(function (pill) {
          pill.classList.remove('selected');
        });

        if (successBox) successBox.style.display = 'none';
        if (progressContainer) progressContainer.style.display = 'block';

        currentStep = 0;
        updateStepView(0);
      });
    }

    // Initialize to Step 0
    updateStepView(0);
  });
})();
