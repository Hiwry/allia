import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  html, body {
    height: 100%;
    width: 100%;
  }

  body {
    background-color: #f5f5f5;
    color: #333;
    overflow-x: hidden;
  }

  #root {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
    &:focus {
      outline: none;
    }
  }

  input, select, textarea {
    font-family: inherit;
  }

  /* Impede que múltiplas sidebars sejam renderizadas */
  body .allia-sidebar-container:not(:first-of-type) {
    display: none !important;
  }

  /* Ajustes para evitar problemas de layout */
  .allia-sidebar-container {
    z-index: 999;
  }

  /* Reset para elementos aninhados que podem causar problemas */
  .allia-sidebar-container .allia-sidebar-container {
    display: none !important;
  }
`;
