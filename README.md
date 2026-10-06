# Tejas Ajit Jamdar — Architecture Portfolio

Prepared for the GitHub repository tejas-191/tejas-191.github.io.
Expected address after GitHub Pages is enabled: https://tejas-191.github.io/

## Publish
Upload the contents of this directory to the repository root (index.html must be at the root).
In Settings → Pages, select Deploy from a branch, main, and / (root).
GitHub Pages makes the site publicly accessible; enable it only after approving that audience.
The existing Sites portfolio is separate and stays private.

## Update projects
project-config.js controls project IDs, display order, titles and credits.
project-presentations.js maps project IDs to ordered page images with their width and height.
project-library/<ID>/model.glb holds each model; presentation/ holds its WebP boards.
SEM-6 is NSD and includes all 11 PDF pages. Keep IDs stable when adding assets.
Commit updates to main to trigger GitHub Pages publication.

## Preview
Serve this directory with a local static HTTP server; opening index.html directly as a file will not load GLB assets correctly.
