#!/bin/bash
# Convierte cada clip mp4 en cuadros JPG (30 por segundo, 1080×1920) y escribe clips.js con el número de cuadros.
cd "$(dirname "$0")"
echo "window.CLIPN = {" > clips.js
for f in *.mp4; do n="${f%.mp4}"; rm -rf "$n"; mkdir -p "$n"
  ffmpeg -loglevel error -i "$f" -vf "fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" -q:v 3 "$n/f%03d.jpg"
  echo "  $n: $(ls "$n" | wc -l)," >> clips.js; done
echo "};" >> clips.js; cat clips.js
