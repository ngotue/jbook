import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import * as esbuild from "esbuild-wasm";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";

const App = () => {
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const transpiler = useRef<any>();

  const startService = async () => {
    transpiler.current = await esbuild.startService({
      worker: true,
      wasmURL: "https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm",
    });
  };

  const transpile = async () => {
    if (!transpiler.current) return;
    const res = await transpiler.current.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(input), fetchPlugin(input)],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
    });
    setCode(res.outputFiles[0].text);
  };

  useEffect(() => {
    startService();
  }, []);

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };
  return (
    <div>
      <textarea value={input} onChange={onChange}></textarea>
      <button onClick={transpile}>Click</button>
      <p>{code}</p>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
