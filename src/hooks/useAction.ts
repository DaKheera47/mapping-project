import type { ActionClient } from 'astro/actions/runtime/virtual/server.js';
import { useEffect, useState } from 'react';

type UseActionResult<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
};

export function useAction<TOutput>(
  action: ActionClient<TOutput, 'json', undefined>,
  params: Record<string, any> = {}
): UseActionResult<TOutput> {
  const [data, setData] = useState<TOutput | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await action(params);
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
  }, [action, params]);

  return { data, error, loading };
}
