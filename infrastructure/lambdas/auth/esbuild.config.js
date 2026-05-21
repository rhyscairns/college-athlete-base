const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node22',
    outfile: 'dist/index.js',
    // pg uses native bindings optionally — mark as external to avoid bundling issues
    external: ['pg-native'],
    minify: false,
    sourcemap: true,
}).catch(() => process.exit(1));
