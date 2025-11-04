import React from "react";
import { useNavigate } from 'react-router-dom';

function Login(){
    const navigate = useNavigate();
    return(
    <div className= "text-center">
     <h1 className="text-xl font-semibold" >Login to Account</h1>

     <button onClick = {() => navigate("/Menu")}
      className = "bg-purple-500 hover:bg-purple-700 text-white font-bold px-3 py-3 rounded">
        Menu
    </button>
    </div>
        

    );
}

export default Login;