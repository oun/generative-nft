import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useConfig = () => {
  const { data, error } = useSWR(`/api/config`, fetcher);
  return {
    config: data,
    error,
  };
};

export default useConfig;
