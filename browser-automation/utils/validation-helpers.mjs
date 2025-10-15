/**
 * Validation Helpers for Browser Automation Framework
 * 
 * Provides test validation utilities and assertion helpers.
 * Standardizes validation patterns across automation scripts.
 */

import config from './config.mjs';
import { createLogger } from './logger.mjs';

const logger = createLogger('validation');

export class ValidationHelper {
  constructor(page) {
    this.page = page;
    this.validationCount = 0;
  }

  async validateElement(selector, options = {}) {
    this.validationCount++;
    const {
      timeout = config.timeouts.elementWait,
      visible = true,
      description = `Element: ${selector}`
    } = options;

    try {
      const element = await this.page.waitForSelector(selector, {
        timeout,
        visible
      });

      if (element) {
        logger.success(`Validation ${this.validationCount}: ${description}`);
        return { success: true, element, description };
      } else {
        logger.failure(`Validation ${this.validationCount}: ${description}`);
        return { success: false, error: 'Element not found', description };
      }

    } catch (error) {
      logger.failure(`Validation ${this.validationCount}: ${description}`, {
        error: error.message
      });
      return { success: false, error: error.message, description };
    }
  }

  async validateText(selector, expectedText, options = {}) {
    this.validationCount++;
    const {
      timeout = config.timeouts.elementWait,
      exact = false,
      caseInsensitive = false,
      description = `Text validation: ${selector}`
    } = options;

    try {
      await this.page.waitForSelector(selector, { timeout });
      
      const actualText = await this.page.$eval(selector, el => el.textContent);
      let match = false;

      if (exact) {
        match = caseInsensitive ? 
          actualText.toLowerCase() === expectedText.toLowerCase() :
          actualText === expectedText;
      } else {
        match = caseInsensitive ?
          actualText.toLowerCase().includes(expectedText.toLowerCase()) :
          actualText.includes(expectedText);
      }

      if (match) {
        logger.success(`Validation ${this.validationCount}: ${description}`);
        return { success: true, actualText, expectedText, description };
      } else {
        logger.failure(`Validation ${this.validationCount}: ${description}`, {
          expected: expectedText,
          actual: actualText
        });
        return { 
          success: false, 
          error: 'Text mismatch', 
          actualText, 
          expectedText, 
          description 
        };
      }

    } catch (error) {
      logger.failure(`Validation ${this.validationCount}: ${description}`, {
        error: error.message
      });
      return { success: false, error: error.message, description };
    }
  }

  async validateUrl(expectedUrl, options = {}) {
    this.validationCount++;
    const {
      exact = false,
      description = 'URL validation'
    } = options;

    try {
      const currentUrl = this.page.url();
      let match = false;

      if (exact) {
        match = currentUrl === expectedUrl;
      } else {
        match = currentUrl.includes(expectedUrl);
      }

      if (match) {
        logger.success(`Validation ${this.validationCount}: ${description}`);
        return { success: true, currentUrl, expectedUrl, description };
      } else {
        logger.failure(`Validation ${this.validationCount}: ${description}`, {
          expected: expectedUrl,
          actual: currentUrl
        });
        return { 
          success: false, 
          error: 'URL mismatch', 
          currentUrl, 
          expectedUrl, 
          description 
        };
      }

    } catch (error) {
      logger.failure(`Validation ${this.validationCount}: ${description}`, {
        error: error.message
      });
      return { success: false, error: error.message, description };
    }
  }

  async validateSharingDialog(deckName) {
    const results = [];

    // Validate dialog is open
    results.push(await this.validateElement('[role="dialog"]', {
      description: 'Share dialog is open'
    }));

    // Validate deck name appears
    if (deckName) {
      results.push(await this.validateText('[role="dialog"]', deckName, {
        description: `Deck name "${deckName}" appears in dialog`
      }));
    }

    // Validate key elements
    results.push(await this.validateElement('input[type="email"]', {
      description: 'Email input field present'
    }));

    results.push(await this.validateElement('button[type="button"]', {
      description: 'Add button present'
    }));

    const allPassed = results.every(result => result.success);
    
    return {
      success: allPassed,
      results,
      description: 'Share dialog validation'
    };
  }

  async validateCollaboratorInList(collaboratorId) {
    this.validationCount++;
    const description = `Collaborator ${collaboratorId} in list`;

    try {
      // Look for collaborator in the list
      const collaboratorElement = await this.page.waitForSelector(
        `[data-testid="collaborator-id"]:has-text("${collaboratorId}")`,
        { timeout: config.timeouts.elementWait }
      );

      if (collaboratorElement) {
        logger.success(`Validation ${this.validationCount}: ${description}`);
        return { success: true, collaboratorId, description };
      } else {
        logger.failure(`Validation ${this.validationCount}: ${description}`);
        return { 
          success: false, 
          error: 'Collaborator not found in list', 
          collaboratorId, 
          description 
        };
      }

    } catch (error) {
      logger.failure(`Validation ${this.validationCount}: ${description}`, {
        error: error.message
      });
      return { success: false, error: error.message, collaboratorId, description };
    }
  }

  async validatePerformance(operation, expectedDuration, actualDuration) {
    this.validationCount++;
    const description = `Performance: ${operation}`;

    const withinExpected = actualDuration <= expectedDuration;

    if (withinExpected) {
      logger.success(`Validation ${this.validationCount}: ${description}`, {
        expected: `≤${expectedDuration}ms`,
        actual: `${actualDuration}ms`
      });
      return { 
        success: true, 
        operation, 
        expectedDuration, 
        actualDuration, 
        description 
      };
    } else {
      logger.failure(`Validation ${this.validationCount}: ${description}`, {
        expected: `≤${expectedDuration}ms`,
        actual: `${actualDuration}ms`
      });
      return { 
        success: false, 
        error: 'Performance target not met',
        operation, 
        expectedDuration, 
        actualDuration, 
        description 
      };
    }
  }

  async runValidationSuite(validations) {
    const results = [];
    
    for (const validation of validations) {
      const { type, ...params } = validation;
      
      let result;
      switch (type) {
        case 'element':
          result = await this.validateElement(params.selector, params);
          break;
        case 'text':
          result = await this.validateText(params.selector, params.expectedText, params);
          break;
        case 'url':
          result = await this.validateUrl(params.expectedUrl, params);
          break;
        case 'sharingDialog':
          result = await this.validateSharingDialog(params.deckName);
          break;
        case 'collaborator':
          result = await this.validateCollaboratorInList(params.collaboratorId);
          break;
        case 'performance':
          result = await this.validatePerformance(
            params.operation, 
            params.expectedDuration, 
            params.actualDuration
          );
          break;
        default:
          result = { 
            success: false, 
            error: `Unknown validation type: ${type}`,
            description: `Unknown validation: ${type}`
          };
      }

      results.push({ ...result, type });
    }

    const passed = results.filter(r => r.success).length;
    const total = results.length;
    const allPassed = passed === total;

    logger.info(`Validation suite completed`, {
      passed,
      total,
      success: allPassed
    });

    return {
      success: allPassed,
      passed,
      total,
      results
    };
  }

  getValidationStats() {
    return {
      totalValidations: this.validationCount
    };
  }
}

// Utility functions for common validations
export async function validateBasicAuth(page) {
  const validator = new ValidationHelper(page);
  return await validator.runValidationSuite([
    {
      type: 'element',
      selector: '[data-testid="deck-list"], .deck-screen, h1',
      description: 'Authenticated page loaded'
    },
    {
      type: 'url',
      expectedUrl: '/decks',
      description: 'On decks page'
    }
  ]);
}

export async function validateSharingWorkflow(page, deckName) {
  const validator = new ValidationHelper(page);
  return await validator.validateSharingDialog(deckName);
}

export function createValidator(page) {
  return new ValidationHelper(page);
}

export { ValidationHelper };
export default ValidationHelper;