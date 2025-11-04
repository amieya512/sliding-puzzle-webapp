import React from 'react'
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();
    return(
        
        <div className= "text-center">
            <nav>
            <div className= "flex flex-col space-y-100">
            <h2 className= "text-l font-semibold" >Play a Puzzle!</h2>
            <h2 className= "text-l font-semibold" >Puzzles Completed: 25/50</h2></div>
            <h1 className= "text-m font-semibold">Current Size: 3x3</h1>
            <h1 className= "text-m font-semibold">Requirements to unlock next puzzle: Solve 25 more puzzles to unlock 4x4 puzzles</h1>
            <div className= "flex gap-7"></div>
            <button onClick = {() => alert("Change Size")}
                className = "bg-blue-500 hover:bg-blue-700 text-white font-bold px-3 py-3 rounded">
                Change Size
            </button>
            
            <div className= "flex flex-col space-y-7"></div>
            <h1 className= "text-m font-semibold">Note: Guests will not be able to save data such as progress,
                custom images for puzzles, high scores and other statistics.</h1>

            <div className= "flex justify-center">
            <div className= "flex gap-7">
            <button onClick = {() => navigate("/Puzzle") }
                className = "bg-green-500 hover:bg-green-700 text-white font-bold px-3 py-3 rounded">
                Start Puzzle
            </button>

            <button onClick = {() => alert("My Stats")}
                className = "bg-purple-500 hover:bg-purple-700 text-white font-bold px-3 py-3 rounded">
                My Stats
            </button>

            <button onClick = {() => navigate("/Puzzle") }
                className = "bg-yellow-500 hover:bg-yellow-700 text-white font-bold px-3 py-3 rounded">
                Create Puzzle
            </button>
                </div>
                </div>
            
            <div className= "flex flex-col space-y-7"></div>
            <h2 className= "text-m font-semibold">Note: Guest progress resets when page is closed</h2>

            <button onClick = {() => navigate("/Menu")}
                className = "bg-red-500 hover:bg-red-700 text-white font-bold px-3 py-3 rounded">
                Log Out
            </button>
            </nav>
        </div>
        
    );
}

export default Dashboard;