import { createFileRoute, redirect } from '@tanstack/react-router'
import { sdk } from '../sdk';





export const Route = createFileRoute('/profile')({
    beforeLoad: async () => {
        try {
            const result = await sdk.account.get();
            console.log(result);

        } catch (error) {
           throw redirect({ to: '/login' });
        }
    },
  component: () => <div>Hello /profile!</div>
})