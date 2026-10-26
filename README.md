# Human Pause

A browser-based research prototype for the **Misinformation and AI in Public Health** project at the New York Academy of Sciences Junior Academy. Human Pause adds a short reflection checkpoint before high-stakes AI responses are revealed.

## Use and share the website

After GitHub Pages is deployed, open **https://arniverus.github.io/human-pause/** on any device. The website works without installing the extension. Its scenarios and pasted-text checks run in your browser; it does not monitor other tabs. To add gates inside ChatGPT or Gemini, install the extension below.

Source repository: https://github.com/arniverus/human-pause

## Run the playground

Requires Python 3. Run `python3 -m http.server 4173 --bind 127.0.0.1` in this folder, then open http://127.0.0.1:4173. If Node is installed, `npm run dev` does the same thing. No installation or build step is required.

Try Public health, Finance, Science, and Everyday. High-stakes examples are gated; everyday text is revealed directly. A reflection needs 12 words, 8 distinct words, and a verification-related term. Use **Try your own text** to paste another response. This does not call an AI model. The **Your pauses** view records completed checkpoints for this tab only.

## Load the extension

1. Open `chrome://extensions` or `edge://extensions`.
2. Turn on Developer mode.
3. Choose Load unpacked and select the `extension` folder (or extract the downloadable ZIP and select that folder).
4. Refresh ChatGPT or Gemini.
5. Ask a question involving a medical treatment, investment, or scientific study. Detected assistant response blocks receive a reflection gate.

The Manifest V3 content script has site access only to `chatgpt.com`, `chat.openai.com`, and `gemini.google.com`. There are no background services, API keys, analytics, storage permissions, or remote model calls. Disable or remove it from your browser's extension page.

## Structure

- `index.html`, `styles.css`, `app.js`: responsive interactive demo, session history, and installation guidance.
- `extension/core.js`: shared keyword detector and lightweight reflection check.
- `extension/manifest.json`: Manifest V3 configuration.
- `extension/content.js`: MutationObserver, site selectors, isolated Shadow DOM gate, streaming re-checks, and reveal behavior.
- `tests/core.test.cjs`: detector, reflection, and manifest tests.
- `tests/extension-fixture.html`: local DOM fixture for extension behavior (not a live-site compatibility guarantee).

## Verification

With Node 18+: `npm test` and `npm run check`.

Open `/tests/extension-fixture.html` on the local server to test ChatGPT-style and Gemini-style nodes without installing the extension. The fixture has controls for new answers, streaming updates, and removed responses. The fixture uses the actual content script.

## Design and safety boundaries

This is a **productive-friction concept**, not a fact checker or medical product. The source card explicitly says sources are unverified. Simulated examples are intentionally questionable and labeled accordingly. No source confidence score or clinical recommendation is generated. The reflection heuristic encourages a verification step but cannot judge whether it is meaningful or correct. English keyword detection produces false positives and false negatives; efficacy against automation bias has not been established.

The demo does not put gated answer text into the DOM until unlock. The extension hides the original answer using `display: none`, `inert`, and `aria-hidden`; its gate is a sibling, outside the observed answer's content. It restores the original display/accessibility state on reveal. Changed content re-locks a previously revealed answer. Streaming content updates behind a locked gate without resetting the user's reflection. Removed messages have their gates cleaned up.

Third-party DOM selectors and streaming behavior can change. Detection is asynchronous, so some text may appear before the gate is applied. Browser Find, developer tools, other extensions, DOM access, and host-site copy/export controls are outside the gate's protection. This is not a security boundary and is not suitable as a clinical safety control. Test current live ChatGPT/Gemini interfaces manually before a presentation; the local fixture cannot establish live-site compatibility.

All demo inputs and history stay in memory and clear on refresh. The demo optionally loads fonts from Google Fonts; system fonts work offline. External research links open only when clicked. The extension makes no network requests of its own; the host AI site still handles its own content and requests.

## Suggested research evaluation

Compare gated and ungated responses with consented participants. Measure whether participants identify unsupported claims, consult primary sources, retain agency, and experience excessive friction. Record false-positive and false-negative triggers. Evaluate accessibility and comprehension separately from completion rate. Do not equate a completed reflection with improved factual accuracy.
