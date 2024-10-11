import { createFileRoute, redirect } from "@tanstack/react-router";
import { Home } from "../pages/Home";
import { sdk } from "../sdk";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
        try {
            const result = await sdk.account.get();
            console.log(result);

        } catch (error) {
           throw redirect({ to: '/login' });
        }
    },
	component: Home,
});
