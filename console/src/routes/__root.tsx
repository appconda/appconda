import { SignOutButton } from "@appconda/react-sdk";
import { createRootRoute, Outlet, Link, useRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { HStack, ReactView } from 'tuval'

export const Route = createRootRoute({
  component: () => {
    const router = useRouter();

    return (
      <>
        {
          HStack(
            ReactView(
              <div className="p-2 flex gap-2">
                <Link to="/" className="[&.active]:font-bold">
                  Home
                </Link>{' '}
                <Link to="/projects" className="[&.active]:font-bold">
                  Projects
                </Link>
                <SignOutButton onLogOut={() => router.navigate({ to: '/login' })} onError={() => alert('error')}></SignOutButton>
              </div>

            )
          ).height().render()
        }
        <Outlet />
        <TanStackRouterDevtools />
      </>
    )
  },
})