#!/bin/bash

echo "usage: createQuadTreeTiling.sh source.png"

for((zoom=0; zoom<=5; zoom++)) {
  #resize the source file
  mkdir -p tiles/zoom/$zoom
  echo "calculating zoom level " $zoom
  imageSize=$((256 * (1<<$zoom) ))
  convert $1 -resize ${imageSize}x${imageSize} -background white -gravity center -extent ${imageSize}x${imageSize} -flatten tiles/zoom/$zoom/full.png
}

echo "cutting into tiles"
for((zoom=0; zoom<=5; zoom++)) {
   echo "slicing for zoom level " $zoom
  convert tiles/zoom/$zoom/full.png -crop 256x256 tiles/zoom/$zoom/t_%d.png
 }