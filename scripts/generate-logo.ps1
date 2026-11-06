# Generates UI logo assets from public/images/logo.png
# Usage: npm run logo   (run again whenever logo.png is replaced)
#
# Source: dark/red artwork on a plain white background.
# Output (in /public):
#   logo-light.png        transparent, original colors (for light backgrounds)
#   logo-dark.png         transparent, dark ink turned white (for dark backgrounds)
#   favicon-32.png, favicon-64.png, apple-touch-icon.png, logo-512.png

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'public\images\logo.png'
$out = Join-Path $root 'public'

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class LogoTool {
  // Removes the white background. Each pixel is treated as ink blended over white:
  // alpha comes from how far the darkest channel is from white.
  // invertDark: near-neutral (dark) ink becomes white, colored ink (red) is kept.
  public static Bitmap Knockout(Bitmap srcBmp, bool invertDark, out Rectangle bounds) {
    int w = srcBmp.Width, h = srcBmp.Height;
    var src = new Bitmap(w, h, PixelFormat.Format32bppArgb);
    using (var g = Graphics.FromImage(src)) g.DrawImage(srcBmp, 0, 0, w, h);
    var dst = new Bitmap(w, h, PixelFormat.Format32bppArgb);
    var r = new Rectangle(0, 0, w, h);
    var sd = src.LockBits(r, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    var dd = dst.LockBits(r, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
    int n = w * h * 4;
    byte[] s = new byte[n], d = new byte[n];
    Marshal.Copy(sd.Scan0, s, 0, n);
    int minX = w, minY = h, maxX = -1, maxY = -1;
    for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
      int i = (y * w + x) * 4;
      int B = s[i], G = s[i + 1], R = s[i + 2];
      int mn = Math.Min(R, Math.Min(G, B));
      bool colored = (R - Math.Max(G, B)) > 40;
      // reference "fully opaque" darkest channel: red ink ~50, navy ink ~18
      double refMin = colored ? 50.0 : 18.0;
      double a = (245.0 - mn) / (245.0 - refMin);
      if (a <= 0.02) a = 0; if (a > 1) a = 1;
      byte oR, oG, oB;
      if (colored) { oR = 238; oG = 50; oB = 56; }
      else if (invertDark) { oR = 255; oG = 255; oB = 255; }
      else { oR = 17; oG = 24; oB = 39; }
      d[i] = oB; d[i + 1] = oG; d[i + 2] = oR; d[i + 3] = (byte)Math.Round(a * 255);
      if (a > 0.3) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    }
    Marshal.Copy(d, 0, dd.Scan0, n);
    src.UnlockBits(sd); dst.UnlockBits(dd); src.Dispose();
    bounds = maxX < 0 ? r : Rectangle.FromLTRB(minX, minY, maxX + 1, maxY + 1);
    return dst;
  }
}
'@

function New-Canvas([int]$w, [int]$h) {
  $b = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($b)
  $g.SmoothingMode = 'AntiAlias'; $g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'
  $g.Clear([System.Drawing.Color]::Transparent)
  return @($b, $g)
}

# Crops the knocked-out art to its content (small padding) and scales it to a given height.
function Save-Wordmark($bmp, $bounds, [int]$height, [string]$path) {
  $pad = [int]($bounds.Height * 0.04)
  $crop = [System.Drawing.Rectangle]::FromLTRB(
    [Math]::Max(0, $bounds.Left - $pad), [Math]::Max(0, $bounds.Top - $pad),
    [Math]::Min($bmp.Width, $bounds.Right + $pad), [Math]::Min($bmp.Height, $bounds.Bottom + $pad))
  $width = [int][Math]::Round($crop.Width * $height / $crop.Height)
  $b, $g = New-Canvas $width $height
  $g.DrawImage($bmp, (New-Object System.Drawing.Rectangle 0, 0, $width, $height), $crop, 'Pixel')
  $b.Save($path, [System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $b.Dispose()
  "{0}  {1}x{2}" -f (Split-Path $path -Leaf), $width, $height
}

# Square app icon: white rounded tile with the wordmark centered.
function Save-Icon($bmp, $bounds, [int]$size, [string]$path) {
  $b, $g = New-Canvas $size $size
  $r = $size * 0.22; $d = $r * 2
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddArc(0, 0, $d, $d, 180, 90); $p.AddArc($size - $d - 1, 0, $d, $d, 270, 90)
  $p.AddArc($size - $d - 1, $size - $d - 1, $d, $d, 0, 90); $p.AddArc(0, $size - $d - 1, $d, $d, 90, 90)
  $p.CloseFigure()
  $g.FillPath([System.Drawing.Brushes]::White, $p)
  $tw = $size * 0.80
  $th = $tw * $bounds.Height / $bounds.Width
  $dest = New-Object System.Drawing.RectangleF (($size - $tw) / 2), (($size - $th) / 2), $tw, $th
  $g.DrawImage($bmp, $dest, [System.Drawing.RectangleF]$bounds, 'Pixel')
  $b.Save($path, [System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $b.Dispose(); $p.Dispose()
  "{0}  {1}x{1}" -f (Split-Path $path -Leaf), $size
}

$orig = New-Object System.Drawing.Bitmap $src
$bounds = [System.Drawing.Rectangle]::Empty
$light = [LogoTool]::Knockout($orig, $false, [ref]$bounds)
$dark  = [LogoTool]::Knockout($orig, $true,  [ref]$bounds)
$orig.Dispose()

Save-Wordmark $light $bounds 128 (Join-Path $out 'logo-light.png')
Save-Wordmark $dark  $bounds 128 (Join-Path $out 'logo-dark.png')
Save-Icon $light $bounds 512 (Join-Path $out 'logo-512.png')
Save-Icon $light $bounds 180 (Join-Path $out 'apple-touch-icon.png')
Save-Icon $light $bounds 64  (Join-Path $out 'favicon-64.png')
Save-Icon $light $bounds 32  (Join-Path $out 'favicon-32.png')

$light.Dispose(); $dark.Dispose()

