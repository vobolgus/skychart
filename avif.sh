# Set minimum and maximum quality
MIN=20
MAX=30

# Check if input and output directories are specified
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <input_directory> <output_directory>"
  exit 1
fi

INPUT_DIR="$1"
OUTPUT_DIR="$2"

# Create the output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Loop over each PNG file in the input directory
for img in "$INPUT_DIR"/*.jpg; do
  # Get the base filename without the extension
  filename=$(basename "$img" .jpg)
  
  # Convert PNG to AVIF and save it in the output directory
  avifenc --min $MIN --max $MAX --speed 3 --yuv 444 --codec aom "$img" "$OUTPUT_DIR/$filename.avif"
done

echo "Conversion complete. AVIF files saved in $OUTPUT_DIR"