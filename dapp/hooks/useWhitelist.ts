import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useWhitelist = (account: string | null | undefined) => {
  const { data, error } = useSWR(
    account ? `/api/whitelist/${account}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  return [data?.signature, error];
};
