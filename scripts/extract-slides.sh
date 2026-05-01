#!/usr/bin/env bash
#
# Extract slide pages from a PDF as individual PNG images.
#
# Prerequisites:
#   brew install poppler   # provides pdftoppm
#
# Usage:
#   bash extract-slides.sh <input.pdf> [output_dir]
#
# Example:
#   bash content/vsh/ml-systems/extract-slides.sh BRK2-115.pdf content/vsh/ml-systems/slides

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <input.pdf> [output_dir]"
  echo ""
  echo "Extracts each page of a PDF as a high-quality PNG."
  exit 1
fi

INPUT_PDF="$1"
OUTPUT_DIR="${2:-./slides}"

if [ ! -f "$INPUT_PDF" ]; then
  echo "Error: file not found: $INPUT_PDF"
  exit 1
fi

if ! command -v pdftoppm &>/dev/null; then
  echo "pdftoppm not found. Installing poppler via Homebrew..."
  brew install poppler
fi

mkdir -p "$OUTPUT_DIR"

PAGE_COUNT=$(pdfinfo "$INPUT_PDF" 2>/dev/null | grep "^Pages:" | awk '{print $2}')
echo "Extracting ${PAGE_COUNT} pages from $(basename "$INPUT_PDF") -> ${OUTPUT_DIR}/"
echo ""

# pdftoppm renders each page as a PNG at 300 DPI
# Output files: slide-01.png, slide-02.png, ...
pdftoppm -png -r 300 "$INPUT_PDF" "${OUTPUT_DIR}/slide"

# Rename to zero-padded format: slide-1.png -> slide-01.png (pdftoppm may vary)
# pdftoppm already zero-pads, but width depends on page count. Normalize to 2 digits.
cd "$OUTPUT_DIR"
for f in slide-*.png; do
  # Extract page number from filename (e.g., slide-1.png or slide-01.png)
  num=$(echo "$f" | sed 's/slide-0*//' | sed 's/\.png//')
  padded=$(printf "slide-%02d.png" "$num")
  if [ "$f" != "$padded" ]; then
    mv "$f" "$padded"
  fi
done
cd - >/dev/null

echo "Done! ${PAGE_COUNT} slides saved to ${OUTPUT_DIR}/"
ls -1 "${OUTPUT_DIR}"/slide-*.png
