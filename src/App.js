import React from 'react';
import { Root, Routes, Head } from 'react-static';
import { Router } from '@reach/router';

import './styles/index.sass';

function App() {
  return (
    <Root>
      <Head>
        <link
          rel="icon"
          sizes="16x16"
          href="https://www.datocms-assets.com/205/1525789775-dato.png?h=16&amp;w=16"
          type="image/png"
        />
        <link
          rel="icon"
          sizes="32x32"
          href="https://www.datocms-assets.com/205/1525789775-dato.png?h=32&amp;w=32"
          type="image/png"
        />
        <link
          rel="icon"
          sizes="96x96"
          href="https://www.datocms-assets.com/205/1525789775-dato.png?h=96&amp;w=96"
          type="image/png"
        />
        <link
          rel="icon"
          sizes="192x192"
          href="https://www.datocms-assets.com/205/1525789775-dato.png?h=192&amp;w=192"
          type="image/png"
        />
      </Head>
      <React.Suspense fallback={<em>Loading...</em>}>
        <Router>
          <Routes path="*" />
        </Router>
      </React.Suspense>
    </Root>
  );
}

export default App;
