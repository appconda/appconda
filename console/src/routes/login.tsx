import { createFileRoute, redirect } from '@tanstack/react-router';
import { Login } from '../pages/Login';
import { sdk } from '../sdk';

export const Route = createFileRoute('/login')({
  loader: async () => {
    try {
      const user = await sdk.account.get();
      if (user) {
        throw redirect({
          to: '/',
        })
      }
    } catch {

    }
  },

  component: () => <Login />
})

