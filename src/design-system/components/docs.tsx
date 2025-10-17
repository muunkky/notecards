/**
 * Component Documentation Portal
 * 
 * Comprehensive documentation system with examples, API reference,
 * and usage guidelines. Built for easy maintenance and discoverability.
 */

import React, { useState } from 'react';
import { ComponentLibrary } from './index';
import { tokenCSS } from '../design-tokens';

const { Button, Card, Input } = ComponentLibrary;

// Documentation data structure
interface ComponentDocumentation {
  name: string;
  description: string;
  category: string;
  props: PropDocumentation[];
  examples: ComponentExample[];
  designGuidelines: string[];
  accessibility: AccessibilityInfo;
  changelog: ChangelogEntry[];
}

interface PropDocumentation {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: any;
  examples?: string[];
}

interface ComponentExample {
  title: string;
  description: string;
  code: string;
  component: React.ComponentType<any>;
  props: Record<string, any>;
  notes?: string[];
}

interface AccessibilityInfo {
  ariaSupport: string[];
  keyboardSupport: string[];
  screenReaderSupport: string;
  wcagCompliance: string[];
  recommendations: string[];
}

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
  breaking?: boolean;
}

// Component documentation data
const componentDocs: ComponentDocumentation[] = [
  {
    name: 'Button',
    description: 'A versatile button component with multiple variants, sizes, and states. Built for accessibility and consistent design.',
    category: 'Interactive',
    props: [
      {
        name: 'children',
        type: 'React.ReactNode',
        description: 'Button content (text, icons, or other components)',
        required: false,
        examples: ['Save', '<Icon />', 'Save <Icon />']
      },
      {
        name: 'variant',
        type: "'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info'",
        description: 'Visual style variant based on semantic meaning',
        required: false,
        defaultValue: 'primary',
        examples: ['primary', 'danger', 'success']
      },
      {
        name: 'size',
        type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
        description: 'Size variant affecting padding and font size',
        required: false,
        defaultValue: 'md',
        examples: ['sm', 'md', 'lg']
      },
      {
        name: 'disabled',
        type: 'boolean',
        description: 'Whether the button is disabled and non-interactive',
        required: false,
        defaultValue: false
      },
      {
        name: 'loading',
        type: 'boolean',
        description: 'Whether the button is in a loading state with spinner',
        required: false,
        defaultValue: false
      },
      {
        name: 'fullWidth',
        type: 'boolean',
        description: 'Whether the button should span the full width of its container',
        required: false,
        defaultValue: false
      },
      {
        name: 'icon',
        type: 'React.ReactNode',
        description: 'Icon to display alongside button text',
        required: false
      },
      {
        name: 'iconPosition',
        type: "'left' | 'right'",
        description: 'Position of the icon relative to button text',
        required: false,
        defaultValue: 'left'
      },
      {
        name: 'onClick',
        type: '(event: React.MouseEvent<HTMLButtonElement>) => void',
        description: 'Click event handler',
        required: false
      },
      {
        name: 'type',
        type: "'button' | 'submit' | 'reset'",
        description: 'HTML button type attribute',
        required: false,
        defaultValue: 'button'
      }
    ],
    examples: [
      {
        title: 'Basic Button',
        description: 'Default primary button with medium size',
        code: '<Button>Save Changes</Button>',
        component: Button,
        props: { children: 'Save Changes' }
      },
      {
        title: 'Button Variants',
        description: 'Different semantic variants for various use cases',
        code: `<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>
<Button variant="success">Confirm</Button>`,
        component: Button,
        props: { variant: 'primary', children: 'Primary' }
      },
      {
        title: 'Button Sizes',
        description: 'Various size options for different contexts',
        code: `<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>`,
        component: Button,
        props: { size: 'md', children: 'Medium' }
      },
      {
        title: 'Button States',
        description: 'Different interactive states',
        code: `<Button>Normal</Button>
<Button disabled>Disabled</Button>
<Button loading>Loading</Button>`,
        component: Button,
        props: { children: 'Normal' }
      },
      {
        title: 'Button with Icon',
        description: 'Buttons with icons in different positions',
        code: `<Button icon={<SaveIcon />}>Save</Button>
<Button icon={<ArrowIcon />} iconPosition="right">Next</Button>`,
        component: Button,
        props: { icon: '💾', children: 'Save' }
      }
    ],
    designGuidelines: [
      'Use primary buttons for main actions (save, submit, confirm)',
      'Use secondary buttons for secondary actions (cancel, back)',
      'Use danger buttons for destructive actions (delete, remove)',
      'Limit primary buttons to one per section or form',
      'Use consistent sizing within related button groups',
      'Provide adequate spacing between buttons (minimum 8px)',
      'Use loading states for asynchronous operations',
      'Disable buttons when actions are not available'
    ],
    accessibility: {
      ariaSupport: [
        'aria-disabled for disabled state',
        'aria-busy for loading state',
        'aria-label for icon-only buttons',
        'role="button" for non-button elements'
      ],
      keyboardSupport: [
        'Enter key activates button',
        'Space key activates button',
        'Tab key focuses button',
        'Disabled buttons are not focusable'
      ],
      screenReaderSupport: 'Full screen reader support with proper semantic markup and ARIA attributes',
      wcagCompliance: [
        'WCAG 2.1 AA compliant',
        'Minimum 4.5:1 color contrast ratio',
        'Focus indicators visible',
        'Touch target minimum 44x44px'
      ],
      recommendations: [
        'Use descriptive button text',
        'Avoid using color alone to convey meaning',
        'Provide alternative text for icon-only buttons',
        'Test with keyboard navigation',
        'Test with screen readers'
      ]
    },
    changelog: [
      {
        version: '1.0.0',
        date: '2024-01-15',
        changes: [
          'Initial Button component release',
          'Support for variants, sizes, and states',
          'Icon support with positioning',
          'Full accessibility implementation'
        ]
      }
    ]
  },
  
  {
    name: 'Input',
    description: 'A flexible input component with validation, icons, and comprehensive form integration.',
    category: 'Form',
    props: [
      {
        name: 'type',
        type: "'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'",
        description: 'HTML input type attribute',
        required: false,
        defaultValue: 'text'
      },
      {
        name: 'value',
        type: 'string',
        description: 'Controlled component value',
        required: false
      },
      {
        name: 'defaultValue',
        type: 'string',
        description: 'Uncontrolled component default value',
        required: false
      },
      {
        name: 'placeholder',
        type: 'string',
        description: 'Placeholder text when input is empty',
        required: false
      },
      {
        name: 'label',
        type: 'string',
        description: 'Field label for accessibility and UX',
        required: false
      },
      {
        name: 'error',
        type: 'boolean',
        description: 'Whether the field has a validation error',
        required: false,
        defaultValue: false
      },
      {
        name: 'errorMessage',
        type: 'string',
        description: 'Error message to display when field has validation error',
        required: false
      },
      {
        name: 'helperText',
        type: 'string',
        description: 'Helper text to guide user input',
        required: false
      },
      {
        name: 'required',
        type: 'boolean',
        description: 'Whether the field is required for form submission',
        required: false,
        defaultValue: false
      },
      {
        name: 'disabled',
        type: 'boolean',
        description: 'Whether the input is disabled',
        required: false,
        defaultValue: false
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        description: 'Size variant affecting padding and font size',
        required: false,
        defaultValue: 'md'
      },
      {
        name: 'fullWidth',
        type: 'boolean',
        description: 'Whether the input should span full width of container',
        required: false,
        defaultValue: false
      },
      {
        name: 'startIcon',
        type: 'React.ReactNode',
        description: 'Icon to display at the start of the input',
        required: false
      },
      {
        name: 'endIcon',
        type: 'React.ReactNode',
        description: 'Icon to display at the end of the input',
        required: false
      }
    ],
    examples: [
      {
        title: 'Basic Input',
        description: 'Simple text input with label',
        code: '<Input label="Full Name" placeholder="Enter your full name" />',
        component: Input,
        props: { label: 'Full Name', placeholder: 'Enter your full name' }
      },
      {
        title: 'Input with Validation',
        description: 'Input showing error state with message',
        code: `<Input 
  label="Email" 
  type="email" 
  error={true}
  errorMessage="Please enter a valid email address"
  value="invalid-email"
/>`,
        component: Input,
        props: { 
          label: 'Email', 
          type: 'email', 
          error: true,
          errorMessage: 'Please enter a valid email address',
          value: 'invalid-email'
        }
      },
      {
        title: 'Input with Icons',
        description: 'Input with start and end icons',
        code: `<Input 
  label="Search" 
  placeholder="Search products..."
  startIcon={<SearchIcon />}
  endIcon={<ClearIcon />}
/>`,
        component: Input,
        props: { 
          label: 'Search', 
          placeholder: 'Search products...',
          startIcon: '🔍',
          endIcon: '✕'
        }
      }
    ],
    designGuidelines: [
      'Always provide clear, descriptive labels',
      'Use helper text to guide user input',
      'Show validation errors immediately after user interaction',
      'Use appropriate input types for better mobile experience',
      'Group related inputs with consistent spacing',
      'Use icons to enhance understanding, not replace text',
      'Provide clear focus indicators',
      'Use placeholder text sparingly - prefer labels'
    ],
    accessibility: {
      ariaSupport: [
        'aria-invalid for error state',
        'aria-describedby for helper text and errors',
        'aria-required for required fields',
        'aria-label for additional context'
      ],
      keyboardSupport: [
        'Tab key focuses input',
        'Arrow keys for text navigation',
        'All standard keyboard input supported'
      ],
      screenReaderSupport: 'Full screen reader support with proper labeling and error announcement',
      wcagCompliance: [
        'WCAG 2.1 AA compliant',
        'Proper form labeling',
        'Error identification and description',
        'Focus management'
      ],
      recommendations: [
        'Always provide labels, not just placeholders',
        'Test with keyboard-only navigation',
        'Ensure error messages are announced',
        'Use autocomplete attributes where appropriate'
      ]
    },
    changelog: [
      {
        version: '1.0.0',
        date: '2024-01-15',
        changes: [
          'Initial Input component release',
          'Support for various input types',
          'Icon integration',
          'Comprehensive validation support'
        ]
      }
    ]
  },
  
  {
    name: 'Card',
    description: 'A flexible container component for grouping content with various visual styles.',
    category: 'Layout',
    props: [
      {
        name: 'children',
        type: 'React.ReactNode',
        description: 'Content to display in the card body',
        required: false
      },
      {
        name: 'variant',
        type: "'default' | 'elevated' | 'outlined' | 'filled'",
        description: 'Visual style variant of the card',
        required: false,
        defaultValue: 'default'
      },
      {
        name: 'padding',
        type: "'none' | 'sm' | 'md' | 'lg'",
        description: 'Internal padding size for card content',
        required: false,
        defaultValue: 'md'
      },
      {
        name: 'header',
        type: 'React.ReactNode',
        description: 'Header content to display at top of card',
        required: false
      },
      {
        name: 'footer',
        type: 'React.ReactNode',
        description: 'Footer content to display at bottom of card',
        required: false
      },
      {
        name: 'onClick',
        type: '(event: React.MouseEvent<HTMLDivElement>) => void',
        description: 'Click event handler for entire card',
        required: false
      },
      {
        name: 'hoverable',
        type: 'boolean',
        description: 'Whether the card should show hover effects',
        required: false,
        defaultValue: false
      }
    ],
    examples: [
      {
        title: 'Basic Card',
        description: 'Simple card with content',
        code: `<Card>
  <h3>Card Title</h3>
  <p>This is the card content. It can contain any React components.</p>
</Card>`,
        component: Card,
        props: { 
          children: (
            <>
              <h3>Card Title</h3>
              <p>This is the card content. It can contain any React components.</p>
            </>
          )
        }
      },
      {
        title: 'Card with Header and Footer',
        description: 'Card with distinct header and footer sections',
        code: `<Card 
  header="Card Header"
  footer={<Button>Action</Button>}
>
  Main card content goes here.
</Card>`,
        component: Card,
        props: { 
          header: 'Card Header',
          footer: <Button size="sm">Action</Button>,
          children: 'Main card content goes here.'
        }
      }
    ],
    designGuidelines: [
      'Use cards to group related content',
      'Maintain consistent card spacing in layouts',
      'Use elevated cards for temporary content (modals, tooltips)',
      'Use outlined cards for secondary content',
      'Keep card content scannable and well-organized',
      'Use headers for card titles or main actions',
      'Use footers for secondary actions or metadata'
    ],
    accessibility: {
      ariaSupport: [
        'role="button" for clickable cards',
        'tabindex="0" for keyboard navigation',
        'aria-label for context when needed'
      ],
      keyboardSupport: [
        'Tab key focuses clickable cards',
        'Enter/Space activates clickable cards'
      ],
      screenReaderSupport: 'Proper semantic structure with headings and landmarks',
      wcagCompliance: [
        'WCAG 2.1 AA compliant',
        'Proper heading hierarchy',
        'Focus management for interactive cards'
      ],
      recommendations: [
        'Use semantic markup within cards',
        'Ensure proper heading hierarchy',
        'Test keyboard navigation for interactive cards'
      ]
    },
    changelog: [
      {
        version: '1.0.0',
        date: '2024-01-15',
        changes: [
          'Initial Card component release',
          'Multiple visual variants',
          'Header and footer support',
          'Interactive card capabilities'
        ]
      }
    ]
  }
];

// Documentation Portal Component
export const ComponentDocumentationPortal: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<string>('Button');
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  
  const currentDoc = componentDocs.find(doc => doc.name === selectedComponent);
  
  if (!currentDoc) return null;
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    height: '100vh',
    fontFamily: tokenCSS.typography.body.fontFamily,
    color: tokenCSS.semantic.color.textPrimary,
    background: tokenCSS.semantic.color.backgroundPrimary
  };
  
  const sidebarStyle: React.CSSProperties = {
    width: '250px',
    borderRight: `1px solid ${tokenCSS.semantic.color.border}`,
    padding: tokenCSS.semantic.spacing.lg,
    overflowY: 'auto'
  };
  
  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };
  
  const tabBarStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: `1px solid ${tokenCSS.semantic.color.border}`,
    background: tokenCSS.semantic.color.backgroundSecondary,
    padding: `0 ${tokenCSS.semantic.spacing.lg}`
  };
  
  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: tokenCSS.semantic.spacing.lg,
    overflowY: 'auto'
  };
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'examples', label: 'Examples' },
    { id: 'props', label: 'Props' },
    { id: 'guidelines', label: 'Guidelines' },
    { id: 'accessibility', label: 'Accessibility' }
  ];
  
  const renderOverview = () => (
    <div>
      <h1 style={{ marginBottom: tokenCSS.semantic.spacing.md }}>{currentDoc.name}</h1>
      <p style={{ 
        fontSize: tokenCSS.typography.body.large.fontSize,
        marginBottom: tokenCSS.semantic.spacing.lg,
        color: tokenCSS.semantic.color.textSecondary
      }}>
        {currentDoc.description}
      </p>
      
      <div style={{ marginBottom: tokenCSS.semantic.spacing.lg }}>
        <Card variant="outlined">
          <h3>Quick Example</h3>
        <div style={{
          background: tokenCSS.semantic.color.backgroundSecondary,
          padding: tokenCSS.semantic.spacing.md,
          borderRadius: tokenCSS.semantic.borderRadius.md,
          marginBottom: tokenCSS.semantic.spacing.md
        }}>
          {React.createElement(currentDoc.examples[0].component, currentDoc.examples[0].props)}
        </div>
        <pre style={{ 
          background: tokenCSS.color.gray100,
          padding: tokenCSS.semantic.spacing.sm,
          borderRadius: tokenCSS.semantic.borderRadius.sm,
          fontSize: tokenCSS.typography.body.small.fontSize,
          overflow: 'auto'
        }}>
          {currentDoc.examples[0].code}
        </pre>
        </Card>
      </div>
    </div>
  );
  
  const renderExamples = () => (
    <div>
      <h2 style={{ marginBottom: tokenCSS.semantic.spacing.lg }}>Examples</h2>
      {currentDoc.examples.map((example, index) => (
        <div key={index} style={{ marginBottom: tokenCSS.semantic.spacing.lg }}>
          <Card variant="outlined">
          <h3>{example.title}</h3>
          <p style={{ color: tokenCSS.semantic.color.textSecondary, marginBottom: tokenCSS.semantic.spacing.md }}>
            {example.description}
          </p>
          
          <div style={{
            background: tokenCSS.semantic.color.backgroundSecondary,
            padding: tokenCSS.semantic.spacing.lg,
            borderRadius: tokenCSS.semantic.borderRadius.md,
            marginBottom: tokenCSS.semantic.spacing.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80px'
          }}>
            {React.createElement(example.component, example.props)}
          </div>
          
          <pre style={{ 
            background: tokenCSS.color.gray100,
            padding: tokenCSS.semantic.spacing.md,
            borderRadius: tokenCSS.semantic.borderRadius.sm,
            fontSize: tokenCSS.typography.body.small.fontSize,
            overflow: 'auto',
            margin: 0
          }}>
            {example.code}
          </pre>
          </Card>
        </div>
      ))}
    </div>
  );
  
  const renderProps = () => (
    <div>
      <h2 style={{ marginBottom: tokenCSS.semantic.spacing.lg }}>Props API</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%',
          borderCollapse: 'collapse',
          background: tokenCSS.semantic.color.backgroundPrimary
        }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${tokenCSS.semantic.color.border}` }}>
              <th style={{ 
                padding: tokenCSS.semantic.spacing.md,
                textAlign: 'left',
                fontWeight: tokenCSS.typography.heading.fontWeight
              }}>
                Name
              </th>
              <th style={{ 
                padding: tokenCSS.semantic.spacing.md,
                textAlign: 'left',
                fontWeight: tokenCSS.typography.heading.fontWeight
              }}>
                Type
              </th>
              <th style={{ 
                padding: tokenCSS.semantic.spacing.md,
                textAlign: 'left',
                fontWeight: tokenCSS.typography.heading.fontWeight
              }}>
                Default
              </th>
              <th style={{ 
                padding: tokenCSS.semantic.spacing.md,
                textAlign: 'left',
                fontWeight: tokenCSS.typography.heading.fontWeight
              }}>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {currentDoc.props.map((prop, index) => (
              <tr key={prop.name} style={{ 
                borderBottom: `1px solid ${tokenCSS.semantic.color.border}`,
                background: index % 2 === 0 ? 'transparent' : tokenCSS.color.gray50
              }}>
                <td style={{ 
                  padding: tokenCSS.semantic.spacing.md,
                  fontFamily: 'monospace',
                  fontSize: tokenCSS.typography.body.small.fontSize
                }}>
                  {prop.name}
                  {prop.required && (
                    <span style={{ color: tokenCSS.semantic.color.error, marginLeft: '4px' }}>*</span>
                  )}
                </td>
                <td style={{ 
                  padding: tokenCSS.semantic.spacing.md,
                  fontFamily: 'monospace',
                  fontSize: tokenCSS.typography.body.small.fontSize,
                  color: tokenCSS.semantic.color.textSecondary
                }}>
                  {prop.type}
                </td>
                <td style={{ 
                  padding: tokenCSS.semantic.spacing.md,
                  fontFamily: 'monospace',
                  fontSize: tokenCSS.typography.body.small.fontSize
                }}>
                  {prop.defaultValue !== undefined ? String(prop.defaultValue) : '-'}
                </td>
                <td style={{ padding: tokenCSS.semantic.spacing.md }}>
                  {prop.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const renderGuidelines = () => (
    <div>
      <h2 style={{ marginBottom: tokenCSS.semantic.spacing.lg }}>Design Guidelines</h2>
      <ul style={{ 
        listStyle: 'none',
        padding: 0,
        margin: 0
      }}>
        {currentDoc.designGuidelines.map((guideline, index) => (
          <li key={index} style={{ 
            padding: tokenCSS.semantic.spacing.md,
            marginBottom: tokenCSS.semantic.spacing.sm,
            background: tokenCSS.semantic.color.backgroundSecondary,
            borderRadius: tokenCSS.semantic.borderRadius.md,
            borderLeft: `4px solid ${tokenCSS.semantic.color.primary}`
          }}>
            {guideline}
          </li>
        ))}
      </ul>
    </div>
  );
  
  const renderAccessibility = () => (
    <div>
      <h2 style={{ marginBottom: tokenCSS.semantic.spacing.lg }}>Accessibility</h2>
      
      <div style={{ marginBottom: tokenCSS.semantic.spacing.lg }}><Card variant="outlined">
        <h3>ARIA Support</h3>
        <ul>
          {currentDoc.accessibility.ariaSupport.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Card></div>

      <div style={{ marginBottom: tokenCSS.semantic.spacing.lg }}><Card variant="outlined">
        <h3>Keyboard Support</h3>
        <ul>
          {currentDoc.accessibility.keyboardSupport.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Card></div>

      <div style={{ marginBottom: tokenCSS.semantic.spacing.lg }}><Card variant="outlined">
        <h3>WCAG Compliance</h3>
        <ul>
          {currentDoc.accessibility.wcagCompliance.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Card></div>

      <div>
        <Card variant="outlined">
        <h3>Recommendations</h3>
        <ul>
          {currentDoc.accessibility.recommendations.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Card>
      </div>
    </div>
  );
  
  const renderContent = () => {
    switch (selectedTab) {
      case 'overview': return renderOverview();
      case 'examples': return renderExamples();
      case 'props': return renderProps();
      case 'guidelines': return renderGuidelines();
      case 'accessibility': return renderAccessibility();
      default: return renderOverview();
    }
  };
  
  return (
    <div style={containerStyle}>
      <div style={sidebarStyle}>
        <h2 style={{ marginBottom: tokenCSS.semantic.spacing.lg }}>Components</h2>
        {componentDocs.map(doc => (
          <button
            key={doc.name}
            onClick={() => setSelectedComponent(doc.name)}
            style={{
              display: 'block',
              width: '100%',
              padding: tokenCSS.semantic.spacing.md,
              margin: `0 0 ${tokenCSS.semantic.spacing.xs} 0`,
              background: selectedComponent === doc.name 
                ? tokenCSS.semantic.color.primary 
                : 'transparent',
              color: selectedComponent === doc.name 
                ? tokenCSS.color.white 
                : tokenCSS.semantic.color.textPrimary,
              border: 'none',
              borderRadius: tokenCSS.semantic.borderRadius.md,
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: tokenCSS.typography.body.fontSize
            }}
          >
            {doc.name}
          </button>
        ))}
      </div>
      
      <div style={mainStyle}>
        <div style={tabBarStyle}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              style={{
                padding: `${tokenCSS.semantic.spacing.md} ${tokenCSS.semantic.spacing.lg}`,
                background: 'none',
                border: 'none',
                borderBottom: selectedTab === tab.id 
                  ? `2px solid ${tokenCSS.semantic.color.primary}` 
                  : '2px solid transparent',
                color: selectedTab === tab.id 
                  ? tokenCSS.semantic.color.primary 
                  : tokenCSS.semantic.color.textSecondary,
                cursor: 'pointer',
                fontSize: tokenCSS.typography.body.fontSize,
                fontWeight: selectedTab === tab.id 
                  ? tokenCSS.typography.body.fontWeight.medium 
                  : tokenCSS.typography.body.fontWeight.normal
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div style={contentStyle}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ComponentDocumentationPortal;