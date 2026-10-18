# Narendra Portfolio UI system

A light editorial portfolio based on the latest supplied visual reference. Full-width white backgrounds, pale neutral cards, black action buttons, a yellow experience badge, and a centred 16:9 landscape intro-video frame. Showcase artwork retains its own colours.

## Foundations

- Typography: self-hosted Manrope variable. Display 34-64px; headings 32-48px; titles 20px; body 16px; secondary text 14px; captions 12px. Body line-height 1.6-1.8. Heading tracking is tighter than body tracking.
- Space: 4, 8, 12, 16, 24, 32, 48, 64, 96, 120px. Use smaller gaps within related content and larger gaps between sections.
- Layout: background spans the viewport. Content width is capped at 1280px, with 20-64px responsive internal gutters. Section spacing is 96px on desktop, 64px on tablet, 48px on mobile.
- Colour: background #ffffff; surface #f5f5f2; raised #eeeee9; text #161815; secondary #53574f; muted #64685f; action #191b17; on-action #ffffff; yellow highlight #f4dc3b.
- Shape: 8-9px action controls, 16px cards, 24px large panels. The experience badge and location marker use pill shapes.
- Interaction: primary action uses black; secondary action uses a neutral surface. Minimum action height 48px; utility icon controls 44-48px. Keyboard focus uses a 3px dark outline with a 5px offset.
- Motion: 160ms interaction feedback, 240ms content changes. Review columns keep the requested opposite directions, include pause control, and respect reduced-motion preferences.

## Responsive behaviour

At 960px, navigation uses the menu, supporting layouts stack, and software becomes a four-column grid. At 640px, work becomes one column and work tabs become a two-by-two group; FAQ answers keep readable text sizes. Review columns remain side-by-side as requested.

## Source of truth

`app/design-tokens.css` defines shared foundations. `app/globals.css` applies them to the components. Avoid adding page-specific colours or arbitrary font sizes to ordinary interface controls. The bio card is intentionally dark; text colours inside it are set explicitly. The hero uses a built-in 12-second sample video on a plain background, rather than another person’s portrait. Decorative background panels and the preview metadata row are removed. The wordmark ends with a small dot, and the experience badge reads Video Editing / Design / AI Videos. The About Me metrics use 8+ Tools and 3+ AI tools; the toolkit includes DaVinci Resolve and describes combined AI/video-editing workflows. The redundant Explore selected work link has been removed. The intro frame is borderless to avoid fractional-pixel gaps; the built-in sample uses cover fitting while local video previews retain contain fitting. The intro player is up to 840px wide with a 16:9 aspect ratio and scales to the available mobile width. Its corners use a 32px radius on larger screens and a 24px radius on mobile. The centre play control starts inline video playback; the original intro can be supplied later. The navigation toggle has explicit dark-on-light icon colours, a visible open state, and supports dismissal with Escape or an outside click. Artwork is intentionally separate from interface tokens.

## Guidance used

- IBM Carbon spacing: https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview
- IBM Carbon typography: https://www.carbondesignsystem.com/building-blocks/foundations/typography/type-sets
- W3C target size: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- W3C moving content controls: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html

The specific font, palette, dimensions, and composition are portfolio design decisions. These references guide consistency and usability rather than prescribe this visual style. Token colour checks and a production build are not a full accessibility audit or a substitute for browser visual testing.
