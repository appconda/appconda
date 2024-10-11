import { createFileRoute, Link, Outlet } from '@tanstack/react-router'


export const Route = createFileRoute('/projects')({
  
  component: () => 
    <>
    
  <div className="p-2 flex gap-2">
    <Link to="/" className="[&.active]:font-bold">
      Home
    </Link>{' '}
    <Link to="/projects/list" className="[&.active]:font-bold">
      Projects
    </Link>
  </div>
  <hr />
  <Outlet />
</>
})