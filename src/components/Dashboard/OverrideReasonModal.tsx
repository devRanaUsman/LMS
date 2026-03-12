import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

interface OverrideReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title?: string;
}

export function OverrideReasonModal({ isOpen, onClose, onConfirm, title = "Override Locked Attendance" }: OverrideReasonModalProps) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (!reason.trim()) {
            setError("A valid reason is required for audit logs.");
            return;
        }
        onConfirm(reason);
        setReason("");
        setError("");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-sm text-amber-800">
                    <strong>Warning:</strong> This attendance record is locked. Modifications will be digitally signed and recorded in the audit logs.
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Change <span className="text-red-500">*</span></label>
                    <textarea
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        placeholder="Explain why you are modifying locked data (e.g., 'Correction of teacher error', 'System glitch')..."
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            setError("");
                        }}
                    />
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm"
                    >
                        Confirm Override
                    </button>
                </div>
            </div>
        </Modal>
    );
}
