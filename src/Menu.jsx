import React from "react";
import { useNavigate } from 'react-router-dom';
import Dashboard from "./Dashboard";
import Login from "./Login";

// Temporarily disabling unfinished Menu class to prevent syntax errors
// Original logic preserved below for future implementation.
/*
class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      match: false,
    };
  }

  login = () => {match = false
    username = 
  };
  createAccount = () => {};
  getUsername = () => {return this.username};
  getPassword = () => {return this.password};
  verifyLogin = (userUsername, userPassword) => {
    match = false
    if(userUsername == username && userPassword == password)
        match = true};
  incorrectLogin = () => { message("Username or Password is incorrect")};
  */

// Temporary placeholder so imports don’t break
function Menu() {
  const navigate = useNavigate();
  return (
    <div className="text-center">
      <div className= "flex flex-col space-y-7"></div>
      <h2 className="text-xl font-semibold">Slide Puzzle Game</h2>
    <div className= "flex flex-col space-y-7"></div>
    <div className= "flex gap-3">
    <button onClick = {() => navigate("/Login") }
      className = "bg-blue-500 hover:bg-blue-700 text-white font-bold px-3 py-3 rounded">
        Log-In
    </button>

    <button onClick = {() => alert("Create Account (placeholder)")}
      className = "bg-green-500 hover:bg-green-700 text-white font-bold px-3 py-3 rounded">
        Create Account
    </button>

    <button onClick = {() => navigate("/Dashboard")}
      className = "bg-purple-500 hover:bg-purple-700 text-white font-bold px-3 py-3 rounded">
        Play as Guest
    </button>
    </div>
    </div>
  );
}

export default Menu;
