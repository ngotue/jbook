import { useState } from "react"
import ReactDOM from 'react-dom'

const App = () => {
    const [input, setInput] = useState('')
    const [code, setCode] = useState('')
    const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>)=> {
        setInput(event.target.value)
        console.log(input)
    }
    return <div>
        <textarea value={input} onChange={onChange}></textarea>
    </div>
}

ReactDOM.render(<App/>, document.querySelector('#root'))