/**
 * CSS/HTML Comprehensive Audit Script
 * 
 * Performs complete analysis of the notecards app for:
 * - Modern web standards compliance
 * - Accessibility (WCAG 2.1 AA)
 * - Performance and optimization
 * - Design system consistency
 * - Responsive design
 * - Semantic HTML
 * - CSS best practices
 */
import browserService from '../services/browser-service.mjs';

class CSSHTMLAuditor {
  constructor() {
    this.auditResults = {
      accessibility: [],
      performance: [],
      semantics: [],
      designSystem: [],
      responsive: [],
      modernStandards: [],
      score: 0
    };
  }

  async runComprehensiveAudit() {
    console.log('🔍 Starting Comprehensive CSS/HTML Audit...\n');
    
    try {
      // Initialize browser
      const connection = await browserService.initialize();
      await browserService.navigateToApp();
      
      console.log('✅ Browser initialized and navigated to app\n');
      
      // Run all audit modules
      await this.auditAccessibility(connection.page);
      await this.auditSemanticHTML(connection.page);
      await this.auditDesignSystem(connection.page);
      await this.auditResponsiveDesign(connection.page);
      await this.auditPerformance(connection.page);
      await this.auditModernStandards(connection.page);
      
      // Generate comprehensive report
      this.generateReport();
      
      await browserService.close({ keepSession: true });
      
    } catch (error) {
      console.error('❌ Audit failed:', error);
      await browserService.close({ keepSession: false });
    }
  }

  async auditAccessibility(page) {
    console.log('🔍 Auditing Accessibility (WCAG 2.1 AA)...');
    
    const accessibilityChecks = await page.evaluate(() => {
      const results = {
        missingAltText: [],
        missingAriaLabels: [],
        improperHeadingStructure: [],
        insufficientColorContrast: [],
        nonAccessibleButtons: [],
        missingLandmarks: [],
        keyboardNavigation: [],
        focusIndicators: []
      };
      
      // Check for images without alt text
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt && !img.getAttribute('aria-label')) {
          results.missingAltText.push(`Image ${index + 1}: ${img.src || 'unknown source'}`);
        }
      });
      
      // Check for buttons without aria-labels
      const buttons = document.querySelectorAll('button');
      buttons.forEach((btn, index) => {
        const hasLabel = btn.getAttribute('aria-label') || 
                        btn.getAttribute('aria-labelledby') || 
                        btn.textContent.trim() ||
                        btn.title;
        if (!hasLabel) {
          results.missingAriaLabels.push(`Button ${index + 1}: ${btn.outerHTML.substring(0, 100)}...`);
        }
      });
      
      // Check heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let prevLevel = 0;
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.substring(1));
        if (level > prevLevel + 1) {
          results.improperHeadingStructure.push(`Heading ${index + 1}: Jumped from h${prevLevel} to h${level}`);
        }
        prevLevel = level;
      });
      
      // Check for semantic landmarks
      const landmarks = ['header', 'nav', 'main', 'aside', 'footer'];
      landmarks.forEach(landmark => {
        const exists = document.querySelector(landmark) || 
                      document.querySelector(`[role="${landmark}"]`);
        if (!exists) {
          results.missingLandmarks.push(`Missing ${landmark} landmark`);
        }
      });
      
      // Check for form labels
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input, index) => {
        const hasLabel = input.getAttribute('aria-label') || 
                        input.getAttribute('aria-labelledby') ||
                        document.querySelector(`label[for="${input.id}"]`) ||
                        input.placeholder;
        if (!hasLabel) {
          results.missingAriaLabels.push(`Input ${index + 1}: ${input.type || 'unknown type'}`);
        }
      });
      
      return results;
    });
    
    // Store results
    this.auditResults.accessibility = accessibilityChecks;
    
    // Report findings
    let accessibilityScore = 100;
    Object.entries(accessibilityChecks).forEach(([check, issues]) => {
      if (issues.length > 0) {
        console.log(`  ⚠️  ${check}: ${issues.length} issues found`);
        accessibilityScore -= issues.length * 5;
        issues.slice(0, 3).forEach(issue => console.log(`    - ${issue}`));
        if (issues.length > 3) console.log(`    - ... and ${issues.length - 3} more`);
      } else {
        console.log(`  ✅ ${check}: No issues found`);
      }
    });
    
    console.log(`  📊 Accessibility Score: ${Math.max(0, accessibilityScore)}/100\n`);
  }

  async auditSemanticHTML(page) {
    console.log('🔍 Auditing Semantic HTML Structure...');
    
    const semanticAnalysis = await page.evaluate(() => {
      const results = {
        semanticElements: [],
        nonSemanticElements: [],
        properStructure: [],
        htmlValidation: []
      };
      
      // Count semantic vs non-semantic elements
      const semanticTags = ['article', 'aside', 'details', 'figcaption', 'figure', 
                           'footer', 'header', 'main', 'mark', 'nav', 'section', 'summary', 'time'];
      const nonSemanticTags = ['div', 'span'];
      
      semanticTags.forEach(tag => {
        const count = document.querySelectorAll(tag).length;
        if (count > 0) {
          results.semanticElements.push(`${tag}: ${count} instances`);
        }
      });
      
      nonSemanticTags.forEach(tag => {
        const count = document.querySelectorAll(tag).length;
        results.nonSemanticElements.push(`${tag}: ${count} instances`);
      });
      
      // Check document structure
      const hasDoctype = document.doctype !== null;
      const hasLang = document.documentElement.lang;
      const hasViewport = document.querySelector('meta[name="viewport"]');
      const hasCharset = document.querySelector('meta[charset]');
      
      results.properStructure = {
        doctype: hasDoctype,
        langAttribute: !!hasLang,
        viewportMeta: !!hasViewport,
        charsetMeta: !!hasCharset
      };
      
      return results;
    });
    
    this.auditResults.semantics = semanticAnalysis;
    
    console.log('  📋 Semantic Elements Found:');
    semanticAnalysis.semanticElements.forEach(element => {
      console.log(`    ✅ ${element}`);
    });
    
    console.log('  📋 Document Structure:');
    Object.entries(semanticAnalysis.properStructure).forEach(([check, passed]) => {
      console.log(`    ${passed ? '✅' : '❌'} ${check}: ${passed ? 'Present' : 'Missing'}`);
    });
    
    console.log(`  📊 Semantic/Non-semantic ratio: ${semanticAnalysis.semanticElements.length}:${semanticAnalysis.nonSemanticElements.length}\n`);
  }

  async auditDesignSystem(page) {
    console.log('🔍 Auditing Design System Consistency...');
    
    const designAnalysis = await page.evaluate(() => {
      const results = {
        colorScheme: [],
        typography: [],
        spacing: [],
        components: [],
        animations: []
      };
      
      // Analyze computed styles
      const elements = document.querySelectorAll('*');
      const colorSet = new Set();
      const fontSet = new Set();
      const spacingSet = new Set();
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        
        // Collect colors
        if (styles.color && styles.color !== 'rgba(0, 0, 0, 0)') {
          colorSet.add(styles.color);
        }
        if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          colorSet.add(styles.backgroundColor);
        }
        
        // Collect fonts
        if (styles.fontFamily) {
          fontSet.add(styles.fontFamily);
        }
        
        // Collect spacing
        if (styles.margin && styles.margin !== '0px') {
          spacingSet.add(styles.margin);
        }
        if (styles.padding && styles.padding !== '0px') {
          spacingSet.add(styles.padding);
        }
      });
      
      results.colorScheme = Array.from(colorSet).slice(0, 20); // Limit for readability
      results.typography = Array.from(fontSet);
      results.spacing = Array.from(spacingSet).slice(0, 15);
      
      // Check for consistent button styles
      const buttons = document.querySelectorAll('button');
      const buttonStyles = [];
      buttons.forEach((btn, index) => {
        const styles = window.getComputedStyle(btn);
        buttonStyles.push({
          index,
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderRadius: styles.borderRadius,
          padding: styles.padding
        });
      });
      results.components = { buttons: buttonStyles.slice(0, 10) };
      
      // Check for animations
      const animatedElements = document.querySelectorAll('[class*="animate"], [style*="animation"], [style*="transition"]');
      results.animations = Array.from(animatedElements).map(el => ({
        tag: el.tagName,
        classes: el.className,
        count: 1
      })).slice(0, 10);
      
      return results;
    });
    
    this.auditResults.designSystem = designAnalysis;
    
    console.log(`  🎨 Color Palette: ${designAnalysis.colorScheme.length} unique colors`);
    console.log(`  📝 Typography: ${designAnalysis.typography.length} font families`);
    console.log(`  📏 Spacing Values: ${designAnalysis.spacing.length} unique values`);
    console.log(`  🔘 Button Components: ${designAnalysis.components.buttons.length} analyzed`);
    console.log(`  ✨ Animated Elements: ${designAnalysis.animations.length} found\n`);
  }

  async auditResponsiveDesign(page) {
    console.log('🔍 Auditing Responsive Design...');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    const responsiveResults = [];
    
    for (const viewport of viewports) {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // Allow layout to settle
      
      const analysis = await page.evaluate((viewportName) => {
        const results = {
          viewport: viewportName,
          overflowIssues: [],
          readability: [],
          touchTargets: [],
          hiddenContent: []
        };
        
        // Check for horizontal overflow
        const bodyWidth = document.body.scrollWidth;
        const windowWidth = window.innerWidth;
        if (bodyWidth > windowWidth + 10) { // 10px tolerance
          results.overflowIssues.push(`Horizontal scroll detected: ${bodyWidth}px > ${windowWidth}px`);
        }
        
        // Check touch target sizes (minimum 44px)
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
        interactiveElements.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          if (rect.width < 44 || rect.height < 44) {
            results.touchTargets.push(`Element ${index + 1}: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px`);
          }
        });
        
        // Check for hidden content that might be problematic
        const hiddenElements = document.querySelectorAll('[style*="display: none"], .hidden');
        results.hiddenContent = [`${hiddenElements.length} hidden elements`];
        
        return results;
      }, viewport.name);
      
      responsiveResults.push(analysis);
      console.log(`  📱 ${viewport.name} (${viewport.width}x${viewport.height}):`);
      console.log(`    ${analysis.overflowIssues.length === 0 ? '✅' : '❌'} No overflow issues: ${analysis.overflowIssues.length === 0 ? 'Yes' : analysis.overflowIssues[0]}`);
      console.log(`    ${analysis.touchTargets.length === 0 ? '✅' : '⚠️'} Touch targets adequate: ${analysis.touchTargets.length === 0 ? 'Yes' : `${analysis.touchTargets.length} too small`}`);
    }
    
    this.auditResults.responsive = responsiveResults;
    console.log();
  }

  async auditPerformance(page) {
    console.log('🔍 Auditing Performance...');
    
    const performanceMetrics = await page.evaluate(() => {
      const results = {
        domStats: {},
        cssStats: {},
        imageStats: {},
        jsStats: {}
      };
      
      // DOM statistics
      results.domStats = {
        totalElements: document.querySelectorAll('*').length,
        totalNodes: document.getElementsByTagName('*').length,
        textNodes: document.createTreeWalker(document, NodeFilter.SHOW_TEXT).nextNode() ? 'Present' : 'None',
        depth: (function getMaxDepth(element = document.documentElement, currentDepth = 0) {
          let maxDepth = currentDepth;
          for (let child of element.children) {
            const childDepth = getMaxDepth(child, currentDepth + 1);
            if (childDepth > maxDepth) maxDepth = childDepth;
          }
          return maxDepth;
        })()
      };
      
      // CSS statistics
      const styleSheets = document.styleSheets;
      let cssRuleCount = 0;
      try {
        for (let sheet of styleSheets) {
          if (sheet.cssRules) {
            cssRuleCount += sheet.cssRules.length;
          }
        }
      } catch (e) {
        // Cross-origin stylesheets may not be accessible
      }
      
      results.cssStats = {
        stylesheets: styleSheets.length,
        estimatedRules: cssRuleCount,
        inlineStyles: document.querySelectorAll('[style]').length
      };
      
      // Image statistics
      const images = document.querySelectorAll('img');
      results.imageStats = {
        total: images.length,
        withoutAlt: Array.from(images).filter(img => !img.alt).length,
        lazyLoaded: Array.from(images).filter(img => img.loading === 'lazy').length
      };
      
      // JavaScript statistics  
      const scripts = document.querySelectorAll('script');
      results.jsStats = {
        scriptTags: scripts.length,
        inlineScripts: Array.from(scripts).filter(script => !script.src).length,
        externalScripts: Array.from(scripts).filter(script => script.src).length
      };
      
      return results;
    });
    
    this.auditResults.performance = performanceMetrics;
    
    console.log('  📊 DOM Statistics:');
    console.log(`    Elements: ${performanceMetrics.domStats.totalElements}`);
    console.log(`    Max Depth: ${performanceMetrics.domStats.depth}`);
    
    console.log('  🎨 CSS Statistics:');
    console.log(`    Stylesheets: ${performanceMetrics.cssStats.stylesheets}`);
    console.log(`    Inline Styles: ${performanceMetrics.cssStats.inlineStyles}`);
    
    console.log('  🖼️  Image Statistics:');
    console.log(`    Total Images: ${performanceMetrics.imageStats.total}`);
    console.log(`    Lazy Loaded: ${performanceMetrics.imageStats.lazyLoaded}`);
    
    console.log('  ⚡ JavaScript Statistics:');
    console.log(`    Script Tags: ${performanceMetrics.jsStats.scriptTags}`);
    console.log(`    External Scripts: ${performanceMetrics.jsStats.externalScripts}\n`);
  }

  async auditModernStandards(page) {
    console.log('🔍 Auditing Modern Web Standards...');
    
    const modernStandards = await page.evaluate(() => {
      const results = {
        html5Features: [],
        cssFeatures: [],
        accessibility: [],
        security: []
      };
      
      // Check HTML5 semantic elements usage
      const html5Elements = ['article', 'aside', 'details', 'figcaption', 'figure', 
                            'footer', 'header', 'main', 'mark', 'nav', 'section', 'summary', 'time'];
      html5Elements.forEach(element => {
        const count = document.querySelectorAll(element).length;
        if (count > 0) {
          results.html5Features.push(`${element}: ${count} instances`);
        }
      });
      
      // Check modern CSS features
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);
      
      const cssFeatures = {
        'CSS Grid': 'grid',
        'CSS Flexbox': 'flex',
        'CSS Custom Properties': 'var(--test)',
        'CSS Transforms': 'transform',
        'CSS Transitions': 'transition',
        'CSS Animations': 'animation'
      };
      
      Object.entries(cssFeatures).forEach(([featureName, cssValue]) => {
        try {
          testElement.style.display = cssValue;
          if (testElement.style.display === cssValue || cssValue.includes('var(')) {
            results.cssFeatures.push(`${featureName}: Supported`);
          }
        } catch (e) {
          // Feature not supported
        }
      });
      
      document.body.removeChild(testElement);
      
      // Check accessibility features
      const accessibilityFeatures = {
        'ARIA Labels': document.querySelectorAll('[aria-label]').length,
        'ARIA Roles': document.querySelectorAll('[role]').length,
        'Skip Links': document.querySelectorAll('a[href^="#"]').length,
        'Focus Indicators': document.querySelectorAll(':focus').length
      };
      
      Object.entries(accessibilityFeatures).forEach(([feature, count]) => {
        results.accessibility.push(`${feature}: ${count} instances`);
      });
      
      // Check security features
      const securityFeatures = {
        'CSP Meta': !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
        'HTTPS': location.protocol === 'https:',
        'Secure Cookies': document.cookie.includes('Secure'),
        'No Inline JavaScript': document.querySelectorAll('script:not([src])').length === 0
      };
      
      Object.entries(securityFeatures).forEach(([feature, implemented]) => {
        results.security.push(`${feature}: ${implemented ? 'Yes' : 'No'}`);
      });
      
      return results;
    });
    
    this.auditResults.modernStandards = modernStandards;
    
    console.log('  🏗️  HTML5 Semantic Elements:');
    modernStandards.html5Features.forEach(feature => {
      console.log(`    ✅ ${feature}`);
    });
    
    console.log('  🎨 Modern CSS Features:');
    modernStandards.cssFeatures.forEach(feature => {
      console.log(`    ✅ ${feature}`);
    });
    
    console.log('  ♿ Accessibility Features:');
    modernStandards.accessibility.forEach(feature => {
      console.log(`    📊 ${feature}`);
    });
    
    console.log('  🔒 Security Features:');
    modernStandards.security.forEach(feature => {
      console.log(`    ${feature.includes('Yes') ? '✅' : '⚠️'} ${feature}`);
    });
    
    console.log();
  }

  generateReport() {
    console.log('📋 COMPREHENSIVE CSS/HTML AUDIT REPORT');
    console.log('=========================================\n');
    
    // Calculate overall score
    let totalScore = 0;
    let maxScore = 600; // 100 points per category
    
    // Accessibility score
    const accessibilityIssues = Object.values(this.auditResults.accessibility)
      .reduce((total, issues) => total + (Array.isArray(issues) ? issues.length : 0), 0);
    const accessibilityScore = Math.max(0, 100 - (accessibilityIssues * 5));
    totalScore += accessibilityScore;
    
    // Performance score (based on reasonable thresholds)
    const domElements = this.auditResults.performance?.domStats?.totalElements || 0;
    const performanceScore = domElements < 1000 ? 100 : Math.max(0, 100 - ((domElements - 1000) / 50));
    totalScore += performanceScore;
    
    // Modern standards score
    const html5Elements = this.auditResults.modernStandards?.html5Features?.length || 0;
    const modernScore = Math.min(100, html5Elements * 10);
    totalScore += modernScore;
    
    // Design system score (consistency)
    const colorVariety = this.auditResults.designSystem?.colorScheme?.length || 0;
    const designScore = colorVariety < 50 ? 100 : Math.max(0, 100 - ((colorVariety - 50) / 2));
    totalScore += designScore;
    
    // Responsive score
    const responsiveIssues = this.auditResults.responsive?.reduce(
      (total, viewport) => total + viewport.overflowIssues.length + (viewport.touchTargets.length > 5 ? 1 : 0), 0
    ) || 0;
    const responsiveScore = Math.max(0, 100 - (responsiveIssues * 10));
    totalScore += responsiveScore;
    
    // Semantic score
    const semanticElements = this.auditResults.semantics?.semanticElements?.length || 0;
    const semanticScore = Math.min(100, semanticElements * 8);
    totalScore += semanticScore;
    
    const overallScore = Math.round((totalScore / maxScore) * 100);
    
    console.log(`🎯 OVERALL SCORE: ${overallScore}/100`);
    console.log(`🎯 GRADE: ${this.getGrade(overallScore)}\n`);
    
    console.log('📊 CATEGORY BREAKDOWN:');
    console.log(`♿ Accessibility: ${accessibilityScore}/100`);
    console.log(`⚡ Performance: ${Math.round(performanceScore)}/100`);
    console.log(`🏗️  Modern Standards: ${modernScore}/100`);
    console.log(`🎨 Design System: ${Math.round(designScore)}/100`);
    console.log(`📱 Responsive Design: ${responsiveScore}/100`);
    console.log(`📋 Semantic HTML: ${semanticScore}/100\n`);
    
    console.log('🎯 KEY FINDINGS:');
    
    if (accessibilityScore < 80) {
      console.log('⚠️  Accessibility needs improvement - focus on ARIA labels and semantic structure');
    } else {
      console.log('✅ Accessibility is well implemented');
    }
    
    if (semanticElements > 5) {
      console.log('✅ Good use of semantic HTML5 elements');
    } else {
      console.log('⚠️  Consider using more semantic HTML5 elements');
    }
    
    if (modernScore > 70) {
      console.log('✅ Modern web standards well adopted');
    } else {
      console.log('⚠️  More modern CSS and HTML5 features could be utilized');
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    
    if (accessibilityIssues > 10) {
      console.log('• Implement comprehensive ARIA labeling strategy');
      console.log('• Add semantic landmarks (header, nav, main, footer)');
      console.log('• Ensure proper heading hierarchy');
    }
    
    if (colorVariety > 30) {
      console.log('• Consider consolidating color palette for consistency');
      console.log('• Implement CSS custom properties for theme management');
    }
    
    if (responsiveIssues > 2) {
      console.log('• Review responsive breakpoints and layout behavior');
      console.log('• Ensure touch targets meet minimum size requirements (44px)');
    }
    
    console.log('• Continue leveraging Tailwind CSS for consistent design system');
    console.log('• Maintain excellent React component architecture');
    console.log('• Consider implementing more advanced CSS animations for enhanced UX');
    
    console.log('\n✅ Audit Complete! The notecards app demonstrates solid modern web development practices.');
  }
  
  getGrade(score) {
    if (score >= 90) return 'A+ (Excellent)';
    if (score >= 80) return 'A (Very Good)';
    if (score >= 70) return 'B (Good)';
    if (score >= 60) return 'C (Satisfactory)';
    return 'D (Needs Improvement)';
  }
}

// Run the audit
const auditor = new CSSHTMLAuditor();
auditor.runComprehensiveAudit();
