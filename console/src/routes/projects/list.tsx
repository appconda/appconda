import { createFileRoute } from '@tanstack/react-router'
import { sdk } from '../../sdk';

export const Route = createFileRoute('/projects/list')({

  loader: async () => {
     await sdk.projects.list();
    
  },
  
  component: () => <div>Hello /projects/projects!</div>
})