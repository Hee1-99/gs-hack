# Bundled Korean font

This app self-hosts a Korean/Latin subset of **Noto Sans KR**, variable weight 100–900. It is loaded through `next/font/local`; visitors do not need an installed Korean font and no Google font requests are made at runtime or build time.

- Official upstream: https://github.com/google/fonts/tree/main/ofl/notosanskr
- Original file: https://raw.githubusercontent.com/google/fonts/main/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf
- License: SIL Open Font License 1.1, retained verbatim in `OFL-NotoSansKR.txt`.
- Copyright: 2014–2021 Adobe; reserved font name `Source` (see the supplied license).
- Retrieved: 2026-09-21.
- Original SHA-256: `194018e6b2b293a7964f037b25c0249ce1418bc9ab3c971060a03aa57861e252`.
- Bundled WOFF2 SHA-256: `7673bda794e5db96dedfdc82d31a4f665ab3b2c044cdc5228d453503b3248a74`.
- Bundled size: 1,247,860 bytes. The 10,414,588-byte original TTF is not shipped.

The original was subset and converted with FontTools and Brotli. All 11,172 modern Hangul syllables, ASCII characters and the variable weight axis were verified in the output. Retained ranges: U+0020–024F, U+1100–11FF, U+2000–206F, U+20A0–20CF, U+2190–21FF, U+3000–303F, U+3130–318F, U+A960–A97F, U+AC00–D7AF, U+D7B0–D7FF and U+FF00–FFEF, where present upstream. This covers Latin, Hangul/Jamo, punctuation, currency and common arrows; other scripts may still use system fallback.

To reproduce, use `fontTools.subset` with these Unicode ranges, `flavor='woff2'`, `layout_features=['*']`, `name_IDs=['*']`, `name_languages=['*']`, `name_legacy=True`, `notdef_glyph=True` and `recommended_glyphs=True`. Font license terms continue to apply to the modified subset.
