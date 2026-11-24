# Run from the project root with: .\tools\optimize-images.ps1
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $projectRoot 'assets\original'
$outputRoot = Join-Path $projectRoot 'public\assets\images'
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

$images = @(
    'about-portrait.png',
    'cert-excel.png',
    'cert-iaci.jpg',
    'cert-ibm.jpg',
    'hero-portrait.png',
    'project-data-cleaning.png',
    'project-healthcare-platform.png',
    'project-perfume-ecommerce.png',
    'project-stock-market.png'
)

foreach ($image in $images) {
    $source = Join-Path $sourceRoot $image
    $name = [IO.Path]::GetFileNameWithoutExtension($image)
    foreach ($format in @('webp', 'jpeg')) {
        $output = Join-Path $outputRoot "$name.$format"
        $quality = if ($format -eq 'webp') { '80' } else { '86' }
        & npx --yes --package sharp-cli sharp --input $source --output $output --format $format --quality $quality --autoOrient resize 800
        if ($LASTEXITCODE -ne 0) {
            throw "Image conversion failed for $source ($format)."
        }
    }
}
