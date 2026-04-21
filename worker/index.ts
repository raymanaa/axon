/// <reference types="@cloudflare/workers-types" />

export default {
  async fetch(request: Request, env: { ASSETS: Fetcher }): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
};
