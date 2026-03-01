# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast
- Respect reduced motion preferences

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# Login Page Development Prompt

This prompt is designed to be consumed by an AI development tool to build a production-ready Login Page (with supporting authentication flows) within the LuxeFlow CRM context. It enforces runtime safety rules (null/undefined guards, proper array handling, and React state initialization) and aligns with the visual/style system described.

## Overview
Create a secure, visually luxurious Login Page for LuxeFlow CRM with:
- Email/username and password fields (validated with clear error messaging)
- Password visibility toggle
- SSO options (Google, Enterprise SSO placeholder)
- Remember Me functionality
- Links to Sign Up and Password Reset
- Security notices (2FA guidance and authentication warnings)
- Seamless integration with the project's User Authentication & Roles system (Admin, Agent, Ops, Finance)
- Fully wired to the frontend routing and backend authentication endpoints (signup, login, SSO, session management, and role-based access enforcement)
- Consistent styling with the project’s visual system (colors, typography, spacing, cards, navigation)

Note: All generated code must guard against null/undefined values before calling array methods, initialize arrays with useState([]), and apply data-safe patterns per the runtime safety rules provided.

---

## Page Description (Full Detail)

What this page is:
- The Login Page for LuxeFlow CRM, focusing on secure authentication for existing users with multiple sign-in options (email/password, Google SSO, enterprise SSO), plus user experience paths to Sign Up and Password Reset.

Goals:
- Provide a secure, accessible login experience with robust validation, error handling, and accessibility (ARIA roles, keyboard navigation).
- Initiate a user session and load role-based access controls upon successful authentication.
- Present a clear path to password recovery and new user onboarding.
- Present necessary security notices (2FA readiness, risk prompts) without overwhelming the user.

Connected features:
- User Authentication & Roles: Secure login, SSO, session management, and enforcement of role-based access (Admin, Agent, Ops, Finance) after login.
- Password Reset flow is a separate page but linkable from this login.
- Landing Page and Dashboard are downstream experiences after auth; this login page should route accordingly based on authentication state and user role.

UI elements and how they should look:
- Email/Username input: inline validation, clear error messages, helper text.
- Password input: toggle visibility (eye icon) with accessible label.
- SSO buttons: Google Sign-In (primary), Enterprise SSO (secondary/outlined as placeholder).
- Remember Me: checkbox with accessible label.
- Forgot Password: accessible link to the Password Reset flow.
- Sign Up: prominent link to the Sign Up page.
- Security Notices: subtle 2FA information panel (informational only on login page; not forcing 2FA at login).
- Visual guidance: clean card layout, ample whitespace, and consistent typography.

Visual style guidance (applies exactly as described in the UI/UX guidelines section):
- Primary colors: crisp white cards and backgrounds
- Accent: olive green buttons
- Neutrals and text shades as defined
- Typography: Playfair Display or Georgia for headings; Lato/Helvetica Neue for body
- Card design, hover states, dividers, and micro-interactions should be refined and restrained
- Navigation: Sticky header behavior prepared, but since this is a login page, it may be a minimal header or brand area with a clean focus

---

## Components to Build

1) LoginCard (reusable form block)
- Props: onSubmit, loading, error, initialRemember
- Fields:
  - emailOrUsername: string
  - password: string
  - rememberMe: boolean
- State & Validation:
  - emailOrUsername: required, email pattern if email; allow username format if not email
  - password: required, minimum length (e.g., 8)
  - showPassword: boolean (eye toggle)
- UI elements:
  - Text input for email/username with label
  - Password input with visibility toggle
  - Remember Me checkbox
  - Submit button: disabled while loading
  - Inline validation messages
- Accessibility:
  - aria-invalid and aria-describedby for errors
  - keyboard accessible focus order

2) SSOPanel
- Props: onGoogleLogin, onEnterpriseSSO, loading
- UI:
  - Google Sign-In button (primary)
  - Enterprise SSO button (outlined or secondary)
  - Spacing and dividers to separate
- Behavior:
  - Trigger corresponding authentication methods
  - Handle loading/disabled states

3) AuthLinks
- Props: none
- UI:
  - Forgot Password link
  - Sign Up link
- Styling: subtle text with hover underlines or accent color

4) SecurityNotice
- Small informational banner or card that communicates:
  - 2FA readiness, recommended security practices
  - Do not reveal sensitive data; no prompts to enter 2FA here
- Dismissible or non-dismissible per design system

5) PageLayout (Login page wrapper)
- Contains:
  - Brand header or minimal navigation
  - Centered responsive container
  - Layout adapts to mobile and desktop with balanced padding
- Ensure no null/undefined rendering
- Use data-safe patterns when pulling any from API (e.g., from auth state)

---

## Implementation Requirements

### Frontend
- Routing:
  - If user is already authenticated, redirect to /dashboard or role-appropriate default page.
  - On successful login, navigate to a role-aware landing page.
- State management:
  - Local component state for form values with useState
  - Global auth state (token, user, roles) via context or a lightweight state store (e.g., React Context or Zustand) as applicable
- Validation:
  - Client-side validation with real-time feedback
  - Follow the runtime safety rules for array access when handling lists (if any) and safe defaults
- Accessibility:
  - All inputs labeled, keyboard-navigable, screen-reader friendly
- API integration (mocked or real):
  - POST /auth/login with payload { emailOrUsername, password, rememberMe }
  - POST /auth/sso/google and /auth/sso/enterprise for SSO flows
  - On success: store session token, user details, roles; fetch user profile with safe array handling
- Security:
  - Do not expose sensitive data in client
  - CSRF protection for forms as per backend standards
  - Use secure cookies for session storage or token in memory; no localStorage for sensitive tokens if policy requires
- Data handling safeguards:
  - Always guard results with: const data = response?.data ?? []
  - If you process arrays, use (Array.isArray(data) ? data : []).map(...) to avoid runtime errors
  - Destructure with defaults: const { token = '', user = {}, roles = [] } = response ?? {}

### Backend
- Endpoints:
  - POST /auth/login: accepts { emailOrUsername, password, rememberMe }, returns { token, user, roles }
  - POST /auth/logout: invalidate session
  - POST /auth/signup: for new users (not the primary login page but related)
  - POST /auth/sso/google: initiate Google OAuth flow
  - POST /auth/sso/enterprise: initiate Enterprise SSO flow
  - GET /auth/me or /users/me to fetch current user and roles after login
- Data models:
  - User: id, email, username, name, roles: ["Admin","Agent","Ops","Finance"], twoFactorEnabled, etc.
  - Sessions: token, expiresAt, deviceInfo
  - Roles and permissions: per-module access control rules
- Security:
  - Enforce role-based access checks in backend for protected routes
  - Ensure tokens are signed with expiration and rotation policy
  - Validate input strictly and return generic error messages to avoid information disclosure

### Integration
- Frontend-auth flow:
  - Login page calls /auth/login; on success, store token and user context; redirect to /dashboard
  - SSO flows redirect to identity provider and back; on success, same handling as login
  - After login, resolve role-based landing
- Data handling:
  - Use safe defaults for all API responses
  - Guard all array operations with Array.isArray or (data ?? []) as per runtime safety

---

## User Experience Flow

1) User lands on Login Page
2) User enters email/username and password
3) Client validates fields; errors shown inline if invalid
4) User optionally toggles Remember Me
5) User clicks Sign In
   - If credentials valid: backend returns token, user data, roles
   - Frontend stores session, loads user profile, navigates to role-specific dashboard
   - If 2FA is required later, inform user appropriately (seamless next step)
6) User can click Google Sign-In or Enterprise SSO
   - Redirects to identity provider, then back to app with authenticated session
7) User can click Forgot Password
   - Redirect to Password Reset Page (handled separately)
8) User can click Sign Up
   - Redirect to Sign Up page
9) On any error (invalid credentials, network issues), show clear, actionable messages
10) All flows ensure safety: no crash if data is missing; arrays guarded; state initialized properly

---

## Technical Specifications

- Data Models
  - User { id: string, email: string, username?: string, name?: string, roles: string[], twoFactorEnabled?: boolean }
  - Session { token: string, userId: string, expiresAt: string, device?: string }
  - RolePermissions: mapping of role -> allowedRoutes and permissions (example: { Admin: [...], Agent: [...] })
- API Endpoints
  - POST /auth/login
  - POST /auth/logout
  - POST /auth/signup
  - POST /auth/sso/google
  - POST /auth/sso/enterprise
  - GET /auth/me
- Security
  - Use JWT or opaque tokens with expiration
  - Enforce role-based access on protected routes
  - CSRF mitigation for state-changing requests
  - 2FA readiness messaging; backend can indicate if 2FA is configured for user
- Validation Rules
  - Email/Username: required; if email format, validate pattern
  - Password: required; min length 8; enforce strong policy if needed
  - RememberMe: boolean
  - SSO: ensure tokens returned from providers are validated
- Runtime Safety
  - All API response usage uses: const list = Array.isArray(response?.data) ? response.data : []
  - Supabase-like data handling uses: const items = data ?? []
  - Optional chaining for nested data: user?.roles?.includes(...)
  - useState<T[]>([]) initialization for arrays
  - Do not call map/filter/reduce on possibly null values: (items ?? []).map(...)
  - Destructure with defaults: const { token = '', user = {}, roles = [] } = response ?? {}

---

## Acceptance Criteria

- [ ] The Login Page renders with email/username and password fields, password visibility toggle, Remember Me, Google SSO, Enterprise SSO, Forgot Password, and Sign Up links.
- [ ] Client-side validation provides immediate feedback for required fields and invalid formats; errors are accessible and descriptive.
- [ ] On valid credentials, the app stores a session token, loads user context including roles, and redirects to a role-appropriate dashboard. Guards must prevent navigation if authentication fails.
- [ ] SSO flows integrate with backend endpoints; after completion, user is logged in and redirected similarly to standard login.
- [ ] All API responses are handled with null-safe patterns (using data ?? [] or Array.isArray checks as specified).
- [ ] The UI adheres to the project’s visual system (colors, typography, layout, card design, hover states, spacing).
- [ ] Security requirements satisfied: 2FA guidance shown; no leakage of sensitive data; appropriate error handling.
- [ ] Accessibility requirements met: labels, aria attributes, keyboard navigation, focus states.

---

## UI/UX Guidelines

Apply LuxeFlow’s design system and ensure consistency with the rest of the app:
- Color Palette
  - Primary: #FFFFFF for backgrounds and cards
  - Accent: #8A9A5B olive green for primary actions
  - Neutrals: #F6F6F6, #EEEEEE as background zones
  - Text: #222222; secondary #888888
  - Supporting: #C6AB62
- Typography
  - Headings: Playfair Display or Georgia
  - Body: Lato or Helvetica Neue
- Card Design
  - White cards with subtle shadow (e.g., rgba(34,34,34,0.07))
  - 4-8px border radius
  - Light dividers and hover lift
- Interactive Elements
  - Buttons: olive green, white text, medium border radius, generous padding
  - Inputs: white with light gray borders; clear focus state using accent color
  - Micro-interactions: subtle shadows and color shifts on hover/focus
- Navigation
  - Clean header area; sticky behavior if used; accessible nav
- Visual Hierarchy
  - Emphasize the login call-to-action; keep supportive content secondary
- Imagery
  - If using hero imagery on the login page, select warm-toned, luxury photography consistent with branding

---

## Mandatory Coding Standards — Runtime Safety

CRITICAL: Implement in ALL generated code

1) Supabase-like or API results:
   - const items = data ?? []
2) Array methods safety:
   - (Array.isArray(items) ? items.map(...) : [])
   - Or (items ?? []).map(...)
3) React state initialization:
   - useState<Type[]>([]) for arrays; useState<string> or useState<boolean> with sensible defaults for primitive values
4) API responses:
   - const list = Array.isArray(response?.data) ? response.data : []
   - Destructure with defaults: const { token = '', user = {}, roles = [] } = response ?? {}
5) Optional chaining:
   - Use obj?.property?.nested safely
6) Destructuring with defaults:
   - const { items = [], count = 0 } = response ?? {}

---

## Deliverables

- Clean, modular React components (LoginCard, SSOPanel, AuthLinks, SecurityNotice) with proper type definitions (TypeScript preferred) and PropTypes if using JavaScript
- A Login Page composed from the components above, wired to the backend authentication endpoints
- API utility layer with safe response handling and error management
- Comprehensive comments and documentation within code for maintainability
- Tests (unit/integration) that cover:
  - Form validation, error messaging
  - Successful login flow path
  - Handling of null/undefined API responses
  - SSO flow invocation (mocked)
- Visual consistency with the design guidelines and accessibility checks

---

If you need this prompt adapted to a specific framework (e.g., Next.js, React with Redux, Vue, or Svelte), or you want a full code scaffold (folders, file structure, and example files), I can tailor the prompt accordingly.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
