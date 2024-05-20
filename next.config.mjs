/** @type {import('next').NextConfig} */
// next.config.js

const nextConfig = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.wasm$/,
            type: "javascript/auto",
            use: [
                {
                    loader: "file-loader",
                    options: {
                        publicPath: "/_next/static/wasm/",
                        outputPath: "static/wasm/",
                        name: "[name].[ext]",
                    },
                },
            ],
        });

        return config;
    },
    async headers() {
        return [
            {
                source: "/_next/static/wasm/:path*",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "*",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
