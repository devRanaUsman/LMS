import { useState } from "react";
import { Modal } from "../ui/Modal";
import { useDialog } from "../ui/useDialog";

export default function DialogDemo() {
    // 1. Controlled State usage
    const [isLocalOpen, setIsLocalOpen] = useState(false);

    // 2. Global Hook usage
    const { openDialog, closeDialog } = useDialog();

    const handleGlobalConfirm = () => {
        openDialog({
            title: "Transformation Complete",
            size: "sm",
            content: (
                <div className="text-center py-4">
                    <div className="text-5xl mb-4">✨</div>
                    <p>The operation was successful. Global state is working perfectly.</p>
                </div>
            ),
            footer: (
                <button
                    onClick={closeDialog}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                    Awesome!
                </button>
            )
        });
    };

    const handleGlobalDelete = () => {
        openDialog({
            title: "Delete Account?",
            size: "md",
            preventBackdropClick: true,
            content: (
                <p className="text-gray-600">
                    Are you sure you want to delete your account? This action cannot be undone.
                </p>
            ),
            footer: (
                <>
                    <button
                        onClick={closeDialog}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            alert("Deleted!");
                            closeDialog();
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Delete Permanently
                    </button>
                </>
            )
        });
    };

    return (
        <div className="p-10 space-y-12 max-w-4xl mx-auto">
            <header className="border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900">Unified Dialog System</h1>
                <p className="text-gray-500 mt-2">Demonstrating both Controlled and Global Modal patterns.</p>
            </header>

            {/* Section A: Controlled */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-l-4 border-indigo-500 pl-3">A) Controlled Mode</h2>
                <p className="text-gray-600">
                    Managed by local component state (<code>useState</code>). Best for complex forms or when you need tight coupling with local state.
                </p>

                <button
                    onClick={() => setIsLocalOpen(true)}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition transform active:scale-95"
                >
                    Open Controlled Modal
                </button>

                {/* The Modal Component itself */}
                <Modal
                    isOpen={isLocalOpen}
                    onClose={() => setIsLocalOpen(false)}
                    title="Local Component State"
                    size="md"
                    footer={
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsLocalOpen(false)}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                            >
                                Understood
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            This modal is controlled by <code>isLocalOpen</code> state in the parent component.
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-500">
                            <li>Supports <b>ESC</b> key to close</li>
                            <li>Locks body scroll automatically</li>
                            <li>Smooth entrance/exit animations</li>
                            <li>Traps focus (basic)</li>
                        </ul>
                    </div>
                </Modal>
            </section>

            {/* Section B: Global */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-l-4 border-pink-500 pl-3">B) Global Manager (Hook)</h2>
                <p className="text-gray-600">
                    Managed via <code>useDialog()</code> hook. Best for alerts, confirmations, and generic messages triggered from anywhere.
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={handleGlobalConfirm}
                        className="px-6 py-2.5 bg-pink-600 text-white rounded-lg shadow-lg shadow-pink-200 hover:bg-pink-700 transition transform active:scale-95"
                    >
                        Trigger Success Dialog
                    </button>

                    <button
                        onClick={handleGlobalDelete}
                        className="px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                        Trigger Destructive Dialog
                    </button>
                </div>
            </section>
        </div>
    );
}
