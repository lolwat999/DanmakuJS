// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'js/app',
    paths: {
        lib: '../lib'
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['lib/game-shim', 'lib/jquery-1.8b1', 'lib/inheritance' ]);