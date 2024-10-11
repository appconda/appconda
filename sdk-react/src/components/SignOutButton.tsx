import React from "react"
import { useAppconda } from "../context/Appconda"


export const SignOutButton = ({ onLogOut, onError }) => {
    const appconda = useAppconda();

    const sigOut = async () => {
        try {
            await appconda.account.deleteSession('current');
            onLogOut?.();
        }
        catch(e) {
            onError(e)
        }
    }
    return (
        <button onClick={sigOut}>Sign out</button>
    )
}