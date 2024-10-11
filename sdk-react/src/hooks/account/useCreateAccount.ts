import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppcondaSdk } from "../../context/Appconda";
import { ID, Models } from "@appconda/web-sdk";


export const useCreateAccount = (projectId: string) => {
    const queryClient = useQueryClient();
    const sdk = useAppcondaSdk();

    const mutation = useMutation({
        mutationFn: ({ name, email, password }: { name: string, email: string, password: string}) => {
            
            return sdk.account.create(ID.unique(), email, password, name)
        },
        onSuccess: <Preferences extends Models.Preferences>(data: Models.Account<Preferences>) => {
            // Invalidate and refetch

            queryClient.invalidateQueries({ queryKey: ['account'] });
        }
    })

    const createAccount = (
        { name, email, password, organizationId }: {
            /**
             * The name of the account.
             */
            name: string,
            /**
             * The email address of the account.
             */
            email: string,
            /**
             * The password of the account.
             */
            password: string,
            organizationId?: string
        },
        onSuccess: <Preferences extends Models.Preferences>(data: Models.Account<Preferences>) => void = void 0
    ) => {
        mutation.mutate({ name, email, password, organizationId },
            {
                onSuccess: (data) => {
                    onSuccess(data);
                }
            });
    }
    return {
        createAccount,
        isLoading: mutation.isLoading,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error as { message: string }
    }
}