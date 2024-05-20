import React from "react";
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from "./login";
import SignUp from "./signup";
import Events from "./events";
import Notes from "./notes";

function App() {

  function AuthGuard({ children }) {
    const usernameSS = sessionStorage.getItem("username");
    const usernameURL = window.location.pathname.split("/")[2];
    if (usernameSS === usernameURL) {
      // Se l'username inserito nell'URL è presente in Session Storage, restituisci il componente figlio
      return children;
    } else {
      // Altrimenti, reindirizza l'utente alla pagina di login
      return <Navigate to="/login" />;
    }
  }

  return (

    <Routes>

      {/* Routes pubbliche */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/events" element={<Events />} />
      <Route path="/notes" element={<Notes />} />

      {/* Routes protette */}
      {/* <Route path="/home/:username" element={<AuthGuard> <Home /> </AuthGuard>} /> */}
      {/* <Route path="/channel/:username/:channel" element={<AuthGuard> <ChannelPosts /> </AuthGuard>} /> */}

    </Routes>

  );
}

export default App;