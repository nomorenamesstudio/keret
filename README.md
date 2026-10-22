# Keret — A Free, FOSS Photo Wall Builder

[![License: MIT](https://img.shields.io/badge/license-MIT-3fb950?style=for-the-badge)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-3fb950?style=for-the-badge)](CONTRIBUTING.md)
[![Node 18.17+](https://img.shields.io/badge/node-18.17%2B-3fb950?style=for-the-badge)](docs/SETUP.md)
[![CI](https://github.com/nomorenamesstudio/keret/actions/workflows/ci.yml/badge.svg?style=for-the-badge)](https://github.com/nomorenamesstudio/keret/actions/workflows/ci.yml)

![Keret: the wordmark inside a white frame outline, over the demo wall](docs/assets/readme-header.jpg)

A free, open-source photo wall builder: point it at a folder of photographs and it
writes one static page you pan and zoom, every photo in its own frame and nothing
cropped.

**[Open keret.app](https://keret.nomorenames.studio/)** — drop a folder in the
browser, get the wall as a zip; nothing is uploaded.
**[See a live wall](https://nomorenamesstudio.github.io/keret/)** — 105
photographs, every frame captioned from the file's own EXIF.

## Why this exists

Every wall I tried was a CMS plugin I had to keep running, a grid that cropped my
photographs to squares, or a hosted gallery that charged a subscription to show my
own pictures. Keret is the engine of my own photo wall, pulled out into a tool:
point it at a folder and it writes the page.

Named after the Hungarian word for *frame*.

## What it does

| | |
| --- | --- |
| **One photo, one frame** | Frames keep the photo's real aspect ratio, so nothing is cropped to fit a grid |
| **Captions from the file** | Date, exposure, focal length and camera come out of the photo's own EXIF, with no metadata pass and no service |
| **One big wall** | The whole wall is one canvas you pan and zoom; pinch, double-tap and the fit button work on a phone |
| **A folder, not a server** | The build writes HTML, images and crawler files. No database, no PHP, no client framework |
| **Originals stay private** | Every published copy is re-encoded, so EXIF including GPS is dropped and orientation is baked in |
| **Your typeface** | Geist Mono by default; Geist Sans, Geist Pixel, Crimson Text or Crafty Girls with one config key, served from your own domain |
| **Yours, credited** | A "Powered by Keret" line you can rewrite or remove, and a photographer card for your own contact details |
| **Readable without JavaScript** | Without JS you get a plain list of the photographs; the wall is the enhancement |

## Quick start

```sh
git clone https://github.com/nomorenamesstudio/keret.git
cd keret && npm install            # sharp, the only dependency

mkdir -p ~/pictures/wall/photos     # put your photographs here
cd ~/pictures/wall
node ~/Code/keret/gen.js            # writes ./dist
npx --yes serve dist                # or any static file server
```

1. The first run on a terminal asks four questions (title, description, site URL,
   photographer) and writes `wall.config.json`; every later run offers to keep it.
2. `--yes` never asks, `--setup` brings the questions back, `--check` lays the
   wall out and writes nothing. Every flag is in [docs/API.md](docs/API.md).
3. No terminal at all? [keret.app](https://keret.nomorenames.studio/) runs the same
   build in a browser tab and hands you the finished site as a zip.

## How it works

```
photos/            your originals (never written to)
wall.config.json   optional: identity, captions, wall geometry, image sizes, font
author.json        optional: the photographer card
        |
        v
   node gen.js     layout -> re-encode -> page -> stamp
        |
        v
dist/              index.html, photos/, fonts/, og.jpg, robots.txt, sitemap.xml
```

Layout is computed from the file headers alone, so every frame matches how a
browser renders that photo; the engine then draws one canvas and culls whatever is
off screen. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) has the pipeline in full.

![The browser builder finishing a wall: framed prints, the wall's statistics, and the download button](docs/assets/app-window.png)

The browser builder is not a fork: `web/vendor/keret-core.js` is generated from
`src/`, and the zip carries `wall.config.json` and `author.json` back with it, so
unzip, add photographs and run `node gen.js` to get the same wall from the command
line. The one trade-off is the encoder — the browser's own, so its output is not
byte-identical to the CLI's.

## FAQ

### Is Keret really free?

Yes. MIT licence, no account, no paid tier, no upsell. The only cost is hosting,
and a static wall runs on a free tier.

### Do my photographs get uploaded?

No. The browser builder decodes them in the tab and builds the zip there; the CLI
works on your own machine and writes a local folder.

### Can I self-host the wall?

Yes, and there is no server to host. The output is static files: commit them to
GitHub Pages, drop the folder on Cloudflare Pages or Netlify, or `rsync` it to
your own box. [docs/HOSTING.md](docs/HOSTING.md) walks through all four, custom
domain included.

### What do I need to run it?

Node 18.17 or newer and one dependency, `sharp`. Sharp is not optional: it strips
the metadata and bakes in EXIF orientation, and the build refuses to publish
originals without it.

### What happens to the GPS in my photos?

It never reaches the page. Published copies are re-encoded without any metadata,
and the GPS block in the source file is never parsed at all.

### Is there AI in it?

Not in the runtime: no model, no API key, no token cost: it is a static page. Keret
is hand-written and AI-enhanced — the specification, design and review are mine,
the code was written with DeepSeek V4.1 Flash in DeepSeek Harness, and
[docs/CHANGELOG.md](docs/CHANGELOG.md) dates every change.

### Who built it?

K, under [No More Names Studio](https://nomorenames.studio). MIT licensed, source
on GitHub, issues and pull requests welcome.

## The demo wall

`demo/` is a complete wall — 105 photographs, their captions and the built site,
committed so the demo builds offline and GitHub Pages can serve it. It is live at
<https://nomorenamesstudio.github.io/keret/>.

Every photograph is a Wikimedia Commons original that still carries its camera
EXIF, committed at demo size (1000px, about 12 MB) and chosen so that no frame
shows a person. What the build publishes never carries that metadata.

<!-- demo-credits:start -->
Every photograph is CC0 1.0 or public domain. Photographs by Jebulon (8), GlacierNPS (7), Wilfredor (6), DimiTalen (5), Alex Liivet from Chester, United Kingdom (4), blmcalifornia (4), Mertbiol (4), Roc0ast3r (4), Perituss (2), Peter Cooper Jr. (2), Unknown (not credited) (2), plus 57 photographers with one frame each.

The full list, one row per file with its license and a link to the source page,
is in [demo/CREDITS.md](demo/CREDITS.md).
<!-- demo-credits:end -->

## Documentation

[docs/INDEX.md](docs/INDEX.md) routes everything: [SETUP](docs/SETUP.md) to run
it, [API](docs/API.md) for the CLI and every config key, [HOSTING](docs/HOSTING.md)
to put it online, [ARCHITECTURE](docs/ARCHITECTURE.md) for how it fits together,
[SECURITY](SECURITY.md) for the guard rails that keep the build from eating your
originals.

## Contributing

1. Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [code of conduct](CODE_OF_CONDUCT.md).
2. Run `npm test` before opening a pull request; the suite is the contract.
3. Keep the scope tight: keeping each frame's own aspect ratio is the whole point,
   so a change that crops, buckets or "improves" the layout needs a reason first.

## License

MIT. See [LICENSE](LICENSE).

[![Star this repo](https://img.shields.io/badge/star-this%20repo-e23c30?style=for-the-badge&logo=github)](https://github.com/nomorenamesstudio/keret)

Built by [K](https://nomorenames.studio) | [keret.app](https://keret.nomorenames.studio/) ·
[No More Names Studio](https://nomorenames.studio)
