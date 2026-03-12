import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignInForm from "../components/Sigin/SignInForm";

export default function SignInPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            navigate("/");
        }
    }, [navigate]);

    return <SignInForm />;
}
