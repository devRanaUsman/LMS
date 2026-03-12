import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-10 h-10 text-red-600" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">Page Not Found</h1>
                    <p className="text-slate-500">
                        Page not found 404
                    </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
