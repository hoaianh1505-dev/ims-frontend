import { toast } from 'sonner';

export const showToast = {
  success: (message: string, duration = 3500) => {
    return toast.custom(
      (id) => (
        <div
          onClick={() => toast.dismiss(id)}
          className="flex items-center gap-3 px-4 py-3 bg-white rounded-[4px] shadow-[0_3px_12px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)] border-l-[5px] border-[#6EC058] cursor-pointer hover:shadow-[0_6px_18px_rgba(0,0,0,0.15)] transition-shadow min-w-[270px] max-w-sm select-none pointer-events-auto"
        >
          <div className="w-[22px] h-[22px] rounded-full bg-[#6EC058] text-white flex items-center justify-center shrink-0">
            <svg
              className="w-3.5 h-3.5 stroke-[3.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-[14.5px] font-medium text-[#2E384D] leading-snug">
            {message}
          </span>
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
          className="flex items-center gap-3 px-4 py-3 bg-white rounded-[4px] shadow-[0_3px_12px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)] border-l-[5px] border-[#D14343] cursor-pointer hover:shadow-[0_6px_18px_rgba(0,0,0,0.15)] transition-shadow min-w-[270px] max-w-sm select-none pointer-events-auto"
        >
          <div className="w-[22px] h-[22px] rounded-full bg-[#D14343] text-white flex items-center justify-center shrink-0">
            <svg
              className="w-3 h-3 stroke-[3.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="text-[14.5px] font-medium text-[#2E384D] leading-snug">
            {message}
          </span>
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
          className="flex items-center gap-3 px-4 py-3 bg-white rounded-[4px] shadow-[0_3px_12px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)] border-l-[5px] border-[#1070CA] cursor-pointer hover:shadow-[0_6px_18px_rgba(0,0,0,0.15)] transition-shadow min-w-[270px] max-w-sm select-none pointer-events-auto"
        >
          <div className="w-[22px] h-[22px] rounded-full bg-[#1070CA] text-white flex items-center justify-center shrink-0 text-xs font-serif font-bold italic">
            i
          </div>
          <span className="text-[14.5px] font-medium text-[#2E384D] leading-snug">
            {message}
          </span>
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
          className="flex items-center gap-3 px-4 py-3 bg-white rounded-[4px] shadow-[0_3px_12px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)] border-l-[5px] border-[#F5A623] cursor-pointer hover:shadow-[0_6px_18px_rgba(0,0,0,0.15)] transition-shadow min-w-[270px] max-w-sm select-none pointer-events-auto"
        >
          <div className="w-[22px] h-[22px] rounded-full bg-[#F5A623] text-white flex items-center justify-center shrink-0 text-xs font-bold leading-none">
            !
          </div>
          <span className="text-[14.5px] font-medium text-[#2E384D] leading-snug">
            {message}
          </span>
        </div>
      ),
      { duration }
    );
  },

  loading: (message: string) => {
    return toast.custom((id) => (
      <div
        onClick={() => toast.dismiss(id)}
        className="flex items-center gap-3 px-4 py-3 bg-white rounded-[4px] shadow-[0_3px_12px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)] border-l-[5px] border-[#1070CA] cursor-pointer hover:shadow-[0_6px_18px_rgba(0,0,0,0.15)] transition-shadow min-w-[270px] max-w-sm select-none pointer-events-auto"
      >
        <div className="w-[20px] h-[20px] rounded-full border-2 border-transparent border-t-[#1070CA] border-b-[#1070CA] animate-spin shrink-0" />
        <span className="text-[14.5px] font-medium text-[#2E384D] leading-snug">
          {message}
        </span>
      </div>
    ));
  },

  dismiss: (id?: string | number) => toast.dismiss(id),
};
