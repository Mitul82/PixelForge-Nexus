import React from 'react';
import ReactDom from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.tsx';
import { AuthProvider } from './context/authContext.tsx';

const root = ReactDom.createRoot(document.getElementById('root')!);

function Page() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <App/>
            </AuthProvider>
        </BrowserRouter>
    );
}

root.render(
    <React.StrictMode>
        <Page/>
    </React.StrictMode>
);