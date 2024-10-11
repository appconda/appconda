import { createFileRoute } from '@tanstack/react-router'
import { CreateOrganization } from '../pages/create-organization/+page'
import { sdk } from '../sdk';

export const Route = createFileRoute('/create-organization')({
    beforeLoad: async () => {
        try {
            const result = await sdk.account.();
            console.log(result);

        } catch (error) {
           throw redirect({ to: '/login' });
        }
    },
  component: () => <CreateOrganization></CreateOrganization>
})