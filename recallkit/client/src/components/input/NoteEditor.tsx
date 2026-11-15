import React from 'react';
import { FileText, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';

export interface NoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const EXAMPLE_NOTES = `A process is a program in execution, representing the fundamental unit of work in modern operating systems. A process includes program code (text section), current activity represented by the program counter and processor registers, a process stack for temporary data (function parameters, return addresses, local variables), and a heap for dynamically allocated memory.

The CPU scheduler selects from among the processes in memory that are ready to execute and allocates the CPU to one of them. Ready processes reside in the ready queue. Schedulers can be preemptive (can interrupt running processes) or non-preemptive (processes run until termination or voluntary wait).

Virtual memory separates user logical memory from physical memory. This allows programs to exceed the size of physical memory. Paging is a memory-management scheme that avoids external fragmentation and the need for contiguous allocation of physical memory. A page table translates logical addresses into physical frame addresses.`;

export const NoteEditor: React.FC<NoteEditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const charCount = value.length;
  const minChars = 50;
  const isTooShort = charCount > 0 && charCount < minChars;

  const handleLoadExample = () => {
    onChange(EXAMPLE_NOTES.trim());
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <label
          htmlFor="notes-input"
          className="text-sm font-bold tracking-[-0.01em] text-[#1b2138] flex items-center gap-2"
        >
          <span className="icon-badge rounded-xl p-2 text-[#4d3ad2]">
            <FileText className="w-4 h-4" />
          </span>
          <span>Your Study Notes or Free-form Text</span>
        </label>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleLoadExample}
            disabled={disabled}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />}
            className="text-[11px] font-semibold tracking-[0.06em] uppercase"
          >
            Load Example
          </Button>

          {value && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="text-xs text-[#6a728d] hover:text-[#ef4444] p-2 rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative editor-shell rounded-[28px] p-2 sm:p-3">
        <textarea
          id="notes-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={9}
          placeholder="Paste lecture notes, textbook chapters, article summaries, or free-form concepts here (min 50 characters)..."
          className={`w-full rounded-[22px] border p-4 text-sm leading-relaxed text-[#1b2138] placeholder-[#7b839d] bg-white/80 shadow-inner resize-y focus:outline-none focus:ring-2 transition-all ${
            isTooShort
              ? 'border-[#f2c66d] focus:border-[#efb01f] focus:ring-[#fef3c7]'
              : 'border-[#dfe5f5] focus:border-[#6b5ef7] focus:ring-[#e7e3ff]'
          }`}
        />

        <div className="flex items-center justify-between text-xs px-2 pb-1 pt-3 text-[#69728d]">
          <div>
            {isTooShort && (
              <span className="text-[#b7750d] font-semibold">
                Need at least {minChars - charCount} more character{minChars - charCount === 1 ? '' : 's'}
              </span>
            )}
            {!value && (
              <span className="text-[#7a819d]">Minimum 50 characters required</span>
            )}
            {charCount >= minChars && (
              <span className="text-[#158d6d] font-semibold">
                Ready to generate
              </span>
            )}
          </div>

          <span
            className={`font-mono text-[11px] ${
              charCount >= minChars ? 'text-[#4b556f]' : 'text-[#7f869d]'
            }`}
          >
            {charCount.toLocaleString()} chars
          </span>
        </div>
      </div>
    </div>
  );
};
