import React from 'react';
import { Ruler, X, CheckCircle2 } from 'lucide-react';
import { SIZE_CHART } from '../data/initialData';

interface SizeGuideModalProps {
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-4 h-4 text-slate-300" />
            <h3 className="font-extrabold text-sm text-white">دليل القياسات والمقاسات (Size Chart)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
            💡 <span className="font-bold">نصيحة طراز:</span> لقياس دقيق، قس قطعة ملابس مريحة لديك من الإبط إلى الإبط (عرض الصدر) وقارنها مع الجدول:
          </p>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-center text-xs">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="py-2.5 px-3">المقاس (Size)</th>
                  <th className="py-2.5 px-3">عرض الصدر (سم)</th>
                  <th className="py-2.5 px-3">الطول (سم)</th>
                  <th className="py-2.5 px-3">عرض الكتف (سم)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {SIZE_CHART.map((row) => (
                  <tr key={row.size} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 font-extrabold text-slate-900 bg-slate-100">{row.size}</td>
                    <td className="py-2 px-3 font-mono">{row.chestCm}</td>
                    <td className="py-2 px-3 font-mono">{row.lengthCm}</td>
                    <td className="py-2 px-3 font-mono">{row.shoulderCm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1 text-[11px] text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
              <span>قطع الأوفرسايز (Oversized) تأتي بقصة واسعة ومريحة بحواف مائلة.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
              <span>جميع الخامات قطن 100% معالجة ضد الانكماش بعد الغسيل.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs shadow-sm hover:bg-slate-800 transition-colors"
          >
            فهمت، العودة للتصميم
          </button>
        </div>

      </div>
    </div>
  );
};
