import { useEffect } from "react";
import useUser from "../Hooks/useUser";
import { useNavigate } from "react-router-dom";

export default function Application() {
    const user = useUser();
    const navigate = useNavigate()
    useEffect(() => {
        if (!user){
            navigate("/login");
        }
    }, [user]);
    return (
        <div>opa eai {user?.name}!</div>
    );
}