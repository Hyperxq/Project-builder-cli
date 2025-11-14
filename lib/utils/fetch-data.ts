import axios from 'axios';
import { logger } from '.';

export async function fetchData<Response = any>(
  url: string,
  query?: string,
): Promise<Response> {
  try {
    const { data } = await axios.get<Response>(
      `${url}${query ? '?' + query : ''}`,
    );

    return data;
  } catch (error) {
    logger.error('Trying to fetching data occurred something:', [
      error.message,
      url,
    ]);
    process.exit(1);
  }
}
