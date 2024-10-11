import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";


export function StartBios(biosController: any) {
    //loadFonts();
  //  if (biosController) {
      const root = ReactDOM.createRoot(window.document.body).render(
        <BrowserRouter>
          {React.createElement(biosController)}
        </BrowserRouter>
      );
  /*   } else {
      const root = ReactDOM.createRoot(window.document.body).render(
        <BrowserRouter>
          <LayoutController />
        </BrowserRouter>
      );
    } */
  }