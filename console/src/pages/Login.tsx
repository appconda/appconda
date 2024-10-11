import { SignIn } from "@appconda/react-sdk";
import { useRouter } from "@tanstack/react-router";

export const Login = () => {

    const router = useRouter();



  

    return (
        <SignIn title="Appconda Console" onSuccess={() => router.navigate({ to: '/' })}></SignIn>
    );
};


