import esbuild from "esbuild";

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  sourcemap: true,
  external: ["react", "react-dom"],
};

async function build() {
  await esbuild.build({
    ...sharedConfig,
    format: "esm",
    outfile: "dist/index.js"
  });

  console.log("✅ Build complete!");
}

build();