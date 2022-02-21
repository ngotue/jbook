import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import * as esbuild from "esbuild-wasm";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";

const App = () => {
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const transpiler = useRef<any>();

  const startService = async () => {
    transpiler.current = await esbuild.startService({
      worker: true,
      wasmURL: "/esbuild.wasm",
    });
  };

  const transpile = async () => {
    if (!transpiler.current) return;
    const res = await transpiler.current.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(input)],
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
