import React, { createContext, useState, useCallback, type ReactNode } from "react";
import { Modal, type ModalProps } from "./Modal";

// Options passed when opening a dialog
// We omit 'isOpen' and 'onClose' because the provider handles them
export interface DialogOptions extends Omit<ModalProps, "isOpen" | "onClose" | "children"> {
    content: React.ReactNode;
    // You can extend this with specific actions if you want a simplified API e.g.
    // confirmLabel?: string;
    // onConfirm?: () => void;
}

interface DialogContextType {
    openDialog: (options: DialogOptions) => void;
    closeDialog: () => void;
}

export const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<DialogOptions | null>(null);

    const openDialog = useCallback((opts: DialogOptions) => {
        setOptions(opts);
        setIsOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setIsOpen(false);
        // Optional: clear options after animation to avoid flicker, 
        // but keeping them lets the exit animation play with content.
        // We can clear them after a timeout if needed, but usually fine.
    }, []);

    return (
        <DialogContext.Provider value={{ openDialog, closeDialog }}>
            {children}
            {/* Global Modal Instance */}
            {options && (
                <Modal
                    isOpen={isOpen}
                    onClose={closeDialog}
                    title={options.title}
                    size={options.size}
                    footer={options.footer}
                    preventBackdropClick={options.preventBackdropClick}
                    className={options.className}
                >
                    {options.content}
                </Modal>
            )}
        </DialogContext.Provider>
    );
};
