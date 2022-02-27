import axios from "axios";
import * as esbuild from "esbuild-wasm";
import localforage from "localforage";

const fileCache = localforage.createInstance({ name: "filecache" });

export const fetchPlugin = (input: string) => {
  return {
    name: "fetch-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /^index\.js/ }, () => {
        return {
          loader: "jsx",
          contents: input,
        };
      });
    build.onLoad({filter: /.*/},async (args)=>{
        const cacheResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );
        if (cacheResult) {
          return cacheResult;
        }
        return null
    })
      build.onLoad({ filter: /.css$/ }, async (args) => {
        
        const { data, request } = await axios.get(args.path);
        const escaped = data
          .replace(/\n/g, "")
          .replace(/"/g, '\\"')
          .replace(/'/, "\\'");
        const result = {
          loader: "jsx",
          contents: escaped,
          resolveDir: new URL("./", request.responseURL).pathname,
        } as esbuild.OnLoadResult;
        fileCache.setItem(args.path, result);
        return result;
      });
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);

        const result = {
          loader: "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname,
        } as esbuild.OnLoadResult;
        fileCache.setItem(args.path, result);
        return result;
      });
    },
  };
};
