# English dictionary builder

`node tools/i18n/build.js` regenerates `en-data.js` (loaded only when the game language is English).

- `todo2.txt` / `todo2.json` — Russian strings extracted from the game (index|text, `{n}` = dynamic part).
- `tr/NN.txt` — English by index (`index|English`; `¦` separates text segments of HTML strings).
- `tr/extra.txt` — extra pairs keyed by Russian text (`ru|en`, `{n}` placeholders allowed).
- `cities.json` + `cities_en.txt` — city names in the same order.

New Russian strings: add a line to `tr/extra.txt` and rerun the builder.
