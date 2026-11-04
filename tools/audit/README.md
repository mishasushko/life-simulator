# Era audit

Plays one life per country per start year in Chromium (Playwright) and dumps every text, then flags inconsistencies.

    python3 -m http.server 8765 &            # from repo root
    OUT=/tmp/audit node tools/audit/world-run.cjs 2026,1970 60   # years, years to live
    node tools/audit/analyze.cjs /tmp/audit                      # reads world*.json

The analyzer flags anachronisms (keyword → first year), USSR/ruble/hryvnia mismatches, same-sex parents, child work/marriage, undefined/NaN, gender placeholders, pregnant male players and female conscripts. News lines (📰) about inventions are expected hits.
