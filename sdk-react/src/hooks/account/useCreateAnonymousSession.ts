import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppconda} from "../../context/Appconda";

/**
 * Hook to create an anonymous session.
 * 
 * This hook allows you to create an anonymous session using the Appconda SDK.
 * It invalidates the 'accounts' query to refetch the updated data after a successful session creation.
 * @returns An object containing the `createAnonymousSession` function, as well as the mutation state.
 */
export const useCreateAnonymousSession = () => {
    const queryClient = useQueryClient();
    const sdk = useAppconda();
    
    const mutation = useMutation({
        mutationFn: () => {
            return  sdk.account.createAnonymousSession()
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        }
    })

    const createAnonymousSession = (
        onSuccess: () => void = void 0
    ) => {
        mutation.mutate(null,
            {
                onSuccess: () => {
                    onSuccess();
                }
            });
    }
    return {
        createAnonymousSession,
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error as { message: string }
    }
}