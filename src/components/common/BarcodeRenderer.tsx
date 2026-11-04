import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeRendererProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  width = 1.6,
  height = 50,
  fontSize = 12,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        // Tự động nhận diện chuẩn: Nếu đúng 13 số thì dùng EAN-13, còn lại dùng CODE128
        const isEan13 = value.length === 13 && /^\d+$/.test(value);
        JsBarcode(svgRef.current, value, {
          format: isEan13 ? 'EAN13' : 'CODE128',
          width,
          height,
          displayValue: true,
          fontSize,
          margin: 6,
          background: 'transparent',
          lineColor: '#0f172a',
        });
      } catch {
        // Fallback sang CODE128 nếu EAN-13 lỗi checksum
        try {
          if (svgRef.current) {
            JsBarcode(svgRef.current, value, {
              format: 'CODE128',
              width,
              height,
              displayValue: true,
              fontSize,
              margin: 6,
              background: 'transparent',
              lineColor: '#0f172a',
            });
          }
        } catch (err) {
          console.error('Không thể render mã vạch:', err);
        }
      }
    }
  }, [value, width, height, fontSize]);

  if (!value) return null;

  return (
    <div className="flex justify-center bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
      <svg ref={svgRef} className="max-w-full" />
    </div>
  );
};
