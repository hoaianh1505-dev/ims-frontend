import { toast } from 'sonner';

export const showToast = {
  success: (message: string, duration = 3500) => {
    return toast.custom(
      (id) => (
        <div
          onClick={() => toast.dismiss(id)}
          className="flex items-center gap-3.5 px-4 py-3.5 bg-white rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.14)] border-l-[5px] border-[#48BB78] cursor-pointer hover:shadow-lg transition-all min-w-[280px] max-w-md pointer-events-auto border-y border-r border-slate-100"
        >
          <div className="w-5 h-5 rounded-full bg-[#48BB78] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <svg className="w-3.5 h-3.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-800 leading-snug">{message}</span>
        </div>
      ),
      { duration }
    );
  },

  error: (message: string, duration = 4000) => {
    return toast.custom(
      (id) => (
        <div
          onClick={() => toast.dismiss(id)}
          className="flex items-center gap-3.5 px-4 py-3.5 bg-white rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.14)] border-l-[5px] border-[#E53E3E] cursor-pointer hover:shadow-lg transition-all min-w-[280px] max-w-md pointer-events-auto border-y border-r border-slate-100"
        >
          <div className="w-5 h-5 rounded-full bg-[#E53E3E] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <svg className="w-3 h-3 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-800 leading-snug">{message}</span>
        </div>
      ),
      { duration }
    );
  },

  info: (message: string, duration = 3500) => {
    return toast.custom(
      (id) => (
        <div
          onClick={() => toast.dismiss(id)}
          className="flex items-center gap-3.5 px-4 py-3.5 bg-white rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.14)] border-l-[5px] border-[#3182CE] cursor-pointer hover:shadow-lg transition-all min-w-[280px] max-w-md pointer-events-auto border-y border-r border-slate-100"
        >
          <div className="w-5 h-5 rounded-full bg-[#3182CE] text-white flex items-center justify-center shrink-0 text-xs font-bold font-serif italic shadow-2xs">
            i
          </div>
          <span className="text-sm font-semibold text-slate-800 leading-snug">{message}</span>
        </div>
      ),
      { duration }
    );
  },

  warn: (message: string, duration = 3500) => {
    return toast.custom(
      (id) => (
        <div
          onClick={() => toast.dismiss(id)}
          className="flex items-center gap-3.5 px-4 py-3.5 bg-white rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.14)] border-l-[5px] border-[#ECC94B] cursor-pointer hover:shadow-lg transition-all min-w-[280px] max-w-md pointer-events-auto border-y border-r border-slate-100"
        >
          <div className="w-5 h-5 rounded-full bg-[#ECC94B] text-white flex items-center justify-center shrink-0 text-xs font-black font-mono shadow-2xs">
            !
          </div>
          <span className="text-sm font-semibold text-slate-800 leading-snug">{message}</span>
        </div>
      ),
      { duration }
    );
  },

  loading: (message: string) => {
    return toast.custom((id) => (
      <div
        onClick={() => toast.dismiss(id)}
        className="flex items-center gap-3.5 px-4 py-3.5 bg-white rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.14)] border-l-[5px] border-[#3182CE] cursor-pointer hover:shadow-lg transition-all min-w-[280px] max-w-md pointer-events-auto border-y border-r border-slate-100"
      >
        <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-[#3182CE] animate-spin shrink-0" />
        <span className="text-sm font-semibold text-slate-800 leading-snug">{message}</span>
      </div>
    ));
  },

  dismiss: (id?: string | number) => toast.dismiss(id),
};
