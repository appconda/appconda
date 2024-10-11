import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Button, Input } from "@mantine/core";
import { sdk } from "../sdk";
import { SignIn } from "@appconda/react-sdk";

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Simple validation
        if (!email || !password) {
            setErrorMessage("Please fill in both fields.");
            return;
        }

        try {
            await sdk.account.createEmailPasswordSession(email, password);
            router.navigate({ to: '/profile' });

        } catch (error: any) {
            console.log(error.message);
            setErrorMessage(error.message);
        }
    };

    const onTranslateButtonClick = async (): Promise<void> => {



        try {
            const created = await sdk.account.create('mert', 'mert@example.com', 'AAA123bbb');
            console.log(created);
        } catch (error) {
            setErrorMessage("An error occurred. Please try again.");
        }


    };

    return (
        <SignIn title="Appconda Console" onSuccess={() => router.navigate({ to: '/' })}></SignIn>
    );
};


