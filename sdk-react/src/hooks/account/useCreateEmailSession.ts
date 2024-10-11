import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppconda } from "../../context/Appconda";
import { Models } from "../../models";


/**
 * Hook to create an email session for a user.
 * 
 * This hook allows you to create a session for a user using their email and password.
 * It uses the Appconda SDK to create the session and then invalidates the 'accounts' query
 * to refetch the updated data.
 * @returns An object containing the `createEmailSession` function, as well as the mutation state.
 */
export const useCreateEmailSession = () => {
    const queryClient = useQueryClient();
    const sdk = useAppconda();
    
    const mutation = useMutation({
        mutationFn: ({ email, password }: { email: string, password: string }) => {
            return sdk.account.createEmailPasswordSession(email, password);
        },
        onSuccess: (data: Models.Session) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        }
    })

    const createEmailSession = (
        { email, password }: {
            /**
             * The email address of the account.
             */
            email: string,
            /**
             * The password of the account.
             */
            password: string
        },
        onSuccess: (data: Models.Session) => void = void 0
    ) => {
        mutation.mutate({ email, password },
            {
                onSuccess: (data) => {
                    onSuccess(data);
                }
            });
    }
    return {
        createEmailSession,
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error as { message: string }
    }
}