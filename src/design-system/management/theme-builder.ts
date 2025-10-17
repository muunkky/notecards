/**
 * Management Theme Builder
 * 
 * Visual interface for non-technical management to create
 * and customize themes without developer intervention.
 */

import { themeManager, ThemeDefinition } from '../theme/theme-manager.js';
import { tokenCSS } from '../tokens/token-css.js';
import { DesignTokens } from '../tokens/design-tokens.js';

interface ColorPickerConfig {
  id: string;
  label: string;
  category: 'brand' | 'semantic' | 'status';
  tokenPath: string;
  description: string;
}

interface TypographyConfig {
  id: string;
  label: string;
  type: 'font-family' | 'font-size' | 'font-weight';
  tokenPath: string;
  options?: string[] | number[];
}

interface SpacingConfig {
  id: string;
  label: string;
  tokenPath: string;
  min: number;
  max: number;
  step: number;
  unit: 'px' | 'rem' | 'em';
}

export class ManagementThemeBuilder {
  private container: HTMLElement;
  private previewContainer!: HTMLElement;
  private currentTheme: Partial<DesignTokens> = {};
  private baseTheme: string = 'default';
  
  constructor(containerId: string) {
    this.container = document.getElementById(containerId) || document.body;
    this.createInterface();
    this.loadBaseTheme();
  }
  
  /**
   * Create the complete management interface
   */
  private createInterface(): void {
    this.container.innerHTML = `
      <div style="
        display: grid;
        grid-template-columns: 400px 1fr;
        gap: 2rem;
        min-height: 100vh;
        background: ${tokenCSS.color.backgroundBase};
        font-family: ${tokenCSS.typography.fontPrimary};
      ">
        <!-- Controls Panel -->
        <div id="controls-panel" style="
          background: ${tokenCSS.color.backgroundElevated};
          border-right: 1px solid ${tokenCSS.color.borderDefault};
          padding: ${tokenCSS.spacing.lg};
          overflow-y: auto;
        ">
          <div style="margin-bottom: ${tokenCSS.spacing.xl};">
            <h1 style="
              font-size: ${tokenCSS.typography.fontSize2xl};
              font-weight: ${tokenCSS.typography.fontWeightBold};
              color: ${tokenCSS.color.textPrimary};
              margin: 0 0 ${tokenCSS.spacing.md} 0;
            ">🎨 Theme Builder</h1>
            <p style="
              color: ${tokenCSS.color.textSecondary};
              font-size: ${tokenCSS.typography.fontSizeSm};
              margin: 0 0 ${tokenCSS.spacing.lg} 0;
            ">Create custom themes instantly. Changes appear in real-time on the right.</p>
            
            <!-- Base Theme Selector -->
            <div style="margin-bottom: ${tokenCSS.spacing.lg};">
              <label style="
                display: block;
                font-weight: ${tokenCSS.typography.fontWeightMedium};
                color: ${tokenCSS.color.textPrimary};
                margin-bottom: ${tokenCSS.spacing.xs};
              ">Start with base theme:</label>
              <select id="base-theme-select" style="
                width: 100%;
                padding: ${tokenCSS.spacing.sm};
                border: 1px solid ${tokenCSS.color.borderDefault};
                border-radius: ${tokenCSS.interactions.borderRadius};
                background: ${tokenCSS.color.backgroundBase};
                color: ${tokenCSS.color.textPrimary};
                font-size: ${tokenCSS.typography.fontSizeSm};
              ">
                <option value="default">Default (Balanced)</option>
                <option value="corporate">Corporate (Conservative)</option>
                <option value="creative">Creative (Bold)</option>
                <option value="minimal">Minimal (Clean)</option>
                <option value="accessible">Accessible (WCAG AAA)</option>
                <option value="dense">Dense (Compact)</option>
              </select>
            </div>
          </div>
          
          <!-- Brand Colors Section -->
          <div id="brand-colors" style="margin-bottom: ${tokenCSS.spacing.xl};">
            <h2 style="
              font-size: ${tokenCSS.typography.fontSizeLg};
              font-weight: ${tokenCSS.typography.fontWeightMedium};
              color: ${tokenCSS.color.textPrimary};
              margin: 0 0 ${tokenCSS.spacing.md} 0;
              border-bottom: 2px solid ${tokenCSS.color.borderSubtle};
              padding-bottom: ${tokenCSS.spacing.xs};
            ">🎯 Brand Colors</h2>
            <div id="brand-color-controls"></div>
          </div>
          
          <!-- Typography Section -->
          <div id="typography" style="margin-bottom: ${tokenCSS.spacing.xl};">
            <h2 style="
              font-size: ${tokenCSS.typography.fontSizeLg};
              font-weight: ${tokenCSS.typography.fontWeightMedium};
              color: ${tokenCSS.color.textPrimary};
              margin: 0 0 ${tokenCSS.spacing.md} 0;
              border-bottom: 2px solid ${tokenCSS.color.borderSubtle};
              padding-bottom: ${tokenCSS.spacing.xs};
            ">📝 Typography</h2>
            <div id="typography-controls"></div>
          </div>
          
          <!-- Spacing Section -->
          <div id="spacing" style="margin-bottom: ${tokenCSS.spacing.xl};">
            <h2 style="
              font-size: ${tokenCSS.typography.fontSizeLg};
              font-weight: ${tokenCSS.typography.fontWeightMedium};
              color: ${tokenCSS.color.textPrimary};
              margin: 0 0 ${tokenCSS.spacing.md} 0;
              border-bottom: 2px solid ${tokenCSS.color.borderSubtle};
              padding-bottom: ${tokenCSS.spacing.xs};
            ">📏 Spacing & Layout</h2>
            <div id="spacing-controls"></div>
          </div>
          
          <!-- Actions -->
          <div style="
            border-top: 1px solid ${tokenCSS.color.borderSubtle};
            padding-top: ${tokenCSS.spacing.lg};
            margin-top: ${tokenCSS.spacing.xl};
          ">
            <button id="save-theme" style="
              width: 100%;
              background: ${tokenCSS.button.primaryBackground};
              color: ${tokenCSS.button.primaryText};
              border: 1px solid ${tokenCSS.button.primaryBorder};
              border-radius: ${tokenCSS.button.borderRadius};
              padding: ${tokenCSS.button.paddingMd};
              font-size: ${tokenCSS.button.fontSizeMd};
              font-weight: ${tokenCSS.button.fontWeight};
              cursor: pointer;
              margin-bottom: ${tokenCSS.spacing.sm};
              transition: ${tokenCSS.button.transition};
            ">💾 Save Custom Theme</button>
            
            <button id="export-theme" style="
              width: 100%;
              background: ${tokenCSS.button.secondaryBackground};
              color: ${tokenCSS.button.secondaryText};
              border: 1px solid ${tokenCSS.button.secondaryBorder};
              border-radius: ${tokenCSS.button.borderRadius};
              padding: ${tokenCSS.button.paddingMd};
              font-size: ${tokenCSS.button.fontSizeMd};
              font-weight: ${tokenCSS.button.fontWeight};
              cursor: pointer;
              margin-bottom: ${tokenCSS.spacing.sm};
              transition: ${tokenCSS.button.transition};
            ">📤 Export Theme Config</button>
            
            <button id="reset-theme" style="
              width: 100%;
              background: transparent;
              color: ${tokenCSS.color.error};
              border: 1px solid ${tokenCSS.color.error};
              border-radius: ${tokenCSS.button.borderRadius};
              padding: ${tokenCSS.button.paddingSm};
              font-size: ${tokenCSS.button.fontSizeSm};
              cursor: pointer;
              transition: ${tokenCSS.button.transition};
            ">🔄 Reset to Base</button>
          </div>
        </div>
        
        <!-- Live Preview Panel -->
        <div id="preview-panel" style="
          padding: ${tokenCSS.spacing.lg};
          overflow-y: auto;
        ">
          <div style="
            background: ${tokenCSS.color.backgroundElevated};
            border: 1px solid ${tokenCSS.color.borderDefault};
            border-radius: ${tokenCSS.interactions.borderRadius};
            padding: ${tokenCSS.spacing.lg};
            margin-bottom: ${tokenCSS.spacing.lg};
          ">
            <h2 style="
              font-size: ${tokenCSS.typography.fontSizeXl};
              font-weight: ${tokenCSS.typography.fontWeightBold};
              color: ${tokenCSS.color.textPrimary};
              margin: 0 0 ${tokenCSS.spacing.md} 0;
            ">👁️ Live Preview</h2>
            <p style="
              color: ${tokenCSS.color.textSecondary};
              margin: 0 0 ${tokenCSS.spacing.md} 0;
            ">Your theme changes are applied instantly. This is exactly what users will see.</p>
          </div>
          
          <div id="preview-content">
            <!-- Preview content will be injected here -->
          </div>
        </div>
      </div>
    `;
    
    this.previewContainer = document.getElementById('preview-content')!;
    this.createColorControls();
    this.createTypographyControls();
    this.createSpacingControls();
    this.createPreviewContent();
    this.bindEvents();
  }
  
  /**
   * Create color picker controls
   */
  private createColorControls(): void {
    const colorConfigs: ColorPickerConfig[] = [
      {
        id: 'primary',
        label: 'Primary Brand Color',
        category: 'brand',
        tokenPath: 'semantic.colors.primary',
        description: 'Main brand color for buttons, links, and highlights'
      },
      {
        id: 'secondary',
        label: 'Secondary Color',
        category: 'brand',
        tokenPath: 'semantic.colors.secondary',
        description: 'Supporting brand color for accents and variety'
      },
      {
        id: 'accent',
        label: 'Accent Color',
        category: 'brand',
        tokenPath: 'semantic.colors.accent',
        description: 'Special highlights and call-to-action elements'
      },
      {
        id: 'background',
        label: 'Background Color',
        category: 'semantic',
        tokenPath: 'semantic.colors.backgroundBase',
        description: 'Main page background color'
      },
      {
        id: 'text',
        label: 'Text Color',
        category: 'semantic',
        tokenPath: 'semantic.colors.textPrimary',
        description: 'Primary text color for readability'
      }
    ];
    
    const container = document.getElementById('brand-color-controls')!;
    
    colorConfigs.forEach(config => {
      const controlHTML = `
        <div style="margin-bottom: ${tokenCSS.spacing.md};">
          <label style="
            display: block;
            font-weight: ${tokenCSS.typography.fontWeightMedium};
            color: ${tokenCSS.color.textPrimary};
            margin-bottom: ${tokenCSS.spacing.xs};
            font-size: ${tokenCSS.typography.fontSizeSm};
          ">${config.label}</label>
          
          <div style="display: flex; gap: ${tokenCSS.spacing.sm}; align-items: center;">
            <input 
              type="color" 
              id="color-${config.id}"
              data-token-path="${config.tokenPath}"
              style="
                width: 40px;
                height: 40px;
                border: 1px solid ${tokenCSS.color.borderDefault};
                border-radius: ${tokenCSS.interactions.borderRadius};
                cursor: pointer;
              "
            />
            <input 
              type="text" 
              id="color-${config.id}-hex"
              placeholder="#3b82f6"
              style="
                flex: 1;
                padding: ${tokenCSS.spacing.sm};
                border: 1px solid ${tokenCSS.color.borderDefault};
                border-radius: ${tokenCSS.interactions.borderRadius};
                background: ${tokenCSS.color.backgroundBase};
                color: ${tokenCSS.color.textPrimary};
                font-size: ${tokenCSS.typography.fontSizeSm};
                font-family: ${tokenCSS.typography.fontMono};
              "
            />
          </div>
          
          <p style="
            font-size: ${tokenCSS.typography.fontSizeXs};
            color: ${tokenCSS.color.textMuted};
            margin: ${tokenCSS.spacing.xs} 0 0 0;
          ">${config.description}</p>
        </div>
      `;
      
      container.innerHTML += controlHTML;
    });
  }
  
  /**
   * Create typography controls
   */
  private createTypographyControls(): void {
    const typographyConfigs: TypographyConfig[] = [
      {
        id: 'font-primary',
        label: 'Primary Font',
        type: 'font-family',
        tokenPath: 'semantic.typography.fontPrimary',
        options: [
          'Inter, sans-serif',
          'Roboto, sans-serif',
          'system-ui, sans-serif',
          'Georgia, serif',
          'Times New Roman, serif',
          'Courier New, monospace'
        ]
      },
      {
        id: 'font-heading',
        label: 'Heading Font',
        type: 'font-family', 
        tokenPath: 'semantic.typography.fontHeading',
        options: [
          'Inter, sans-serif',
          'Playfair Display, serif',
          'Montserrat, sans-serif',
          'Oswald, sans-serif',
          'Lora, serif'
        ]
      },
      {
        id: 'font-size-base',
        label: 'Base Font Size',
        type: 'font-size',
        tokenPath: 'semantic.typography.fontSizeMd',
        options: [12, 14, 16, 18, 20, 22]
      }
    ];
    
    const container = document.getElementById('typography-controls')!;
    
    typographyConfigs.forEach(config => {
      const isSelect = Array.isArray(config.options);
      
      const controlHTML = `
        <div style="margin-bottom: ${tokenCSS.spacing.md};">
          <label style="
            display: block;
            font-weight: ${tokenCSS.typography.fontWeightMedium};
            color: ${tokenCSS.color.textPrimary};
            margin-bottom: ${tokenCSS.spacing.xs};
            font-size: ${tokenCSS.typography.fontSizeSm};
          ">${config.label}</label>
          
          ${isSelect ? `
            <select 
              id="typography-${config.id}"
              data-token-path="${config.tokenPath}"
              data-type="${config.type}"
              style="
                width: 100%;
                padding: ${tokenCSS.spacing.sm};
                border: 1px solid ${tokenCSS.color.borderDefault};
                border-radius: ${tokenCSS.interactions.borderRadius};
                background: ${tokenCSS.color.backgroundBase};
                color: ${tokenCSS.color.textPrimary};
                font-size: ${tokenCSS.typography.fontSizeSm};
              "
            >
              ${(config.options || []).map(option => `
                <option value="${config.type === 'font-size' ? option + 'px' : option}">${option}</option>
              `).join('')}
            </select>
          ` : ''}
        </div>
      `;
      
      container.innerHTML += controlHTML;
    });
  }
  
  /**
   * Create spacing controls
   */
  private createSpacingControls(): void {
    const spacingConfigs: SpacingConfig[] = [
      {
        id: 'spacing-sm',
        label: 'Small Spacing',
        tokenPath: 'semantic.spacing.sm',
        min: 4,
        max: 16,
        step: 2,
        unit: 'px'
      },
      {
        id: 'spacing-md',
        label: 'Medium Spacing',
        tokenPath: 'semantic.spacing.md',
        min: 8,
        max: 32,
        step: 4,
        unit: 'px'
      },
      {
        id: 'spacing-lg',
        label: 'Large Spacing',
        tokenPath: 'semantic.spacing.lg',
        min: 16,
        max: 48,
        step: 4,
        unit: 'px'
      }
    ];
    
    const container = document.getElementById('spacing-controls')!;
    
    spacingConfigs.forEach(config => {
      const controlHTML = `
        <div style="margin-bottom: ${tokenCSS.spacing.md};">
          <label style="
            display: block;
            font-weight: ${tokenCSS.typography.fontWeightMedium};
            color: ${tokenCSS.color.textPrimary};
            margin-bottom: ${tokenCSS.spacing.xs};
            font-size: ${tokenCSS.typography.fontSizeSm};
          ">${config.label}</label>
          
          <div style="display: flex; gap: ${tokenCSS.spacing.sm}; align-items: center;">
            <input 
              type="range" 
              id="spacing-${config.id}"
              data-token-path="${config.tokenPath}"
              min="${config.min}"
              max="${config.max}"
              step="${config.step}"
              style="flex: 1;"
            />
            <span 
              id="spacing-${config.id}-value"
              style="
                min-width: 40px;
                font-family: ${tokenCSS.typography.fontMono};
                font-size: ${tokenCSS.typography.fontSizeSm};
                color: ${tokenCSS.color.textSecondary};
              "
            >${config.min}${config.unit}</span>
          </div>
        </div>
      `;
      
      container.innerHTML += controlHTML;
    });
  }
  
  /**
   * Create preview content that shows theme changes
   */
  private createPreviewContent(): void {
    this.previewContainer.innerHTML = `
      <!-- Preview components will be created by the demo system -->
      <div id="live-demo-container" style="
        background: ${tokenCSS.color.backgroundBase};
        border-radius: ${tokenCSS.interactions.borderRadius};
        padding: ${tokenCSS.spacing.lg};
      ">
        <p style="
          color: ${tokenCSS.color.textSecondary};
          text-align: center;
          font-style: italic;
        ">Preview components will appear here when you make changes...</p>
      </div>
    `;
  }
  
  /**
   * Load base theme and populate controls
   */
  private loadBaseTheme(): void {
    const currentTheme = themeManager.getCurrentTheme();
    this.baseTheme = currentTheme;
    
    // TODO: Load actual theme values into controls
    console.log('Loading base theme:', currentTheme);
  }
  
  /**
   * Bind all event listeners
   */
  private bindEvents(): void {
    // Base theme selector
    const baseThemeSelect = document.getElementById('base-theme-select') as HTMLSelectElement;
    baseThemeSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.switchBaseTheme(target.value);
    });
    
    // Color pickers
    this.bindColorControls();
    
    // Typography controls
    this.bindTypographyControls();
    
    // Spacing controls
    this.bindSpacingControls();
    
    // Action buttons
    this.bindActionButtons();
  }
  
  /**
   * Bind color picker events
   */
  private bindColorControls(): void {
    const colorInputs = document.querySelectorAll('input[type="color"]');
    const hexInputs = document.querySelectorAll('input[id$="-hex"]');
    
    colorInputs.forEach(input => {
      const colorInput = input as HTMLInputElement;
      const hexInput = document.getElementById(colorInput.id + '-hex') as HTMLInputElement;
      
      colorInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const color = target.value;
        hexInput.value = color;
        this.updateTokenValue(target.dataset.tokenPath!, color);
      });
      
      hexInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const color = target.value;
        if (/^#[0-9A-F]{6}$/i.test(color)) {
          colorInput.value = color;
          this.updateTokenValue(colorInput.dataset.tokenPath!, color);
        }
      });
    });
  }
  
  /**
   * Bind typography control events
   */
  private bindTypographyControls(): void {
    const typographySelects = document.querySelectorAll('select[id^="typography-"]');
    
    typographySelects.forEach(select => {
      select.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const value = target.value;
        this.updateTokenValue(target.dataset.tokenPath!, value);
      });
    });
  }
  
  /**
   * Bind spacing control events
   */
  private bindSpacingControls(): void {
    const spacingInputs = document.querySelectorAll('input[id^="spacing-"]');
    
    spacingInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const value = target.value + 'px';
        const valueDisplay = document.getElementById(target.id + '-value');
        if (valueDisplay) {
          valueDisplay.textContent = value;
        }
        this.updateTokenValue(target.dataset.tokenPath!, value);
      });
    });
  }
  
  /**
   * Bind action button events
   */
  private bindActionButtons(): void {
    const saveButton = document.getElementById('save-theme');
    const exportButton = document.getElementById('export-theme');
    const resetButton = document.getElementById('reset-theme');
    
    saveButton?.addEventListener('click', () => this.saveCustomTheme());
    exportButton?.addEventListener('click', () => this.exportTheme());
    resetButton?.addEventListener('click', () => this.resetToBase());
  }
  
  /**
   * Switch base theme
   */
  private switchBaseTheme(themeId: string): void {
    console.log('Switching base theme to:', themeId);
    themeManager.switchTheme(themeId);
    this.baseTheme = themeId;
    this.currentTheme = {};
  }
  
  /**
   * Update a token value and apply changes
   */
  private updateTokenValue(tokenPath: string, value: string): void {
    console.log('Updating token:', tokenPath, '=', value);
    
    // Update current theme object
    this.setNestedProperty(this.currentTheme, tokenPath, value);
    
    // Apply theme changes
    this.applyThemeChanges();
  }
  
  /**
   * Apply current theme changes
   */
  private applyThemeChanges(): void {
    // Create a temporary theme
    const tempTheme: ThemeDefinition = {
      id: 'temp-custom',
      name: 'Custom Theme',
      description: 'User-created custom theme',
      category: 'creative',
      tokens: this.currentTheme
    };
    
    // Register and apply temporary theme
    themeManager.registerTheme(tempTheme);
    themeManager.switchTheme('temp-custom');
  }
  
  /**
   * Save custom theme permanently
   */
  private saveCustomTheme(): void {
    const themeName = prompt('Enter a name for your custom theme:');
    if (!themeName) return;
    
    const themeId = 'custom-' + themeName.toLowerCase().replace(/\s+/g, '-');
    
    const customTheme: ThemeDefinition = {
      id: themeId,
      name: themeName,
      description: 'Management-created custom theme',
      category: 'creative',
      tokens: this.currentTheme
    };
    
    themeManager.registerTheme(customTheme);
    alert(`Theme "${themeName}" saved successfully!`);
    
    console.log('Saved custom theme:', customTheme);
  }
  
  /**
   * Export theme configuration
   */
  private exportTheme(): void {
    const themeConfig = {
      name: 'Custom Theme',
      baseTheme: this.baseTheme,
      customizations: this.currentTheme,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(themeConfig, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-theme.json';
    a.click();
    
    URL.revokeObjectURL(url);
    
    console.log('Exported theme config:', themeConfig);
  }
  
  /**
   * Reset to base theme
   */
  private resetToBase(): void {
    if (confirm('Reset all customizations? This will restore the base theme.')) {
      this.currentTheme = {};
      themeManager.switchTheme(this.baseTheme);
      this.loadBaseTheme();
    }
  }
  
  /**
   * Set nested object property from dot notation path
   */
  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }
}

/**
 * Initialize management theme builder
 */
export function initializeManagementThemeBuilder(containerId: string = 'theme-builder'): ManagementThemeBuilder {
  return new ManagementThemeBuilder(containerId);
}