import { useEffect } from "react";
import useUser from "../Hooks/useUser";
import { useNavigate } from "react-router-dom";
import Loading from "../Components/Loading/Loading";

export default function Application() {
    const user = useUser();
    const navigate = useNavigate()
    useEffect(() => {
        if (!user){
            navigate("/login");
        }
    }, [user]);

    if(user){
        return (
            <div>opa eai {user?.name}!</div>
        );
    } else {
        return <Loading/>
    }

}