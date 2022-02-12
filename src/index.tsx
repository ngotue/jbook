import { useEffect, useRef, useState } from "react"
import ReactDOM from 'react-dom'
import * as esbuild from 'esbuild-wasm'

const App = () => {
    const [input, setInput] = useState('')
    const [code, setCode] = useState('')
    const transpiler = useRef<any>()

    const startService = async () => {
        transpiler.current = await esbuild.startService({
            worker: true,
            wasmURL: '/esbuild.wasm'
        })
    }

    const transpile = async () => {
        if(!transpiler.current) return 
        const res = await transpiler.current.transform(input, {loader : 'jsx', target: 'es2015'})
        setCode(res.code)
    }

    useEffect(()=> {
        startService()
    }, [])

    const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>)=> {
        setInput(event.target.value)
    }
    return <div>
        <textarea value={input} onChange={onChange}></textarea>
        <button onClick={transpile}>Click</button>
        <p>{code}</p>
    </div>
}

ReactDOM.render(<App/>, document.querySelector('#root'))