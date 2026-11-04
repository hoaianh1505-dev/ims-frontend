/**
 * Sinh mã vạch chuẩn EAN-13 quốc gia Việt Nam (bắt đầu bằng 893)
 * kèm thuật toán tính số kiểm tra checksum modulo 10
 */
export function generateEAN13Barcode(): string {
  const prefix = '893';
  let middle = '';
  for (let i = 0; i < 9; i++) {
    middle += Math.floor(Math.random() * 10).toString();
  }
  const code12 = prefix + middle;

  // Thuật toán tính số kiểm tra checksum EAN-13
  let sumOdd = 0;
  let sumEven = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code12[i], 10);
    if (i % 2 === 0) {
      sumOdd += digit;
    } else {
      sumEven += digit;
    }
  }
  const total = sumOdd + sumEven * 3;
  const checksum = (10 - (total % 10)) % 10;
  return code12 + checksum.toString();
}

/**
 * Mở cửa sổ in tem mã vạch chuyên dụng cho máy in nhiệt (thermal printer)
 */
export function printBarcodeLabel(product: {
  name: string;
  sku: string;
  barcode?: string;
  selling_price?: number;
}) {
  const printWindow = window.open('', '_blank', 'width=450,height=400');
  if (!printWindow) return;

  const barcodeValue = product.barcode || product.sku;
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(product.selling_price || 0));

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>In tem mã vạch - ${product.sku}</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
        <style>
          @page {
            size: auto;
            margin: 5mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .label-container {
            width: 75mm;
            padding: 4mm;
            border: 1px dashed #94a3b8;
            border-radius: 4px;
            text-align: center;
            background: #fff;
          }
          .product-name {
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.2;
            max-height: 2.4em;
            overflow: hidden;
            margin-bottom: 4px;
          }
          .sku-info {
            font-size: 10px;
            color: #64748b;
            font-family: monospace;
            margin-bottom: 4px;
          }
          svg {
            max-width: 100%;
            height: auto;
          }
          .price {
            font-size: 13px;
            font-weight: 800;
            color: #1a4d3e;
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="product-name">${product.name}</div>
          <div class="sku-info">SKU: ${product.sku}</div>
          <svg id="barcode-target"></svg>
          <div class="price">${formattedPrice}</div>
        </div>
        <script>
          try {
            const isEan13 = '${barcodeValue}'.length === 13 && /^\\d+$/.test('${barcodeValue}');
            JsBarcode('#barcode-target', '${barcodeValue}', {
              format: isEan13 ? 'EAN13' : 'CODE128',
              width: 1.8,
              height: 45,
              displayValue: true,
              fontSize: 11,
              margin: 2
            });
          } catch(e) {
            JsBarcode('#barcode-target', '${barcodeValue}', {
              format: 'CODE128',
              width: 1.8,
              height: 45,
              displayValue: true,
              fontSize: 11,
              margin: 2
            });
          }
          setTimeout(() => {
            window.print();
            window.close();
          }, 350);
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
