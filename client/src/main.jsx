import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import DisableDevtool from 'disable-devtool';

// Call before rendering the app
// DisableDevtool({
//   disableMenu: true,        // Disable right-click menu
//   clearLog: true,           // Clear console logs
//   ondevtoolopen: () => {
//     // Optional: what to do when developer tools are detected as opened
//     // For example, close the current page or redirect
//     // window.location.href = '/';
//   },
// });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);