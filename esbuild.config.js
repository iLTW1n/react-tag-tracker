import esbuild from 'esbuild';

const shared = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  sourcemap: true,
  minify: true,
  external: ['react', 'react-dom'],
  target: ['es2018'],
  drop: ["console"],
};

async function build() {
  // ESM
  await esbuild.build({
    ...shared,
    format: 'esm',
    outfile: 'dist/index.js',
  });

  // CommonJS
  await esbuild.build({
    ...shared,
    format: 'cjs',
    outfile: 'dist/index.cjs',
  });

  console.log('✅ Build complete');
}

build();
