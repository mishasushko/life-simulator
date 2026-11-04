# Era audit

Plays one life per country per start year in Chromium (Playwright) and dumps every text, then flags inconsistencies.

    python3 -m http.server 8765 &            # from repo root
    OUT=/tmp/audit node tools/audit/world-run.cjs 2026,1970 60   # years, years to live
    node tools/audit/analyze.cjs /tmp/audit                      # reads world*.json

The analyzer flags anachronisms (keyword → first year), USSR/ruble/hryvnia mismatches, same-sex parents, child work/marriage, undefined/NaN, gender placeholders, pregnant male players and female conscripts. News lines (📰) about inventions are expected hits.

The same rules (`rules.cjs`) run in CI without a browser: `tests/era-audit.test.cjs` plays a seeded sample of lives in Node (`tests/lib/play.cjs`). Hard findings (anachronisms outside news lines, undefined/NaN, gender placeholders, pregnant men, child marriage, etc.) fail the build. `AUDIT=full node --test tests/era-audit.test.cjs` plays every country.
