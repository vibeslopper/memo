# Memo

Memo is a small, static collection of client-side memorisation games. It uses plain HTML and JavaScript, and stores game settings and records in this browser. Its compiled stylesheet is built with Tailwind CSS v4.

## Build the CSS

With the standalone Tailwind CSS v4 CLI available as `./tailwindcss` in the project root, run:

```sh
./tailwindcss -i ./src/input.css -o ./output.css --minify
```

`src/input.css` imports Tailwind and loads `tailwind.config.js`. The local CLI binary is excluded by `.gitignore`; it is a build tool only and is not loaded by the page. Rebuild `output.css` after changing Tailwind classes and include the generated file with the site; GitHub Pages does not build it for you.

## Run locally

Build `output.css`, then run this from the project root:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/>. The plain scripts and relative paths also allow the page to be opened directly as `file://`.

## Deploy to GitHub Pages

1. Build `output.css` and include it with the site files.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select branch `main` and folder `/ (root)`, then save.

The empty root `.nojekyll` file tells GitHub Pages not to process the site with Jekyll.
