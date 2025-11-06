

import { useLocation } from "react-router-dom";

import { SignInContent } from "../components/authentication/signIn";


export function Authentication() {
    const location = useLocation();

    return(
        <>
        {location.pathname === '/signIn' && (<SignInContent/>)}
      
        </>
    )
}