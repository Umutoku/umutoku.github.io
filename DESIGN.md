---
name: Umut Oku — Systems Workshop
description: A graphite and amber console for a precise, approachable engineering portfolio.
colors:
  paper: "oklch(17% 0.008 250)"
  paper-2: "oklch(21% 0.009 250)"
  paper-3: "oklch(13.5% 0.007 250)"
  ink: "oklch(95% 0.005 250)"
  ink-2: "oklch(83% 0.008 250)"
  muted: "oklch(71% 0.01 250)"
  rule: "oklch(31% 0.01 250)"
  rule-2: "oklch(42% 0.012 250)"
  accent: "oklch(82% 0.15 80)"
  accent-ink: "oklch(18% 0.04 75)"
  focus: "oklch(82% 0.15 80)"
  clear: "transparent"
typography:
  display:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.2vw, 5rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 2.5vw + 1rem, 3.5rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 0.75vw + 0.875rem, 1.625rem)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
  trace-index:
    fontFamily: "ui-monospace, Cascadia Code, Consolas, monospace"
    fontSize: "12px"
    fontWeight: 400
rounded:
  flat: "0"
  control: "4px"
  pill: "6px"
spacing:
  zero: "0"
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  button: "20px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
  3xl: "96px"
  section: "128px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "{colors.clear}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-secondary-hover:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px"
    width: "100%"
  filter:
    backgroundColor: "{colors.clear}"
    textColor: "{colors.muted}"
    rounded: "{rounded.flat}"
    padding: "12px 0"
  filter-active:
    textColor: "{colors.accent}"
  navigation:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
  knowledge-track:
    textColor: "{colors.ink}"
    rounded: "{rounded.flat}"
    padding: "24px 0 0"
  domain-node:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.flat}"
    padding: "16px"
    width: "100%"
  domain-node-selected:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.accent}"
  metric:
    textColor: "{colors.ink}"
    rounded: "{rounded.flat}"
    padding: "24px 24px 24px 0"
---

# Design System: Umut Oku — Systems Workshop

## Overview

**Creative North Star: "Systems Workshop"**

A dark console makes engineering relationships tangible through readable type, fine dividers and direct interaction. Graphite is the working surface; amber identifies a choice, an action or the current step. The interface itself supplies the illustration.

Large, restrained headings give way to compact, inspectable rows. English and Turkish share the same visual hierarchy, with flexible widths and wrapping. The system is recorded from the completed code-led build; there is no approved image composition to reproduce.

**Key Characteristics:**
- Graphite surfaces with amber interaction cues.
- Host Grotesk headings and body text, with monospace trace indices.
- Flat, ruled groups rather than floating panels.
- Responsive domain grids and explicit selected states.
- Short, optional motion with visible keyboard focus.

## Colors

Low-chroma graphite neutrals keep long technical text calm; a warm amber supplies the primary interaction voice. The frontmatter preserves the source's normative OKLCH values.

### Primary
- **Signal Amber** (`accent`): primary actions, selected domains, active filters, current trace steps, highlighted visit timing and the identity mark.
- **Dark Amber Ink** (`accent-ink`): text on filled amber actions.
- **Amber Focus** (`focus`): keyboard outlines; deliberately matches the action accent.

### Neutral
- **Graphite Canvas** (`paper`): page, header and resting domain surfaces.
- **Raised Graphite** (`paper-2`): selected or hovered domain nodes, the demonstration section, fields and secondary-button hover.
- **Deep Graphite** (`paper-3`): broad contact-section contrast.
- **Soft White** (`ink`): principal text and the primary-button hover surface.
- **Secondary Ink** (`ink-2`): supporting technical content and role text.
- **Readable Graphite Grey** (`muted`): descriptions, dates and inactive controls.
- **Fine Rule / Strong Rule** (`rule`, `rule-2`): rows, section boundaries and control borders.
- **Clear** (`clear`): unfilled controls and inactive underline borders; transparency is structural, not an additional accent.

**The Selection Rule.** Amber accompanies a visible action or state; selected filters also gain an underline and selected domains gain a surface change.

## Typography

**Display Font:** Host Grotesk with ui-sans-serif, system-ui and sans-serif fallbacks.
**Body Font:** The same locally supplied family, using regular, medium and semibold files.
**Label/Mono Font:** Native monospace with Cascadia Code and Consolas fallbacks for trace indices.

The family is broad and readable, with medium-weight display text and tight heading tracking. It keeps narrative and engineering detail in one voice; monospace is a small functional exception.

### Hierarchy
- **Display:** the frontmatter role describes the final hero override. At narrow widths (520px and below), its size becomes `clamp(2rem, 8.7vw, 2.8rem)`; the line measure is capped at 23ch.
- **Headline:** fluid section headings use the recorded headline role; the general measure is capped at 30ch.
- **Title:** the general third-level role is supplemented by knowledge-track titles (24px, line height 1.25) and work-row titles (`clamp(1.75rem, 2.5vw, 2.5rem)`, line height 1.15).
- **Body:** the recorded body role is the baseline. Plain paragraphs cap at 65ch; supporting interface text commonly uses 13–15px. Lead text has a looser measure and a line height of 1.45.
- **Label:** medium-weight sentence-case action text. Filters use regular weight; labels are not decorative section eyebrows.
- **Trace index:** compact monospace numbers. Dashboard figures use the body family at a larger scale.

## Layout

The page uses a centered container (1480px maximum) with gutters of 64px, 40px at 1100px and below, 24px at 800px and below, and 20px at 520px and below. Section padding changes from 128px to 96px at 900px and 72px at 640px. Internal rhythm mainly uses the recorded 8–40px spacing steps.

The hero pairs a large statement with supporting copy before becoming one column at 800px. The domain landscape has four columns, then two at 800px; it retains full text labels and does not depict a sequential arrow flow. Knowledge tracks and featured learning records use three columns, two at 1000px, and one at 640px. Dashboard metrics use four columns, then two at 800px. The chart below becomes one column at the same breakpoint.

Work examples are expandable ruled rows. The title and outcome occupy the leading column; technical context and an expand affordance occupy the remainder. At 900px the context column is hidden. The title-to-outcome row gap is 16px. Experience, demonstration and contact sections collapse to one column at 640px. The experience introduction is sticky on wider screens and static on mobile.

## Elevation & Depth

The implemented surfaces use no shadows. Depth comes from graphite tone changes, one-pixel rules and clear spacing. A selected domain is brighter than the canvas; the demonstration area is brighter and the contact area is darker. Hover does not introduce a floating-card effect.

**The Flat Surface Rule.** Use surface tone and dividers for grouping; retain the build's shadow-free material.

## Shapes

Most content is square and open, separated by fine horizontal rules. Buttons have compact rounded corners using the `pill` token, despite that token's name; they are not capsule-shaped. Fields and the language switch use the smaller `control` radius. No active content card requires the unused card-radius token.

Interface icons are inline outline SVGs with rounded stroke caps and joins. Standard icons use a 24px box and a 1.5px stroke. Domain icons are larger on desktop and reduce with the mobile landscape. Numeric indicators and labels remain text.

## Components

### Buttons

Compact, deliberate actions use at least 48px height, a thin border and the recorded primary or secondary variant. Primary hover becomes soft white with dark text; secondary hover gains a graphite surface. Pressing shifts the button down by 1px. Background transitions use 120ms with the recorded ease-out curve. Disabled controls reduce opacity to .55 and change the cursor.

Keyboard focus uses a 2px amber outline with 2px offset throughout the interface. Domain buttons increase the offset to 4px. Text links retain underlines or a clear navigation context.

### Filters / Scenario Selectors

Unfilled, sentence-case selectors have a minimum height of 44px. Their active state combines amber text and an amber bottom rule; hover brightens inactive text. The controls wrap instead of truncating. Selection is also exposed through `aria-pressed`.

### Cards / Containers

Knowledge tracks and credential features are open, square sections with a top rule and generous separation. Track content starts 24px below its divider; the heading leads technical and explanatory paragraphs. Work examples use native expandable details with an outline SVG affordance. These patterns do not use floating card shells.

### Inputs / Fields

Credential search and category selection use a raised graphite fill, strong-rule border, compact control radius and minimum height of 48px. Labels sit above fields and remain visible. Placeholder text uses the muted neutral; keyboard focus follows the global amber outline. No dedicated field-error styling is established by the current build.

### Navigation

A full-width graphite header sits on a thin bottom rule. Text links are muted at rest and amber on hover. The identity mark is amber. Desktop navigation switches to an explicit menu button and stacked links at 800px; the button's expanded state is announced. Escape closes the menu and returns focus to its control. The language switch stays a small bordered control with a minimum 44px target.

### Domain Landscape

Selectable domain tiles form a shared ruled matrix, with an outline icon, title and small technical sublabel. Selection changes the tile's surface, text and icon, and updates an adjacent description announced politely to assistive technology. The matrix is a capability explorer, not a sequential architecture diagram. Mobile keeps two columns with smaller icons and labels.

### Metrics / Learning Bars

Metrics form a flat ruled strip with large values and quieter labels. The highlighted browser timing shares the amber action accent. Learning bars are native meters with square ends and an 8px height, using a graphite track and amber fill. Text labels and counts remain alongside the meters.

### Motion

Entry motion is a brief opacity and 12px vertical translation over 420ms; the landscape starts 100ms later. A current trace step moves 8px horizontally over 650ms during playback. Reduced-motion preferences suppress these animations and remove the replay delay. Motion is a response to entry or a deliberate interaction, not a continuously running background.

## Do's and Don'ts

### Do:
- **Do** preserve the graphite canvas, amber state cues and Host Grotesk hierarchy.
- **Do** use ruled groups and tonal surfaces to separate technical information.
- **Do** retain visible focus, text labels and a second visual cue for selected controls.
- **Do** allow English and Turkish content to wrap within responsive layouts.
- **Do** keep reduced-motion and no-JavaScript reading paths meaningful.

### Don't:
- **Don't** add floating shadows to the established flat surface vocabulary.
- **Don't** replace the domain landscape with a sequential mobile arrow flow.
- **Don't** turn repository showcase styles left in the stylesheet into a public component pattern.
- **Don't** introduce decorative eyebrows or glyph icons as house styles.
- **Don't** treat unused color or radius declarations as established visual decisions.
