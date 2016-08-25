const NODE_ENV = process.env.NODE_ENV || 'development';
const dotenv = require('dotenv');

const webpack = require('webpack');
const path = require('path');

const join = path.join;
const resolve = path.resolve;

const getConfig = require('hjs-webpack');

const isDev = NODE_ENV === 'development';
const isTest = NODE_ENV === 'test';

// devServer config
const devHost = process.env.HOST || 'localhost';
const devPort = process.env.PORT || 3000;

const setPublicPath = process.env.SET_PUBLIC_PATH !== 'false';
const publicPath = (isDev && setPublicPath) ? `//${devHost}:${devPort}/` : '';

const root = resolve(__dirname);
const src = join(root, 'src');
const modules = join(root, 'node_modules');
const dest = join(root, 'dist');
const css = join(src, 'styles');

// NOTE: we are not using hjs dev server, so we have hot turned off even though it
// gets turned on when we call webpack-dev-server CLI (see package.json build command)
var config = getConfig({
    isDev: isDev,
    in: join(src, 'app.js'),
    out: dest,
    html: function (context) {
        return {
            'index.html': context.defaultTemplate({
                title: 'FretboardTest',
                publicPath,
                meta: {}
            })
        };
    },
    devServer: {
        historyApiFallback:false,
        hot:false,
        noInfo:false
    }
});

// ENV variables
const dotEnvVars = dotenv.config();
const environmentEnv = dotenv.config({
    path: join(root, 'config', `${NODE_ENV}.config.js`),
    silent: true
});
const envVariables =
    Object.assign({}, dotEnvVars, environmentEnv);

const defines =
    Object.keys(envVariables)
        .reduce((memo, key) => {
            const val = JSON.stringify(envVariables[key]);
            memo[`__${key.toUpperCase()}__`] = val;
            return memo;
        }, {
            __NODE_ENV__: JSON.stringify(NODE_ENV),
            __DEBUG__: isDev
        });

config.plugins = [
    new webpack.DefinePlugin(defines)
].concat(config.plugins);
// END ENV variables

// START CONFIG FOR CSS MODULES
// const cssModulesNames = `${isDev ? '[path][name]__[local]__' : ''}[hash:base64:5]`;
//
// const matchCssLoaders = /(^|!)(css-loader)($|!)/;
//
// const findLoader = (loaders, match) => {
//     const found = loaders.filter(l => l && l.loader && l.loader.match(match));
//     return found ? found[0] : null;
// };

// existing css loader
// const cssloader =
//     findLoader(config.module.loaders, matchCssLoaders);

// const newloader = Object.assign({}, cssloader, {
//     test: /\.module\.css$/,
//     include: [src],
//     loader: cssloader.loader.replace(matchCssLoaders, `$1$2?modules&localIdentName=${cssModulesNames}$3`)
// });

//config.module.loaders.push(newloader);

//cssloader.test = new RegExp(`[^module]${cssloader.test.source}`);
//cssloader.loader = newloader.loader;

// config.module.loaders.push({
//     test: /\.css$/,
//     include: [modules],
//     loader: 'style!css'
// });
// END CONFIG FOR CSS MODULES

// for font-awesome;
const fontAwesomeLoaders = [
    { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
    { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
];

config.module.loaders.push.apply(this,fontAwesomeLoaders);

config.module.loaders.push(
    {
        test: /bootstrap-sass[\/\\]assets[\/\\]javascripts[\/\\]/,
        loader: 'imports?jQuery=jquery'
    }
);


config.entry.push('bootstrap-loader');

config.entry.push('font-awesome-webpack');



// CSS modules

// postcss
config.postcss = [].concat([
    require('precss')({}),
    require('autoprefixer')({}),
    require('cssnano')({})
]);

// END postcss

// Roots
config.resolve.root = [src, modules];
config.resolve.alias = {
    css: join(src, 'styles'),
    containers: join(src, 'containers'),
    components: join(src, 'components'),
    utils: join(src, 'utils'),
    styles: join(src, 'styles'),
    reducers: join(src, 'redux/modules'),
    features: join(src, 'features')
};
// end Roots

// Dev
if (isDev) {
    config.devServer.port = devPort;
    config.devServer.hostname = devHost;

    // force hot module reloader to hit absolute path so it can load
    // from dev server
    config.output.publicPath = "http://localhost:3000/";
}

// Testing
if (isTest) {
    config.externals = {
        'react/addons': true,
        'react/lib/ReactContext': true,
        'react/lib/ExecutionEnvironment': true
    };

    config.module.noParse = /[/\\]sinon\.js/;
    config.resolve.alias.sinon = 'sinon/pkg/sinon';

    config.plugins = config.plugins.filter(p => {
        const name = p.constructor.toString();
        const fnName = name.match(/^function (.*)\((.*\))/);

        const idx = [
            'DedupePlugin',
            'UglifyJsPlugin'
        ].indexOf(fnName[1]);
        return idx < 0;
    });
}
// End Testing


config.devtool = "inline-source-map";

module.exports = config;