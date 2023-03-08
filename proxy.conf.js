const PROXY_CONFIG =
{
    "/api/*": {
        target: "https://api.blockfiles.io/",
        secure: false,
        logLevel: "debug",
        changeOrigin: false,
        bypass: function (req, res, proxyOptions) {
            req.headers["host"] = "api.blockfiles.io";
        },
        pathRewrite: {
            "^/api/": "/v1/"
        }
    },
    "/beta/api/*": {
        target: "http://localhost:8080/",
        secure: false,
        logLevel: "debug",
        changeOrigin: false,
        pathRewrite: {
            "^/beta/api/": "/v1/"
        }
    }
};

module.exports = PROXY_CONFIG;
