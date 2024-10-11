
import { useQuery } from '@tanstack/react-query';
import { useAppcondaSdk } from '../../context/Appconda';


export const useGetMe = () => {
    const sdk = useAppcondaSdk();

    const query = useQuery({
        queryKey: ['account', 'get'], queryFn: () => {
            return sdk.account.get();
        }
    })

    return { me: query.data, isLoading: query.isLoading, isError: query.isError, error: query.error as { message: string } }
}