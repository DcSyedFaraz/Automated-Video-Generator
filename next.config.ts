import type { NextConfig } from "next";
import { webpack } from "next/dist/compiled/webpack/webpack";

const nextConfig: NextConfig = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // don’t try to bundle ffmpeg’s native bits on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
      };
      config.externals = Array.isArray(config.externals)
        ? [...config.externals, "@ffmpeg-installer/ffmpeg"]
        : [config.externals, "@ffmpeg-installer/ffmpeg"];

      // **ignore** all @ffmpeg-installer/*/package.json requires
      config.plugins?.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /@ffmpeg-installer\/.*\/package\.json$/,
        })
      );
    }
    return config;
  },
};

export default nextConfig;
