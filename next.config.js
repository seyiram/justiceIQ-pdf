/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        path: require.resolve("path-browserify")
      };
      return config;
    },
   };
   
   module.exports = nextConfig;