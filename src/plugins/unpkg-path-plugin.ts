import * as esbuild from "esbuild-wasm";
import axios from "axios";

export const unpkgPathPlugin = () => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResolve ::', args)
        if (args.path === "index.js")
          return { path: args.path, namespace: "a" };
        else if (/^https:\/\/unpkg.com/.test(args.importer)) {
          const link = new URL(args.path, args.importer+'/')
          return {
            namespace: "a",
            path: link.href,
          };
        } else {
          return {
            path: `https://unpkg.com/${args.path}`,
            namespace: "a",
          };
        }
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {

        if (args.path === "index.js") {
          return {
            loader: "jsx",
            contents: `
              import message from 'nested-test-pkg';
              console.log(message);
            `,
          };
        }
        const { data } = await axios.get(args.path);
        return {
          loader: "jsx",
          contents: data,
        };
      });
    },
  };
};
