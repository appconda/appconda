import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppconda } from "../../context/Appconda";
import { Models } from "../../models";

/**
 * This hook facilitates the process of sending a verification email to users, ensuring they are the rightful owners of the provided email address. 
 * It utilizes the userId and secret as query parameters in the URL that will be included in the verification email. 
 * The specified URL should guide the user back to your application, enabling the completion of the verification by checking 
 * the userId and secret parameters. For further details on the verification process, refer to the documentation. 
 * The verification link sent to the user's email remains valid for a duration of 7 days.
 * To prevent Redirect Attacks, only redirect URLs from domains specified in your platform settings within the console are permitted.
 */


export const useCreateEmailVerification = (projectId: string) => {
    const queryClient = useQueryClient();
    const sdk = useAppconda();

    const mutation = useMutation({
        mutationFn: ({ url }: { url: string }) => {
            return sdk.account.createVerification(url);
        },
        onSuccess: (data: Models.Token) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        }
    })

    const createVerification = (
        { url }: {
            /**
             * The email address of the account.
             */
            url: string
        },
        onSuccess: (data: Models.Token) => void = void 0
    ) => {
        mutation.mutate({ url },
            {
                onSuccess: (data) => {
                    onSuccess(data);
                }
            });
    }
    return {
        createVerification,
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error as { message: string }
    }
}