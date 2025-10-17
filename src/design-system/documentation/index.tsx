/**
 * Design System Documentation Portal
 * 
 * Comprehensive documentation site with API reference, usage guidelines,
 * interactive examples, and accessibility guidelines. Built for developer
 * experience and design system adoption.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Text, Heading, Code } from '../typography';
import { Button, Input, Card } from '../components';
import { colorSystem, colorCombinations, typographyVariants } from '../typography';

// Documentation navigation structure
export interface DocSection {
  id: string;
  title: string;
  description: string;
  content: React.ComponentType;
  subsections?: DocSubsection[];
}

export interface DocSubsection {
  id: string;
  title: string;
  description: string;
  content: React.ComponentType;
}

// Component showcase utilities
export interface ComponentExample {
  title: string;
  description: string;
  component: React.ComponentType;
  code: string;
  props?: Record<string, unknown>;
}

// Documentation portal props
export interface DocumentationPortalProps {
  darkMode?: boolean;
  onThemeChange?: (isDark: boolean) => void;
  searchEnabled?: boolean;
  version?: string;
}

// Design tokens showcase component
const DesignTokensShowcase: React.FC = () => {
  const [selectedTokenCategory, setSelectedTokenCategory] = useState<'colors' | 'typography' | 'spacing'>('colors');
  
  return (
    <div className="design-tokens-showcase">
      <Heading level={2} variant="heading" size="large">Design Tokens</Heading>
      <Text variant="bodyLarge">
        Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes.
      </Text>
      
      <div className="token-navigation" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <Button 
          variant={selectedTokenCategory === 'colors' ? 'primary' : 'secondary'}
          onClick={() => setSelectedTokenCategory('colors')}
        >
          Colors
        </Button>
        <Button 
          variant={selectedTokenCategory === 'typography' ? 'primary' : 'secondary'}
          onClick={() => setSelectedTokenCategory('typography')}
        >
          Typography
        </Button>
        <Button 
          variant={selectedTokenCategory === 'spacing' ? 'primary' : 'secondary'}
          onClick={() => setSelectedTokenCategory('spacing')}
        >
          Spacing
        </Button>
      </div>
      
      {selectedTokenCategory === 'colors' && <ColorTokensDisplay />}
      {selectedTokenCategory === 'typography' && <TypographyTokensDisplay />}
      {selectedTokenCategory === 'spacing' && <SpacingTokensDisplay />}
    </div>
  );
};

// Color tokens display
const ColorTokensDisplay: React.FC = () => {
  return (
    <div className="color-tokens">
      <Heading level={3} variant="heading" size="medium">Color Palette</Heading>
      
      {/* Primary Colors */}
      <div className="color-palette-section" style={{ marginBottom: '2rem' }}>
        <Heading level={4} variant="heading" size="small">Primary Colors</Heading>
        <div className="color-swatches" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          {Object.entries(colorSystem.primary).map(([key, value]) => (
            <div key={key} className="color-swatch" style={{ textAlign: 'center' }}>
              <div 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: value, 
                  borderRadius: '8px',
                  border: '1px solid ' + colorCombinations.surfaces.border,
                  marginBottom: '0.5rem'
                }} 
              />
              <Text variant="caption">primary-{key}</Text>
              <Code size="small" inline>{value}</Code>
            </div>
          ))}
        </div>
      </div>
      
      {/* Semantic Colors */}
      <div className="semantic-colors" style={{ marginBottom: '2rem' }}>
        <Heading level={4} variant="heading" size="small">Semantic Colors</Heading>
        <div className="semantic-swatches" style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          {Object.entries({
            success: colorSystem.success[500],
            warning: colorSystem.warning[500],
            error: colorSystem.error[500],
            info: colorSystem.info[500]
          }).map(([name, value]) => (
            <div key={name} className="semantic-swatch" style={{ textAlign: 'center' }}>
              <div 
                style={{ 
                  width: '100px', 
                  height: '60px', 
                  backgroundColor: value, 
                  borderRadius: '8px',
                  marginBottom: '0.5rem'
                }} 
              />
              <Text variant="label">{name}</Text>
              <Code size="small" inline>{value}</Code>
            </div>
          ))}
        </div>
      </div>
      
      {/* WCAG Compliance Information */}
      <div className="wcag-info" style={{ 
        padding: '1.5rem', 
        backgroundColor: colorCombinations.semanticBackgrounds.info,
        borderRadius: '8px',
        border: `1px solid ${colorSystem.info[200]}`
      }}>
        <Heading level={4} variant="heading" size="small">WCAG Compliance</Heading>
        <Text variant="bodyMedium">
          All color combinations in this design system meet WCAG AA standards (4.5:1 contrast ratio minimum).
          Use the predefined color combinations to ensure accessibility compliance.
        </Text>
      </div>
    </div>
  );
};

// Typography tokens display
const TypographyTokensDisplay: React.FC = () => {
  return (
    <div className="typography-tokens">
      <Heading level={3} variant="heading" size="medium">Typography Scale</Heading>
      
      <div className="typography-examples" style={{ marginTop: '2rem' }}>
        {Object.entries(typographyVariants).map(([name, variant]) => (
          <div key={name} className="typography-example" style={{ marginBottom: '2rem', padding: '1rem', border: `1px solid ${colorCombinations.surfaces.border}`, borderRadius: '8px' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <Text variant="label">{name}</Text>
            </div>
            <div style={variant}>
              The quick brown fox jumps over the lazy dog
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Code size="small" inline>Size: {variant.fontSize}</Code>
              <Code size="small" inline>Weight: {variant.fontWeight}</Code>
              <Code size="small" inline>Line Height: {variant.lineHeight}</Code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Spacing tokens display
const SpacingTokensDisplay: React.FC = () => {
  const spacingTokens = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
  };
  
  return (
    <div className="spacing-tokens">
      <Heading level={3} variant="heading" size="medium">Spacing Scale</Heading>
      <Text variant="bodyMedium">
        Consistent spacing creates visual rhythm and hierarchy. Use these tokens for margins, padding, and gaps.
      </Text>
      
      <div className="spacing-examples" style={{ marginTop: '2rem' }}>
        {Object.entries(spacingTokens).map(([name, value]) => (
          <div key={name} className="spacing-example" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '1rem',
            padding: '1rem',
            border: `1px solid ${colorCombinations.surfaces.border}`,
            borderRadius: '8px'
          }}>
            <div style={{ width: '100px' }}>
              <Text variant="label">spacing-{name}</Text>
            </div>
            <div style={{ 
              width: value, 
              height: '2rem', 
              backgroundColor: colorSystem.primary[500],
              borderRadius: '4px',
              marginRight: '1rem'
            }} />
            <Code size="small" inline>{value}</Code>
          </div>
        ))}
      </div>
    </div>
  );
};

// Component showcase
const ComponentShowcase: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<'button' | 'input' | 'card'>('button');
  
  const componentExamples: Record<string, ComponentExample[]> = {
    button: [
      {
        title: 'Primary Button',
        description: 'Main call-to-action button for primary actions',
        component: () => <Button variant="primary">Primary Action</Button>,
        code: '<Button variant="primary">Primary Action</Button>',
      },
      {
        title: 'Secondary Button',
        description: 'Supporting actions and secondary calls-to-action',
        component: () => <Button variant="secondary">Secondary Action</Button>,
        code: '<Button variant="secondary">Secondary Action</Button>',
      },
      {
        title: 'Button Sizes',
        description: 'Different button sizes for various contexts',
        component: () => (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        ),
        code: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`,
      },
      {
        title: 'Button States',
        description: 'Interactive states for user feedback',
        component: () => (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Button variant="primary">Default</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="danger">Destructive</Button>
          </div>
        ),
        code: `<Button variant="primary">Default</Button>
<Button variant="primary" disabled>Disabled</Button>
<Button variant="danger">Destructive</Button>`,
      },
    ],
    input: [
      {
        title: 'Text Input',
        description: 'Basic text input for user data entry',
        component: () => <Input placeholder="Enter your name" />,
        code: '<Input placeholder="Enter your name" />',
      },
      {
        title: 'Input with Label',
        description: 'Labeled input for form fields',
        component: () => (
          <div>
            <Text variant="label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Email Address
            </Text>
            <Input type="email" placeholder="your@email.com" />
          </div>
        ),
        code: `<Text variant="label">Email Address</Text>
<Input type="email" placeholder="your@email.com" />`,
      },
      {
        title: 'Input States',
        description: 'Different input states for validation feedback',
        component: () => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input placeholder="Default input" />
            <Input placeholder="Error state" error />
            <Input placeholder="Disabled input" disabled />
          </div>
        ),
        code: `<Input placeholder="Default input" />
<Input placeholder="Error state" error />
<Input placeholder="Disabled input" disabled />`,
      },
    ],
    card: [
      {
        title: 'Basic Card',
        description: 'Container for grouping related content',
        component: () => (
          <div style={{ maxWidth: '300px' }}>
            <Card>
              <Heading level={3} variant="heading" size="small">Card Title</Heading>
              <Text variant="bodyMedium">
                This is a basic card component that can contain any content.
              </Text>
            </Card>
          </div>
        ),
        code: `<Card>
  <Heading level={3} variant="heading" size="small">Card Title</Heading>
  <Text variant="bodyMedium">
    This is a basic card component that can contain any content.
  </Text>
</Card>`,
      },
      {
        title: 'Interactive Card',
        description: 'Clickable card with hover effects',
        component: () => (
          <div style={{ maxWidth: '300px' }}>
            <Card 
              hoverable 
              onClick={() => alert('Card clicked!')}
            >
              <Heading level={3} variant="heading" size="small">Interactive Card</Heading>
              <Text variant="bodyMedium">
                Click this card to see the interactive behavior.
              </Text>
            </Card>
          </div>
        ),
        code: `<Card hoverable onClick={handleClick}>
  <Heading level={3} variant="heading" size="small">Interactive Card</Heading>
  <Text variant="bodyMedium">
    Click this card to see the interactive behavior.
  </Text>
</Card>`,
      },
    ],
  };
  
  return (
    <div className="component-showcase">
      <Heading level={2} variant="heading" size="large">Components</Heading>
      <Text variant="bodyLarge">
        Reusable UI components built with consistent design patterns and accessibility standards.
      </Text>
      
      <div className="component-navigation" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <span style={{ marginRight: '1rem' }}>
          <Button 
            variant={selectedComponent === 'button' ? 'primary' : 'secondary'}
            onClick={() => setSelectedComponent('button')}
          >
            Button
          </Button>
        </span>
        <span style={{ marginRight: '1rem' }}>
          <Button 
            variant={selectedComponent === 'input' ? 'primary' : 'secondary'}
            onClick={() => setSelectedComponent('input')}
          >
            Input
          </Button>
        </span>
        <Button 
          variant={selectedComponent === 'card' ? 'primary' : 'secondary'}
          onClick={() => setSelectedComponent('card')}
        >
          Card
        </Button>
      </div>
      
      <div className="component-examples">
        {componentExamples[selectedComponent].map((example, index) => (
          <div key={index} className="component-example" style={{ 
            marginBottom: '3rem',
            padding: '2rem',
            border: `1px solid ${colorCombinations.surfaces.border}`,
            borderRadius: '8px'
          }}>
            <Heading level={4} variant="heading" size="small">{example.title}</Heading>
            <Text variant="bodyMedium" style={{ marginBottom: '1.5rem' }}>
              {example.description}
            </Text>
            
            <div className="example-preview" style={{ 
              padding: '2rem',
              backgroundColor: colorCombinations.surfaces.backgroundSecondary,
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <example.component />
            </div>
            
            <div className="example-code">
              <Text variant="label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Code Example
              </Text>
              <Code size="medium" inline={false}>
                {example.code}
              </Code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Getting started guide
const GettingStartedGuide: React.FC = () => {
  return (
    <div className="getting-started">
      <Heading level={2} variant="heading" size="large">Getting Started</Heading>
      <Text variant="bodyLarge">
        Quick start guide to integrating the design system into your project.
      </Text>
      
      <div className="installation-section" style={{ marginTop: '2rem' }}>
        <Heading level={3} variant="heading" size="medium">Installation</Heading>
        <Text variant="bodyMedium" style={{ marginBottom: '1rem' }}>
          Install the design system package in your project:
        </Text>
        <Code size="medium" inline={false}>
          npm install @company/design-system
        </Code>
      </div>
      
      <div className="basic-usage" style={{ marginTop: '2rem' }}>
        <Heading level={3} variant="heading" size="medium">Basic Usage</Heading>
        <Text variant="bodyMedium" style={{ marginBottom: '1rem' }}>
          Import and use components in your React application:
        </Text>
        <Code size="medium" inline={false}>
{`import { Button, Input, Card, Text } from '@company/design-system';

function MyComponent() {
  return (
    <Card>
      <Text variant="headingMedium">Welcome</Text>
      <Input placeholder="Enter your email" />
      <Button variant="primary">Get Started</Button>
    </Card>
  );
}`}
        </Code>
      </div>
      
      <div className="theming-section" style={{ marginTop: '2rem' }}>
        <Heading level={3} variant="heading" size="medium">Theming</Heading>
        <Text variant="bodyMedium" style={{ marginBottom: '1rem' }}>
          The design system includes CSS custom properties for easy theming:
        </Text>
        <Code size="medium" inline={false}>
{`:root {
  --color-primary-500: #3b82f6;
  --color-text-primary: #1f2937;
  --font-family-system: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
}`}
        </Code>
      </div>
    </div>
  );
};

// Accessibility guidelines
const AccessibilityGuide: React.FC = () => {
  return (
    <div className="accessibility-guide">
      <Heading level={2} variant="heading" size="large">Accessibility Guidelines</Heading>
      <Text variant="bodyLarge">
        Our design system is built with accessibility as a core principle. All components meet WCAG 2.1 AA standards.
      </Text>
      
      <div className="wcag-compliance" style={{ marginTop: '2rem' }}>
        <Heading level={3} variant="heading" size="medium">WCAG Compliance</Heading>
        <div style={{ 
          padding: '1.5rem',
          backgroundColor: colorCombinations.semanticBackgrounds.success,
          border: `1px solid ${colorSystem.success[200]}`,
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <Text variant="bodyMedium">
            ✅ All color combinations meet WCAG AA contrast requirements (4.5:1 minimum)
          </Text>
          <Text variant="bodyMedium">
            ✅ All interactive elements are keyboard accessible
          </Text>
          <Text variant="bodyMedium">
            ✅ Screen reader support with proper ARIA labels and roles
          </Text>
          <Text variant="bodyMedium">
            ✅ Focus management and indication for all interactive elements
          </Text>
        </div>
      </div>
      
      <div className="color-accessibility" style={{ marginBottom: '2rem' }}>
        <Heading level={3} variant="heading" size="medium">Color and Contrast</Heading>
        <Text variant="bodyMedium" style={{ marginBottom: '1rem' }}>
          Use predefined color combinations to ensure accessibility:
        </Text>
        <Code size="medium" inline={false}>
{`// Good: Using predefined combinations
<Text style={{ color: colorCombinations.textOnLight.primary }}>
  Primary text content
</Text>

// Avoid: Custom color combinations without testing
<Text style={{ color: '#888888' }}>
  This may not meet contrast requirements
</Text>`}
        </Code>
      </div>
      
      <div className="keyboard-navigation" style={{ marginBottom: '2rem' }}>
        <Heading level={3} variant="heading" size="medium">Keyboard Navigation</Heading>
        <Text variant="bodyMedium" style={{ marginBottom: '1rem' }}>
          All interactive components support keyboard navigation:
        </Text>
        <ul style={{ marginLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <Text variant="bodyMedium">
              <strong>Tab:</strong> Navigate between interactive elements
            </Text>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Text variant="bodyMedium">
              <strong>Enter/Space:</strong> Activate buttons and links
            </Text>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Text variant="bodyMedium">
              <strong>Escape:</strong> Close modals and dropdowns
            </Text>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Text variant="bodyMedium">
              <strong>Arrow keys:</strong> Navigate within component groups
            </Text>
          </li>
        </ul>
      </div>
      
      <div className="screen-reader-support">
        <Heading level={3} variant="heading" size="medium">Screen Reader Support</Heading>
        <Text variant="bodyMedium" style={{ marginBottom: '1rem' }}>
          Components include proper ARIA attributes and semantic HTML:
        </Text>
        <Code size="medium" inline={false}>
{`// Buttons with clear labels
<Button aria-label="Close dialog">×</Button>

// Form inputs with labels
<label htmlFor="email">Email Address</label>
<Input id="email" type="email" required aria-describedby="email-help" />
<Text id="email-help" variant="caption">We'll never share your email</Text>`}
        </Code>
      </div>
    </div>
  );
};

// Search functionality
interface SearchResult {
  id: string;
  title: string;
  description: string;
  section: string;
  url: string;
}

const SearchComponent: React.FC<{
  onSearch: (query: string) => void;
  results: SearchResult[];
  isSearching: boolean;
}> = ({ onSearch, results, isSearching }) => {
  const [query, setQuery] = useState('');
  
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    onSearch(value);
  }, [onSearch]);
  
  return (
    <div className="search-component">
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Input 
          placeholder="Search documentation..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          fullWidth
        />
      </div>
      
      {query && (
        <div className="search-results" style={{ 
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: colorCombinations.surfaces.backgroundSecondary,
          borderRadius: '8px',
          border: `1px solid ${colorCombinations.surfaces.border}`
        }}>
          {isSearching && <Text variant="bodyMedium">Searching...</Text>}
          
          {!isSearching && results.length === 0 && query && (
            <Text variant="bodyMedium">No results found for "{query}"</Text>
          )}
          
          {!isSearching && results.length > 0 && (
            <div>
              <Text variant="label" style={{ marginBottom: '1rem', display: 'block' }}>
                {results.length} result{results.length === 1 ? '' : 's'} found
              </Text>
              {results.map((result) => (
                <div key={result.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: `1px solid ${colorCombinations.surfaces.border}` }}>
                  <Heading level={4} variant="heading" size="small">{result.title}</Heading>
                  <Text variant="caption" style={{ marginBottom: '0.5rem', display: 'block' }}>
                    {result.section}
                  </Text>
                  <Text variant="bodyMedium">{result.description}</Text>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main documentation portal component
export const DocumentationPortal: React.FC<DocumentationPortalProps> = ({
  darkMode = false,
  onThemeChange,
  searchEnabled = true,
  version = '1.0.0',
}) => {
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const sections: DocSection[] = useMemo(() => [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Quick start guide and installation instructions',
      content: GettingStartedGuide,
    },
    {
      id: 'design-tokens',
      title: 'Design Tokens',
      description: 'Colors, typography, and spacing tokens',
      content: DesignTokensShowcase,
    },
    {
      id: 'components',
      title: 'Components',
      description: 'Interactive component library with examples',
      content: ComponentShowcase,
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      description: 'WCAG compliance and accessibility guidelines',
      content: AccessibilityGuide,
    },
  ], []);
  
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    // Simulate search - in real implementation, would search through documentation content
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Button Component',
          description: 'Primary and secondary button variants with different sizes and states',
          section: 'Components',
          url: '#components',
        },
        {
          id: '2', 
          title: 'Color Tokens',
          description: 'Primary, secondary, and semantic color palette with WCAG compliance',
          section: 'Design Tokens',
          url: '#design-tokens',
        },
      ].filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 300);
  }, []);
  
  const ActiveSectionComponent = sections.find(s => s.id === activeSection)?.content || GettingStartedGuide;
  
  return (
    <div className="documentation-portal" style={{
      fontFamily: 'var(--font-family-system)',
      backgroundColor: colorCombinations.surfaces.background,
      color: colorCombinations.textOnLight.primary,
      minHeight: '100vh',
    }}>
      {/* Header */}
      <header style={{
        padding: '1rem 2rem',
        borderBottom: `1px solid ${colorCombinations.surfaces.border}`,
        backgroundColor: colorCombinations.surfaces.backgroundSecondary,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <Heading level={1} variant="heading" size="large">Design System</Heading>
            <Text variant="caption">v{version}</Text>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {searchEnabled && (
              <SearchComponent 
                onSearch={handleSearch}
                results={searchResults}
                isSearching={isSearching}
              />
            )}
            
            {onThemeChange && (
              <Button 
                variant="secondary" 
                onClick={() => onThemeChange(!darkMode)}
                aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              >
                {darkMode ? '☀️' : '🌙'}
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Navigation */}
        <nav style={{
          width: '250px',
          padding: '2rem 1rem',
          borderRight: `1px solid ${colorCombinations.surfaces.border}`,
          backgroundColor: colorCombinations.surfaces.backgroundSecondary,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}>
          <Text variant="label" style={{ marginBottom: '1rem', display: 'block' }}>
            DOCUMENTATION
          </Text>
          
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem 1rem',
                marginBottom: '0.25rem',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeSection === section.id ? colorCombinations.interactive.primary.default : 'transparent',
                color: activeSection === section.id ? colorCombinations.textOnDark.primary : colorCombinations.textOnLight.primary,
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: activeSection === section.id ? 600 : 400,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.backgroundColor = colorCombinations.surfaces.elevation2;
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{ marginBottom: '0.25rem' }}>{section.title}</div>
              <div style={{ 
                fontSize: '0.75rem',
                opacity: 0.7,
                fontWeight: 400,
              }}>
                {section.description}
              </div>
            </button>
          ))}
        </nav>
        
        {/* Main content */}
        <main style={{
          flex: 1,
          padding: '2rem',
          backgroundColor: colorCombinations.surfaces.background,
        }}>
          <ActiveSectionComponent />
        </main>
      </div>
    </div>
  );
};

export default DocumentationPortal;