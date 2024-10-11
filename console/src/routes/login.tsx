import { createFileRoute, redirect } from '@tanstack/react-router';
import { Login } from '../pages/Login';
import { sdk } from '../sdk';

export const Route = createFileRoute('/login')({
  loader: async () => {
    const user = await sdk.account.get();
    if (user) {
      throw redirect({
        to: '/',
      })
    }
  },
  
  component: () => <Login />
})

