({
    appDir: "../",
    baseUrl: "js/",
    dir: "../../app-build",
    //Comment out the optimize line if you want
    //the code minified by UglifyJS
    //optimize: "none",

    paths: {
        "jquery": "empty:"
    },

    modules: [
        //Optimize the application files. jQuery is not 
        //included since it is already in require-jquery.js
        {
            name: "main"
        }
    ],
    optimize : "uglify"
})
/**
cd app/js
node ../../r.js -o app.build.js

node ../../r.js -o name=main excludeShallow=two out=../../app-build/js/require.js baseUrl=.

//just the main
node ../../r.js -o name=main out=../../app-build/js/main.js baseUrl=.


*/