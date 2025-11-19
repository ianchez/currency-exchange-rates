import './App.css'

import { incrementByAmount, increment } from './redux/slices/counterSlice'
import { useAppDispatch, useAppSelector } from './redux/hooks'


function App() {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()

  const setCount = (value?: number) => {
    if (value) {
      dispatch(incrementByAmount(value))
    } else {
      dispatch(increment())
    }
  }

  return (
    <>
      <h1>Title</h1>
      <div className="card">
        <button onClick={() => setCount()}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <p className="info">
        Learn more
      </p>
    </>
  )
}

export default App
