# 0012. Rationale: Netlify badge off, plus a daily live check

> Update 2026-10-31: the badge switch turned out to need a paid plan on this account, so Option 1's switch was not available and the fallback (move host) applied; see spec 0013. The reasoning for the daily live check below still stands.

## Context

The site went live on Netlify Free (spec 0001) on 2026-10-31. Netlify serves every production page with an extra tag the build never wrote: `<script async src="/.netlify/scripts/hud?variant=public" … data-account-tier="free">`. It draws a fixed "Powered by Netlify" badge inside a `srcdoc` iframe, 216×92 in the bottom right corner at `z-index` 2147483645. Netlify turned it on by default for Free projects created from 2026-08-19, and rolled it out gradually to older ones, so nothing in the repo announced it.

The site's CSP has no `'unsafe-inline'` in `script-src`, so the badge cannot draw. Its empty wrapper still covers the corner and catches taps: at 390px it covers the right half of a full width "Book a Free Call" button whenever that button scrolls there. The console shows a CSP error, which fails a launch check. The badge script can also write a `localStorage` key (`nl-hud:public:v1`), which would break the site's "no storage" promise (spec 0010 AC-6) if it ever ran.

Forces from Abed: no host branding on the page, a $0 monthly budget, and a host move acceptable only if it stays simple. The site has no logins or personal data, so the CSP's strictness is a cheap, deliberate defence worth keeping. An injection like this arrives silently, so whatever fixes it today says nothing about next month.

## Options considered

### Option 1: Switch the badge off, add a daily live check (chosen)

Use Netlify's documented per project switch, effective on the next request. Add a scheduled GitHub Actions job that compares the live HTML's scripts and iframes with a fresh production build.

**Pros**: $0, no code change to the page, CSP stays strict; the guard catches any future injection, not just this badge, and also flags a live site lagging `main`.
**Cons**: depends on a host setting that defaults to on; scheduled workflows pause after 60 days of repo inactivity.

### Option 2: Allow the badge (add `'unsafe-inline'` or a hash to the CSP)

Let the badge render as Netlify intends.

**Pros**: zero friction with Netlify; nothing to maintain beyond a hash.
**Cons**: shows host branding Abed ruled out; `'unsafe-inline'` weakens the CSP for the whole site; a hash breaks whenever Netlify updates the inline script (no documented hash); the badge stores a `localStorage` key.

### Option 3: Hide it with the site's own CSS

Target Netlify's wrapper element and set `display: none`.

**Pros**: works even if the switch disappears.
**Cons**: relies on undocumented markup that can change any time; works against the host's intent, an uneasy footing on a free plan; the script still loads.

### Option 4: Move to another free static host now

Leave Netlify for a host that injects nothing.

**Pros**: removes the dependency on a Netlify setting.
**Cons**: redoes DNS, headers, previews, and the CSP setup a day after launch, to solve a problem one documented switch already solves.

Paid Netlify Personal ($9 a month, badge off by default) was ruled out by the $0 budget.

## Rationale

The real defect is the invisible overlay over the booking button, and Netlify's own switch removes it at the source for $0, which fits every force Abed set. Allowing the badge (Option 2) fails the no branding rule and trades away the CSP. Hiding it (Option 3) is fragile, and moving host now (Option 4) spends a migration on a solved problem; both stay as the documented fallback trigger instead.

The badge arrived silently, so the switch alone leaves the next surprise to be found by a visitor. Comparing against a fresh production build, rather than a fixed allowlist, means the guard needs no upkeep as features add scripts, and it catches any injection, not just Netlify's. Running daily rather than on push keeps it independent of deploy timing and cheap in Actions minutes.

## References

**Project sources**:
- Spec 0001: Netlify Free as host, `netlify.toml` security headers
- Spec 0010: no cookies or storage (AC-6), Umami as the only third party script
- `.github/workflows/ci.yml`: the setup steps the live check reuses
- Live check run on 2026-10-31 (headless Chrome against abedautomation.com): badge iframe present, CSP error, `elementFromPoint` in the corner hits the badge wrapper

**Practices & standards**:
- Strict CSP without `'unsafe-inline'`
- Synthetic monitoring: check production on a schedule, compare against a known good build

**Links**:
- Netlify docs, Powered by Netlify badge (switch path, Free default from 2026-08-19, CSP note): https://docs.netlify.com/manage/projects/powered-by-netlify-badge/
- Netlify pre-launch toolbar (separate feature): https://docs.netlify.com/manage/projects/pre-launch-toolbar/
- Netlify pricing (Free $0, Personal $9, Pro $20): https://www.netlify.com/pricing/
- Netlify terms of use (no badge or commercial use wording found): https://www.netlify.com/legal/terms-of-use/
