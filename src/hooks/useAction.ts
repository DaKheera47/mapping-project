import type { ActionClient } from 'astro/actions/runtime/virtual/server.js';
import { useEffect, useState, useMemo } from 'react';

type UseActionResult<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
};

export function useAction<TOutput>(
  action: ActionClient<TOutput, 'json', undefined>,
  params: Record<string, any> = {},
  refresh: boolean = false
): UseActionResult<TOutput> {
  const [data, setData] = useState<TOutput | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const memoizedParams = useMemo(() => params, [params]);
  const memoizedAction = useMemo(() => action, [action]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await memoizedAction(memoizedParams);
        if (result.error) {
          setError(result.error);
        } else {
          setData(result.data);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refresh]);

  return { data, error, loading };
}
