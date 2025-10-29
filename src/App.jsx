import Timer from "./components/Timer";
import Layout from "./components/Layout";
import Menu from "./components/Menu";


function App() {
  return (
    
    <div className="p-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Sliding Puzzle Progress Demo</h1>
      <Timer />
      <h1 ClassName= "text-2xl font-bold mb-5">Menu Demo</h1>
      <Menu />
      <h1 ClassName= "text-2xl font-bold mb-5">Puzzle Grids</h1>
      <Layout />
    </div>
  );
}

export default App;

