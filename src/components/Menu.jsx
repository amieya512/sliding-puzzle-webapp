import React from 'react'
       
export default function Menu(){
        return (
            <div className= "items-center">
            <div className= "flex gap-3">
            <button onClick = {() => {alert(click)}}
             className = "bg-blue-500 hover:bg-yellow-500 text-white font-semibold py-1 py3 rounded">
                New Game
            </button>

            <button onClick = {() => {alert(click)}}
             className = "bg-blue-500 hover:bg-yellow-500 text-white font-semibold py-1 py3 rounded">
                Load Game
            </button>

            <button onClick = {() => {alert(click)}}
             className = "bg-blue-500 hover:bg-yellow-500 text-white font-semibold py-1 py3 rounded">
                Create Account
            </button>
            </div>
            </div>);
        }