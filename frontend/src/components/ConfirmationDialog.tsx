import { useEffect } from "react";
import { Icon } from "@iconify/react";

import { dangerButtonClass, secondaryButtonClass } from "../utils/styles";


type ConfirmationDialogProps = {
  confirmLabel: string;
  description: string;
  icon?: string;
  isOpen: boolean;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
};


export function ConfirmationDialog({
  confirmLabel,
  description,
  icon = "mdi:alert-circle-outline",
  isOpen,
  isProcessing,
  onClose,
  onConfirm,
  title,
}: ConfirmationDialogProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isProcessing) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-200">
              <Icon icon={icon} className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="confirmation-dialog-title" className="text-lg font-bold text-slate-950 dark:text-white">
                {title}
              </h2>
              <p
                id="confirmation-dialog-description"
                className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400"
              >
                {description}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={onClose}
              disabled={isProcessing}
            >
              Anulează
            </button>
            <button
              type="button"
              className={`${dangerButtonClass} gap-2`}
              onClick={onConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Icon icon="mdi:check" className="h-4 w-4" aria-hidden="true" />
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
