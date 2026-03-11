"use client";

import { cn } from "@/shared/lib/cn";
import { useMemo, useRef } from "react";

type OtpInputProps = {
  id: string;
  value: string;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  onChange: (value: string) => void;
};

export function OtpInput({ id, value, length = 4, disabled = false, invalid = false, onChange }: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(
    () => Array.from({ length }, (_, index) => value[index] ?? ""),
    [length, value],
  );

  const focusInput = (index: number) => {
    const target = inputRefs.current[index];
    if (!target) {
      return;
    }

    target.focus();
    target.select();
  };

  const updateDigits = (nextDigits: string[]) => {
    onChange(nextDigits.join("").slice(0, length));
  };

  const applyDigits = (startIndex: number, rawValue: string) => {
    const sanitizedValue = rawValue.replace(/\D/g, "");

    if (!sanitizedValue) {
      const nextDigits = [...digits];
      nextDigits[startIndex] = "";
      updateDigits(nextDigits);
      return;
    }

    const nextDigits = [...digits];
    let cursor = startIndex;

    for (const digit of sanitizedValue) {
      if (cursor >= length) {
        break;
      }

      nextDigits[cursor] = digit;
      cursor += 1;
    }

    updateDigits(nextDigits);

    if (cursor >= length) {
      focusInput(length - 1);
      return;
    }

    focusInput(cursor);
  };

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3" role="group" aria-labelledby={`${id}-label`}>
      {digits.map((digit, index) => (
        <input
          key={`${id}-${index}`}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          id={index === 0 ? id : `${id}-${index}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          enterKeyHint={index === length - 1 ? "done" : "next"}
          maxLength={1}
          disabled={disabled}
          value={digit}
          aria-label={`OTP digit ${index + 1}`}
          aria-invalid={invalid}
          className={cn(
            "field-input h-14 rounded-2xl px-0 text-center text-lg font-semibold tracking-[0.12em] sm:h-16 sm:text-xl",
            "touch-manipulation",
            invalid ? "border-[#b42318] focus-visible:ring-[#b42318]/20" : undefined,
          )}
          onChange={(event) => {
            applyDigits(index, event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digits[index] && index > 0) {
              event.preventDefault();
              focusInput(index - 1);
              return;
            }

            if (event.key === "ArrowLeft" && index > 0) {
              event.preventDefault();
              focusInput(index - 1);
              return;
            }

            if (event.key === "ArrowRight" && index < length - 1) {
              event.preventDefault();
              focusInput(index + 1);
            }
          }}
          onFocus={(event) => {
            event.target.select();
          }}
          onPaste={(event) => {
            event.preventDefault();
            applyDigits(index, event.clipboardData.getData("text"));
          }}
        />
      ))}
    </div>
  );
}
