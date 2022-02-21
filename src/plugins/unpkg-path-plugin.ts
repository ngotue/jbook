import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localforage from "localforage";

const fileCache = localforage.createInstance({name: 'filecache'})

export const unpkgPathPlugin = (input: string) => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log("onResolve ::", args);
        if (args.path === "index.js")
          return { path: args.path, namespace: "a" };
        else if (/^https:\/\/unpkg.com/.test(args.importer)) {
          const link = new URL(args.path, 'https://unpkg.com'+args.resolveDir + '/');
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
            contents: input,
          };
        }

        const cacheResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path)
        if(cacheResult) {
          return cacheResult
        }

        const { data, request } = await axios.get(args.path);
        const result = {
          loader: "jsx",
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname
        } as esbuild.OnLoadResult
        fileCache.setItem(args.path, result)
        return result;
      });
    },
  };
};
