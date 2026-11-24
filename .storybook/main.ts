import type { StorybookConfig } from "@storybook/nextjs-vite";
import { loadEnv, type Plugin } from "vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  framework: "@storybook/nextjs-vite",
  viteFinal: async (viteConfig) => {
    const cartoKey = process.env.CARTO_KEY ?? loadEnv("development", process.cwd(), "").CARTO_KEY;
    const demoTrpc: Plugin = {
      name: "storybook-demo-trpc",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          if (request.url?.startsWith("/api/tiles/")) {
            const pathname = new URL(request.url, "http://localhost").pathname;
            const match = pathname.match(
              /^\/api\/tiles\/(voyager|light_all|dark_all)\/(\d{1,2})\/(\d+)\/(\d+)\.png$/
            );
            if (!match) {
              response.statusCode = 400;
              response.end("Bad request");
              return;
            }
            if (!cartoKey) {
              response.statusCode = 500;
              response.end("CARTO map provider is not configured");
              return;
            }

            const [, style, z, x, y] = match;
            if (!style || !z || !x || !y || +z > 20 || +x >= 2 ** +z || +y >= 2 ** +z) {
              response.statusCode = 400;
              response.end("Bad request");
              return;
            }

            const tile = await fetch(
              `https://basemaps.cartocdn.com/rastertiles/${style}/${z}/${x}/${y}.png?key=${encodeURIComponent(cartoKey)}`
            );
            if (!tile.ok) {
              response.statusCode = 502;
              response.end("Upstream error");
              return;
            }

            response.setHeader("content-type", "image/png");
            response.setHeader("cache-control", "public, max-age=86400, s-maxage=31536000, immutable");
            response.end(new Uint8Array(await tile.arrayBuffer()));
            return;
          }

          if (!request.url?.startsWith("/api/trpc/")) {
            next();
            return;
          }

          const procedure = request.url.split("?")[0]?.slice("/api/trpc/".length);
          const members = [
            {
              userId: "demo-owner",
              tier: "admin",
              slug: "demo-owner",
              displayName: "Alex Morgan",
              avatarUrl: null,
            },
            {
              userId: "demo-member",
              tier: "member",
              slug: "demo-member",
              displayName: "Sam Rivera",
              avatarUrl: null,
            },
          ];
          const result =
            procedure === "viewer.members.get"
              ? { ownerId: "demo-owner", members }
              : procedure === "viewer.members.add"
                ? { userId: "new-demo-member", tier: "member" }
                : procedure === "viewer.members.leave"
                  ? "/"
                  : null;

          response.setHeader("content-type", "application/json");
          response.end(JSON.stringify([{ result: { data: { json: result } } }]));
        });
      },
    };

    viteConfig.plugins ??= [];
    viteConfig.plugins.push(demoTrpc);
    return viteConfig;
  },
};

export default config;
