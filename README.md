# OG Pro - Premium Edition

Userscript (Tampermonkey / Violentmonkey) that automatically posts "bump" messages to threads on `oguser.com`, either on a global cycle (**BUMPS**) or through named folders of links (**EVENT ENGINE**). It includes a red-themed control panel, license gating, a Discord webhook integration, captcha/Cloudflare detection with manual resume, 404 link removal, import/export, shuffle, and an in-panel updater.

- **Version:** 14.0
- **Match:** `https://oguser.com/*`
- **Top frame only:** the script exits early when running inside an iframe (`window.top !== window.self`). Bump requests are opened in hidden iframes by the script itself; those iframes never run the UI.
- **Storage:** all state is kept with `GM_setValue` / `GM_getValue` under keys prefixed `OG_PRO_`.
- **Permissions:** `GM_setValue`, `GM_getValue`, `GM_xmlhttpRequest`, `GM_info`. Allowed `@connect` hosts: `discord.com`, `discordapp.com`, `raw.githubusercontent.com`.
- **External resources:** Font Awesome 6.5.1 CSS from `cdnjs.cloudflare.com`. If the site's Content Security Policy blocks that domain, icons will not render.

---

## Table of contents

1. [Architecture overview](#architecture-overview)
2. [Configuration constants](#configuration-constants)
3. [Section 0 - Font Awesome and icons](#section-0--font-awesome-and-icons)
4. [Section 0b - Authentication (`Auth`)](#section-0b--authentication-auth)
5. [Section 1 - Global state (`State`)](#section-1--global-state-state)
6. [Section 2 - Internationalization (`i18n`)](#section-2--internationalization-i18n)
7. [Section 3 - Utilities (`Utils`)](#section-3--utilities-utils)
8. [Section 3b - Updater (`Updater`)](#section-3b--updater-updater)
9. [Section 3c - Removals (`Removals`)](#section-3c--removals-removals)
10. [Section 3d - Import / export (`Transfer`)](#section-3d--import--export-transfer)
11. [Section 3e - Timing (`Delay`)](#section-3e--timing-delay)
12. [Section 4 - User interface (`UI`)](#section-4--user-interface-ui)
13. [Section 5 - Event handling (`Events`)](#section-5--event-handling-events)
14. [Section 6 - Bot engine (`Bot`)](#section-6--bot-engine-bot)
15. [Section 7 - Main loop](#section-7--main-loop)
16. [Data model](#data-model)
17. [Lifecycle: from install to first bump](#lifecycle-from-install-to-first-bump)
18. [Known limitations](#known-limitations)

---

## Architecture overview

The script is a single IIFE with these modules, executed in this order:

| Module | Responsibility |
|---|---|
| `FA` / `Icon` | Maps semantic icon names to Font Awesome classes |
| `Auth` | License screen and license validation |
| `State` | In-memory state, persisted with `GM_*` storage |
| `i18n` | Text dictionary (English, Spanish, Russian) |
| `Utils` | Time parsing, URL validation, escaping, shuffling |
| `Updater` | Polls GitHub for a newer `@version` |
| `Removals` | Hides specific page elements (bats, spider webs) via a MutationObserver |
| `Transfer` | JSON import and export of link lists |
| `Delay` | Timing editor: cycle interval and min/max delay between links |
| `UI` | Renders the floating button, panel, and all tabs |
| `Events` | Single delegated click/input/change handler for the panel |
| `Bot` | Queue processing, iframe injection, block detection, webhooks, pause/resume |
| `buildCycle`, `StartLoop` | Creates cycle queues on schedule every second |
| `InitApp` | Boots everything after authentication |

Execution starts at the bottom: `Auth.check()`.

---

## Configuration constants

### `MIN_SMOOTH_MS = 30000`
Hard minimum (30 seconds) for the delay between two consecutive links. It is enforced in `Delay.normalize`, `Delay.commit`, and `Bot.smoothRange`, so it cannot be bypassed by typing a smaller value.

### `FA_CSS`
URL of the Font Awesome 6.5.1 stylesheet loaded by `loadFontAwesome`.

---

## Section 0 - Font Awesome and icons

### `loadFontAwesome()`
Injects a `<link rel="stylesheet">` pointing to `FA_CSS` into `<head>`. It sets `data-ogpro-fa="1"` and checks for that attribute first, so the stylesheet is never added twice. It runs once when the script starts.

### `FA` (object)
Maps semantic names used across the UI to Font Awesome class strings, for example `skull → "fa-solid fa-skull"` or `discord → "fa-brands fa-discord"`. Changing an icon anywhere in the UI means editing one entry here.

### `Icon(name, cls = '')`
Returns an `<i>` element string: `<i class="{FA[name]} og-ico {cls}" aria-hidden="true"></i>`. Returns `undefined` text if `name` does not exist in `FA`, so always use a key from `FA`.

---

## Section 0b - Authentication (`Auth`)

Access is controlled by a license key. The valid keys are stored as a JSON array in a GitHub file (`Auth.URL`), so keys can be added or revoked remotely.

### `Auth.URL`
Raw GitHub URL of the JSON array of valid keys.

### `Auth.GET_KEY_URL`
Discord invite shown in the "Get Key" button.

### `Auth.showScreen()`
Builds the full-screen license overlay:
1. Injects its own CSS (`#ogpro-auth-container` scope) with spin, fade, shake, and glow animations.
2. Creates the card: logo, subtitle, a text input (`#ogp-key`), a "Verify License" button (`#ogp-btn`), a "Get Key" link, and a message line (`#ogp-msg`).
3. Defines local helpers:
   - `setMsg(text, ok)` shows a status line, green if `ok` is true, red otherwise.
   - `shakeInput()` replays the shake animation on the input.
   - `setLoading(on)` swaps the button label and spinner.
4. `verify()` runs on button click or Enter:
   - Empty input → shake and show "Introduce una key".
   - Otherwise it requests `Auth.URL` with `GM_xmlhttpRequest`. If the parsed array includes the key, it stores the key in `OG_PRO_AUTH`, fades out the overlay, removes it, and calls `InitApp()`. If not, it shows "Invalid or expired key." If the response cannot be parsed, it shows "Error connecting to server." A network failure shows "Network Error."
5. Focuses the input 350 ms after rendering.

### `Auth.check()`
Entry point of the authentication flow:
- If `OG_PRO_AUTH` holds a key, it calls `InitApp()` immediately so the UI is usable, then re-validates the key against `Auth.URL` in the background. If the key is no longer in the list (HTTP 200 only), it clears `OG_PRO_AUTH` and reloads the page.
- If no key is stored, it calls `showScreen()`.

---

## Section 1 - Global state (`State`)

A single object holds all runtime and persisted values.

### Fields

| Field | Default | Purpose |
|---|---|---|
| `count` | `1` | Global bump counter used in `{count}` placeholders |
| `bumpMsg` | `'grinding x{count}'` | Message template for BUMPS |
| `awardNotifierActive` | `false` | Whether the award scanner is enabled |
| `lastCheckedAwardTime` | `Date.now()` | Timestamp of the last award scan |
| `currentLang` | `'en'` | Active language: `en`, `es`, or `ru` |
| `theme` | dark red palette | Colors: `bg`, `sidebar`, `stroke`, `accent`, `text` |
| `cfg` | see below | Timing and webhook settings |
| `data` | see [Data model](#data-model) | Bumps, events, activity flags, schedules, completions, pause state |
| `shuffle` | `{bumps:false, events:{}}` | Shuffle flags |
| `removals` | `{bats:false, spider:false}` | Removal toggles |
| `queue` | `[]` | Pending injections, each `{type, url, name, folderId?}` |
| `isProcessing` | `false` | True while an injection or a delay is in progress |
| `delayEndTime` | `0` | Epoch ms when the current inter-link delay ends |
| `delayTotal` | `0` | Length in ms of the current delay, used by the progress bar |
| `botStatusMsg` | `'System IDLE. Ready to inject.'` | Text shown in the Bot tab status box |
| `currentTab` / `currentTabLinks` | `'links'` / `'bumps'` | Active tab and sub-tab |
| `isPanelOpen` | `false` | Whether the panel is visible |
| `activeIframe` | `null` | The hidden iframe currently being processed |
| `updateAvailable` / `updateDismissed` | `null` / `false` | Updater state |

`cfg` defaults: `bumpCycle: '60m'`, `bumpMin: '30s'`, `bumpMax: '60s'`, `eventCycle: '60m'`, `eventMin: '30s'`, `eventMax: '60s'`, `webhook: ''`.

### `State.load()`
Reads every `OG_PRO_*` key with `GM_getValue`. Objects (`theme`, `cfg`, `data`, `shuffle`, `removals`) are merged over their defaults with `Object.assign`, so newly added fields survive upgrades.

### `State.save()`
Writes every persisted field back with `GM_setValue`. Called after nearly every state change.

### `State.isRunning()`
Returns `true` if the global BUMPS switch or any event folder is active.

### `State.anyEventActive()`
Returns `true` if at least one event folder is active. Used to enforce the rule that BUMPS and events cannot run together.

### `State.runState()`
Returns `'paused'` if `data.pause` is set, otherwise `'running'` if `isRunning()`, otherwise `'idle'`. The UI uses this to pick colors and labels.

---

## Section 2 - Internationalization (`i18n`)

### `i18n.dict`
Three dictionaries (`en`, `es`, `ru`) with identical keys. Notable keys:
- Timing: `cycleLabel`, `smoothMin`, `smoothMax`, `minNote`, `estimate`.
- Status: `running`, `idle`, `paused`, `ready`.
- Warnings: `timeWarning` (with `{rec}` placeholder), `conflict`, `bumpsEmpty`, `eventEmpty`.
- Pause: `pauseTitle`, `pauseMsg` (with `{kind}`), `resumeBtn`, `resumed`, `popupBlocked`, `kindCaptcha`, `kindCloudflare`.
- Import/export messages with `{n}` placeholders.

### `i18n.t(key)`
Returns the string for `key` in the current language, falls back to English if missing, and returns the key itself if it does not exist in English either.

---

## Section 3 - Utilities (`Utils`)

### `Utils.parseTimeToMs(str)`
Converts strings like `"30s"`, `"5m"`, `"2h"` to milliseconds. A plain number is read as minutes. Returns `60000` (one minute) for empty or unparseable input.

### `Utils.msToStr(ms)`
Rounds milliseconds up to whole minutes and formats as `"Nm"`. Above 60 minutes it returns `"Nh"`. Used in timing warnings.

### `Utils.isValidUrl(s)`
Returns `true` only if `s` parses as a URL with `http:` or `https:` protocol.

### `Utils.escape(s)`
Escapes `& < > " '` so user-supplied text can be inserted safely into HTML templates.

### `Utils.safeName(s)`
Turns any string into a filename-safe slug: non-word characters become `_`, and leading/trailing underscores are removed. Returns `'folder'` if the result is empty. Used for export file names.

### `Utils.shuffleArray(arr)`
Returns a shuffled copy of `arr` using the Fisher-Yates algorithm. The input is not modified.

---

## Section 3b - Updater (`Updater`)

Checks the raw GitHub copy of the script for a newer version.

### Constants
- `RAW_URL`: the script's raw URL on GitHub.
- `INTERVAL_MS`: 2 minutes between checks.
- `checking`: guard flag so only one request is in flight.

### `Updater.current()`
Returns `GM_info.script.version`, or `'0'` if unavailable.

### `Updater.isNewer(remote, local)`
Compares two dotted version strings part by part as integers. Returns `true` if `remote` is strictly greater than `local`. Missing parts count as zero, so `14.0` equals `14.0.0`.

### `Updater.check()`
Requests `RAW_URL` with a cache-busting query string and `Cache-Control: no-cache`. It extracts `@version` from the response with a regex. If the remote version is newer:
- It stores the version in `State.updateAvailable` and clears `updateDismissed`, then re-renders the panel to show the update bar.

If the remote version is not newer but `updateAvailable` was set, it clears it and re-renders.

### `Updater.install()`
Opens `RAW_URL` in a new tab. Tampermonkey detects the userscript and offers to install it.

### `Updater.start()`
Runs `check()` once immediately, then every `INTERVAL_MS`. It also checks when the tab becomes visible and when the window gains focus.

---

## Section 3c - Removals (`Removals`)

Hides page elements on oguser.com that the user does not want to see. Removal is applied to the live DOM, not with CSS.

### `Removals.DEFS`
Two definitions:
- `bats`: matches `<img>` elements whose `src` starts with a specific base64 GIF prefix.
- `spider`: matches elements selected by `#spider-web-corners`.

Each definition has `id`, `name`, `icon`, `kind` (`'img'` or `'sel'`), and the matcher (`prefix` or `sel`).

### `Removals.matches(node, d)`
Returns `true` if `node` is an element matching definition `d`.

### `Removals.handleNode(node)`
For `node` and all its descendants, removes every element that matches an enabled definition (`State.removals[d.id]` is true).

### `Removals.toggle(id)`
Flips the flag for `id`, saves state, and if the removal was just enabled, immediately runs `handleNode` on the whole document.

### `Removals.start()`
Runs `handleNode` on `<html>`, then starts a `MutationObserver` that watches for added nodes and for `src` attribute changes across the whole document. Anything new that matches an enabled removal is removed as soon as it appears.

---

## Section 3d - Import / export (`Transfer`)

Lets the user save and load link lists as JSON files. Works for BUMPS and for each event folder.

### `Transfer.input`
A hidden `<input type="file">` appended to `<body>`, restricted to `.json`. Created by `initInput()`.

### `Transfer.pending`
Stores `{type, fid}` for the list that an upcoming file selection should be imported into.

### `Transfer.initInput()`
Creates the hidden file input and wires its `change` event to `handleFile`. It clears the input value afterwards so the same file can be picked again.

### `Transfer.getList(type, fid)`
Returns the array of URLs for BUMPS (`type === 'bumps'`) or for the folder with id `fid`. Returns `null` if the folder does not exist.

### `Transfer.getName(type, fid)`
Returns `'bumps'` or the sanitized folder name, used to build the export file name.

### `Transfer.exportList(type, fid)`
Builds a JSON object:
```json
{ "app": "OG Pro", "type": "bumps" | "event", "name": "...", "exportedAt": "ISO date", "links": [ ... ] }
```
and downloads it as `og-pro-<name>.json` via a temporary object URL. Shows an alert if the list is empty.

### `Transfer.openImport(type, fid)`
Stores the target in `pending` and opens the file picker.

### `Transfer.handleFile(file)`
Reads the file as text and parses it. Accepts either a plain array of URLs or an object with a `links` array. Each entry is trimmed and validated with `Utils.isValidUrl`. Duplicates (against the existing list and within the file) are skipped and counted. Valid, new URLs are appended and state is saved. The panel shows a summary alert, for example "12 links imported · 3 duplicate links removed."

---

## Section 3e - Timing (`Delay`)

The timing editor. Each group (BUMPS and EVENTS) has three fields:

- **Cycle** (`bumpCycle` / `eventCycle`): how often the whole list is repeated. This is the **global** interval. A cycle starts, every link is queued, and the next cycle starts after this interval, regardless of how long the queue takes.
- **Min delay** / **Max delay** (`bumpMin`/`bumpMax`, `eventMin`/`eventMax`): the random pause between two consecutive links within a cycle. The minimum is always at least 30 seconds.

### `Delay.KEYS`
The six configuration keys, in display order.

### `Delay.META`
For each key: its group prefix (`bump` or `event`), its kind (`cycle`, `min`, `max`), and the i18n label key.

### `Delay.UNITS`
Maximum allowed value for each unit: seconds 600, minutes 240, hours 24. Used for the slider range.

### `Delay.PRESETS`
Quick-select buttons. Cycle presets are `15m, 30m, 1h, 2h, 6h`. Smooth presets are `30s, 45s, 1m, 2m, 5m`.

### `Delay.draft`
A working copy of the six values. Edits go here first and are only written to `State.cfg` by `commit()`.

### `Delay.reset()`
Copies the saved `State.cfg` values into `draft`.

### `Delay.parse(str)`
Splits a value such as `"45s"` into `{num: 45, unit: 's'}`. Accepts `s`, `m`, or `h`; defaults to minutes when no unit is given. Invalid input becomes `{num: 1, unit: 'm'}`.

### `Delay.toMs(str)`
Shortcut for `Utils.parseTimeToMs`.

### `Delay.isSmooth(key)`
Returns `true` for `min` and `max` keys, `false` for cycle keys.

### `Delay.lo(key, unit)`
Lower bound for the numeric input. For a smooth key in seconds it is 30 (the enforced minimum). Otherwise it is 1.

### `Delay.normalize(key, str)`
Returns a valid version of `str`:
1. Clamps the number between `lo` and the unit maximum.
2. For smooth keys, if the result is below 30 seconds, it becomes `"30s"`.

This is the single point of truth for valid values.

### `Delay.fixGroup(prefix)`
Ensures the max delay is never lower than the min delay within a group. If it is, max is set equal to min.

### `Delay.human(ms)`
Formats milliseconds as `"1h 5m 30s"`, omitting zero parts. Used for the live preview label.

### `Delay.field(key)`
Returns the HTML for one timing card field: label, live preview, number input, unit buttons (S/M/H), a range slider, and preset buttons. The preset matching the current normalized value is highlighted.

### `Delay.render()`
Returns the whole Timing tab: a BUMPS card and an EVENTS card, each with three fields and an estimate container (`#dl-est-bump`, `#dl-est-event`), plus a note about the 30 s minimum and the Reset and Save buttons.

### `Delay.sync(field)`
Updates one field's DOM in place (number, slider, unit buttons, presets, preview) without re-rendering the whole tab. This keeps dragging smooth. The number input is not overwritten while it has focus.

### `Delay.syncAll()`
Calls `sync` on every field, then refreshes the load estimates.

### `Delay.onInput(e)`
Handles live changes from the number input or slider. It updates `draft` and syncs the field. Does not validate the minimum yet, so the user can type freely.

### `Delay.onChange(e)`
Handles the number input's `change` event (on blur or Enter). It normalizes the value, applies `fixGroup`, and syncs all fields.

### `Delay.setUnit(field, unit)`
Changes the unit for a field, keeping the number, normalizes the result, applies `fixGroup`, and syncs.

### `Delay.setPreset(field, value)`
Applies a preset value, normalizes it, applies `fixGroup`, and syncs.

### `Delay.commit()`
Normalizes all six values, applies `fixGroup` to both groups, copies them into `State.cfg`, and saves.

---

## Section 4 - User interface (`UI`)

### `UI.container` / `UI.styleElement`
The root `<div id="ogpro-container">` and the `<style>` tag that holds the theme CSS. Both are created by `init()`.

### `UI.init()`
Creates the style and container elements, initializes the hidden file input (`Transfer.initInput`), writes the theme CSS, and renders the panel.

### `UI.updateStyles()`
Rewrites the `<style>` content using the current `State.theme` as CSS custom properties: `--og-bg`, `--og-side`, `--og-stroke`, `--og-acc` (accent), `--og-glow` (accent with 33% alpha), `--og-txt`, plus fixed `--og-amber`, `--og-ease`, and `--og-spring` easing curves. It also defines every class used by the panel: toggle button, panel, toast, sidebar, content grid, update bar, timing cards, progress bar, pause banner, lists, folders, switches, status box, scrollbars, and a `prefers-reduced-motion` block that shortens all animations.

### `UI.showAlert(msg)`
Shows a toast at the bottom of the panel for 3.2 seconds. It creates the `#ogpro-toast` element on first use and resets the hide timer on each call.

### `UI.actionRow(type, fid)`
Returns the Export / Import / Shuffle button row. For BUMPS the buttons have fixed IDs (`btn-export-bumps`, etc.). For events they use classes plus the folder ID from the parent card. The shuffle button is highlighted when shuffle is on.

### `UI.renderUpdateBar()`
Returns the update notification bar when a newer version is known and not dismissed. The bar shows the new version with Update and dismiss (×) buttons. Returns an empty string otherwise.

### `UI.renderRemovalRows()`
Returns one toggle row per entry in `Removals.DEFS`, using each definition's icon and name.

### `UI.renderBotBody()`
Returns the content of the Bot tab:
1. If `State.data.pause` is set: the amber pause banner with the reason (captcha or Cloudflare), the target name, the URL, and a **REANUDAR** button (`#btn-resume`).
2. The injection panel: a switch for global BUMPS, a switch for the award scanner, and one switch per event folder.
3. A progress bar for the current inter-link delay, showing a countdown.
4. The Discord webhook input with a save button.
5. The status box (`#ogpro-status`) showing the last action.

### `UI.renderMain()`
The main renderer. It rebuilds the whole panel:
- Sidebar with logo and version, the four navigation buttons (Links, Timing, Theme, Bot), and a status footer that shows running, paused, or idle.
- Content area with:
  - **Links tab:** sub-tabs for BUMPS and Events. BUMPS has the message and count inputs, a URL input, action row, and a list. Events has a folder-creation input and a container for folders.
  - **Timing tab:** `Delay.render()`.
  - **Theme tab:** language selector (ENG / ESP / RUS), four color pickers (background, sidebar, borders, accent), save button, and the removal toggles.
  - **Bot tab:** `renderBotBody()`.
- Update bar.
- Floating toggle button with a status dot (green when running, amber when paused, red dot when an update exists).

After rendering it calls `renderLinks`, `updateDelayInfo`, `updateStatus`, and `Events.bind`.

### `UI.renderLinks()`
Fills the BUMPS list and the folder list:
- Each BUMPS link shows a `[READY]` tag and a green border when it is in `completedBumps`.
- Each folder shows a collapsible header with name and link count, a settings row (message and count), an add-link row, the action row, and its links. Completed links are green.

### `UI.updateDelayInfo()`
Computes a load estimate for each group:
- `cyc` is the cycle length, `mn` and `mx` are the delay bounds.
- `avg = (mn + mx) / 2`. The load is `links × avg / cyc`, capped at 100%.
- `worst = links × mx`. If the worst case exceeds the cycle, the warning is shown with a suggested cycle length.

For events it uses the folder with the most links.

### `UI.updateStatus()`
Updates the live parts of the panel without a full re-render: the status box text, the sidebar footer, the floating button's color state, and the progress bar (computed from `delayEndTime` and `delayTotal`).

### `UI.togglePanel()`
Flips `State.isPanelOpen` and toggles the `show` class on the panel.

### `UI.shake(el)`
Restarts the shake animation on an input to signal invalid data.

---

## Section 5 - Event handling (`Events`)

All panel interactions go through one delegated handler to avoid binding many listeners.

### `Events.bind()`
Assigns `onclick`, `oninput`, and `onchange` on `UI.container` after every render. `oninput` goes to `Delay.onInput`, `onchange` to `Delay.onChange`.

### `Events.toggleShuffle(type, fid)`
Flips the shuffle flag for BUMPS or for one folder, shows the on/off message, saves, and re-renders.

### `Events.handleClick(e)`
Dispatches clicks by checking the closest matching element, in this order:
1. Floating toggle → `togglePanel`.
2. Update bar: **Update** → `Updater.install`; **×** → hide the bar.
3. Navigation buttons → switch tab; resets `Delay.draft`.
4. Language buttons → change language.
5. Sub-tab buttons → switch BUMPS / Events.
6. Timing: unit buttons, preset buttons, Save, Reset.
7. BUMPS: export, import, shuffle, save message settings, add link, delete link.
8. Events: create folder.
9. Folder card (when clicked):
   - export / import / shuffle for that folder,
   - save folder message and count,
   - add link to folder,
   - delete folder (also removes its queued items, pause state, and shuffle flag),
   - delete link,
   - collapse or expand the folder.
10. Theme: save colors.
11. Webhook: save URL.
12. Resume button → `Bot.resume()`.
13. Switches:
    - **Removal** → `Removals.toggle`.
    - **Global BUMPS** → turns on or off. Turning on is blocked if an event is active or if BUMPS is empty. Turning off clears queued bump items, clears a bump pause, and removes the active iframe. Turning on sets `nextBumpRun` to now so the first cycle starts immediately.
    - **Award scanner** → toggles.
    - **Event folder** → turns on or off. Turning on is blocked if BUMPS is active or if the folder is empty. Turning off clears its queued items, its pause, and its active iframe. Turning on sets `nextEventRuns` to now.

---

## Section 6 - Bot engine (`Bot`)

### `Bot.sendWebhook(title, desc, color)`
Posts a Discord embed to `State.cfg.webhook`. Does nothing if no webhook is set. Uses `GM_xmlhttpRequest` with a JSON body. The `color` is a decimal RGB integer.

### `Bot.sendStartWebhook(title, links, nextMs)`
Sent when a cycle starts. The embed lists every link, the total count, and the time of the next cycle (local time, `HH:MM:SS`).

### `Bot.sendCompletionWebhook(item)`
Sent when the last queued item of a cycle has been handled. For each link it shows `[READY]` or `[ERROR]` depending on whether it is in the completed list, plus the number of pending or failed links.

### `Bot.removeInvalidLink(item)`
Removes a link from BUMPS or from its folder after a 404 has been detected. Saves, re-renders, and sends a red webhook embed ("Enlace Removido (404/Invalid)"). The embed text is in Spanish.

### `Bot.checkAwards()`
Runs only when the award scanner is on and a webhook is set. It fetches `private.php` and `messages` from oguser.com, parses the HTML with `DOMParser`, and looks for rows authored by "OGU" or "OGU Bot" that mention an award. The award name is extracted from text such as "received the … award" or a bold tag. Each unique message (keyed by its link, stored with `GM_setValue`) is announced once as a "🏆 New Award!" webhook.

### `Bot.detectBlock(doc)`
Inspects a loaded document and returns:
- `'cloudflare'` if the title matches "Just a moment", "Attention Required", or "Checking your browser", or if a Cloudflare challenge element or iframe is present.
- `'captcha'` if the title contains "captcha", or if reCAPTCHA or hCaptcha elements are present.
- `null` otherwise.

### `Bot.processIframe(item)`
Injects one link as a hidden iframe and returns a Promise resolving to `{status, kind?}`. Steps:
1. Creates a hidden iframe pointing at `item.url` and stores it in `State.activeIframe`.
2. After 6 seconds (time for the page to load), it:
   - **Block check:** if `detectBlock` finds Cloudflare or a captcha, it removes the iframe and resolves `{status: 'captcha', kind}`.
   - **404 check:** if the title contains 404 / Not Found, or the text says the thread is invalid, it calls `removeInvalidLink` and resolves `fail`.
   - **Form check:** it looks for the message textarea and the submit button. If either is missing, it resolves `fail`.
   - **Message build:** for BUMPS it uses the global counter (`OG_PRO_count`) and increments it; for an event it uses the folder's `count` and increments that. The `{count}` placeholder is replaced (case-insensitive). The count input in the UI is updated to match.
   - **Submit:** sets the textarea value and clicks the submit button. Status box shows the injected message.
   - After 4 seconds, removes the iframe and resolves `ok`.
3. Any exception during the process removes the iframe and resolves `fail`.

### `Bot.pauseFor(item, kind)`
Called when a captcha or Cloudflare block is detected:
1. Stores `State.data.pause` with the item's type, folder, URL, name, kind, and the time it happened.
2. Stops processing: `isProcessing = false`, clears the delay.
3. Updates the status message.
4. Opens the blocked URL in a new tab with `window.open`. If the browser blocks the popup, it shows a toast asking the user to open the link manually.
5. Sends a Discord webhook (orange) titled "Error Captcha/Cloudflare: ciclo pausado".
6. Re-renders the panel.

The item is **not** removed from the queue, so it is retried after resume.

### `Bot.resume()`
Clears the pause and resumes:
1. Computes `gap`, the time spent paused.
2. Adds `gap` to the next scheduled run of the affected BUMPS or folder, so pausing does not cause a burst of duplicate cycles afterwards.
3. Clears `pause`, `isProcessing`, and the delay.
4. Saves, re-renders, and shows a "Cycle resumed" toast. The queue continues, and the item that was blocked is attempted again first.

### `Bot.smoothRange(type)`
Returns `{min, max}` in milliseconds for the delay between links of the given type. `min` is at least `MIN_SMOOTH_MS`, and `max` is at least `min`.

### `Bot.processQueue()`
Handles one queue item per call. It returns early if processing is running, paused, or the queue is empty. Otherwise:
1. Verifies that the item's source (BUMPS or its folder) is still active; if not, drops the item.
2. Sets `isProcessing` and updates the status.
3. Calls `processIframe`.
4. If the result is `captcha`, calls `pauseFor` and stops. The item stays at the front of the queue.
5. If the result is `ok`, adds the URL to the completed list and saves.
6. Removes the item from the queue. If this was the last item of its batch, sends the completion webhook.
7. If more items remain, picks a random delay between `smoothRange` min and max, sets `delayEndTime` and `delayTotal`, and releases `isProcessing` when the delay ends (via `setTimeout`). If the queue is empty, it marks the status as waiting for the next cycle.

---

## Section 7 - Main loop

### `buildCycle(links, shuffleOn)`
Returns the list to queue for a cycle. With shuffle on it returns a new random order; otherwise a copy in the original order. The whole cycle is built before being queued, so no link is skipped or repeated within one cycle.

### `StartLoop()`
Starts a `setInterval` that runs every second:
1. **Scheduling** (skipped while paused):
   - If BUMPS is active and `now >= nextBumpRun`: sets `nextBumpRun = now + bumpCycle`, clears `completedBumps`, queues every bump URL, sends the start webhook, and re-renders the list.
   - For each active event folder whose `nextEventRuns` has passed: does the same for that folder.
2. **Award scanner:** if enabled and at least 2 minutes have passed since the last scan, runs `Bot.checkAwards()`.
3. **Queue:** if nothing is processing, nothing is paused, the queue is not empty, and the delay has ended, calls `Bot.processQueue()`.
4. Refreshes the status display.

### `InitApp()`
Called after successful authentication:
1. `State.load()`
2. `UI.init()`
3. `StartLoop()`
4. `Updater.start()`
5. `Removals.start()`

---

## Data model

Stored under `OG_PRO_state` (inside `State.data`):

```js
{
  bumps: ["https://oguser.com/...", ...],           // global BUMPS links
  events: [                                          // custom folders
    {
      id: "evt_1730000000000",
      name: "Folder name",
      links: ["https://...", ...],
      isExpanded: true,
      message: "grinding x{count}",
      count: 1
    }
  ],
  activeBumps: false,                                // global switch
  activeEvents: { "<folderId>": true | false },      // per-folder switches
  nextBumpRun: 0,                                    // epoch ms of next BUMPS cycle
  nextEventRuns: { "<folderId>": 0 },                // epoch ms of next cycle per folder
  completedBumps: ["https://..."],                   // links done in current cycle
  completedEvents: { "<folderId>": ["https://..."] },
  pause: null | { type, folderId, url, name, kind, since }
}
```

Other persisted keys:

| Key | Content |
|---|---|
| `OG_PRO_AUTH` | Validated license key |
| `OG_PRO_count` | Global bump counter |
| `OG_PRO_bumpMsg` | BUMPS message template |
| `OG_PRO_awardNotifier` | Award scanner on/off |
| `OG_PRO_lastAwardCheck` | Last award scan timestamp |
| `OG_PRO_lang` | Language code |
| `OG_PRO_theme` | Theme colors |
| `OG_PRO_cfg` | Timing values and webhook URL |
| `OG_PRO_shuffle` | Shuffle flags |
| `OG_PRO_removals` | Removal toggles |
| `OG_PRO_queue` | Pending queue items |
| `awd_<url>` | Award message already announced (set by `checkAwards`) |

---

## Lifecycle: from install to first bump

1. The script loads on `oguser.com`. Font Awesome is injected.
2. `Auth.check()` runs:
   - With a stored key: the panel is created immediately and the key is re-validated in the background.
   - Without a key: the license screen appears.
3. After a valid key, `InitApp()` loads state, creates the panel, starts the 1-second loop, starts the updater, and applies removals.
4. The user adds links to BUMPS or creates a folder and adds links to it.
5. The user configures timing, optionally sets a Discord webhook, and switches BUMPS or a folder on.
6. At the next scheduled time, the loop builds the queue. `processQueue` injects one link at a time with random delays between them.
7. On a captcha or Cloudflare block, the cycle pauses, the link opens in a new tab, and a webhook is sent. After the user solves it and presses **REANUDAR**, the same link is retried and the schedule is shifted by the paused time.
8. When a cycle ends, a completion webhook lists every link as `[READY]` or `[ERROR]`.

---

## Known limitations

- **Font Awesome depends on cdnjs.** If the site's CSP blocks it, icons will be missing.
- **Fixed 6-second load wait.** The injection assumes the page has loaded after 6 seconds. Slow pages can cause a false "Input not found" failure.
- **Same-origin iframe access.** Form detection reads `iframe.contentDocument`, which requires the page to be same-origin. This is the case for oguser.com.
- **Removal list is hard-coded.** Adding a new removal means editing `Removals.DEFS`.
- **Some messages are in Spanish** (404 removal webhook and a few log lines). The UI itself is multilingual.
- **Award parsing depends on the page's HTML.** If oguser.com changes its markup, `checkAwards` may stop detecting awards.
- **Licensing is client-side.** The key list is fetched from a public GitHub file, so the check can be bypassed by editing the script. It is a convenience gate, not real security.
- **Timers run only while the tab is open.** Browsers throttle background tabs, so cycles may be delayed when the oguser.com tab is not active.
