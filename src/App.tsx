import { CoddingWindows } from './components/CoddingWindows'
import logo from './assets/draw.svg'
function App() {
    return (
        <div className="flex flex-col h-full justify-center items-center">
            <div className="flex justify-center p-4">
                <img src={logo} className="w-20" />
            </div>
            <CoddingWindows />
        </div>
    )
}
export default App
