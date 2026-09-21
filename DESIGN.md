# FirstDay.zip visual design

## Direction

Reference-driven product UI for first-time staff using a phone in a brightly lit store. Light lavender canvas, white rounded surfaces, cyan primary identity; original dimensional illustrations and no official brand assets.

## Palette

Canvas #f5f5fb; surface #ffffff; ink #202731; secondary #747a87; primary cyan #02bfd3, text/link dark teal #006b79; cyan tint #d9f8fb; mint #d6f8e8; warm yellow #fff0bf. Main banners may use large cyan color areas while working screens use a restrained accent. White/neutral surface choices explicitly follow supplied app reference.

## Type and geometry

Bundled Noto Sans KR variable font (100–900) via `next/font/local`, bold24–36px headings,14–16px body,12px supplementary labels. Main cards24–32px radii, controls12–16px, soft low-opacity shadows.44px minimum targets. One clear action per section.

The local WOFF2 is1,247,860bytes and includes all11,172 modern Hangul syllables, Latin, Jamo and common punctuation. It is a FontTools/Brotli subset of the official Google Fonts Noto Sans KR release, licensed under SIL Open Font License1.1. The verbatim license, official source URL, hashes and retained Unicode ranges are recorded in `src/app/fonts/OFL-NotoSansKR.txt` and `src/app/fonts/README.md`. Other scripts can use fallback. Font loading needs no external service. This removes the observed host-dependent mix of Arial/Arial Black with Malgun Gothic rather than assuming every device has the same Korean font.

## Navigation

Desktop header plus contextual tabs. Mobile persistent bottom bar: home, Q&A, central simulator action, checklist, records. Only one visible set of crew route links at a time. The bar respects safe-area padding and reserves bottom space.

## Motion and graphics

Original rounded dimensional SVG store/clipboard/message/assessment graphics. Cyan cap and uniform, pastel backdrop, soft depth. Short state transitions only; reduced-motion supported. No official logos, real POS asset or copied mascot.

## GStep expansion

The ascending-step G symbol and two-tone wordmark replace the previous name. The landing hero leads with confirmed manual provenance and offers a distinct lavender Gemini conversation card. The source page distinguishes 58 collected summaries from 20 missing bodies. AI requests, deterministic checks and demo feedback have distinct labels. Course selection, short-answer inputs and final accuracy/time breakdown keep the same visual controls. Accounts use ID/password without email verification; account and store state must be confirmed before rendering private records.
