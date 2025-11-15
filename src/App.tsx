import React, {useEffect, useState} from 'react';
import './App.css';
import MangaReader, {ReadingState} from "./MangaReader";


function App() {
  const [state, setState] = useState<ReadingState>();

  useEffect(() => {
    fetch('/e-reader.github.io/images/info.json')
      //   "homepage": "https://bengrim12.github.io/e-reader.github.io",https://bengrim12.github.io/images/image_8.jpeg
    //fetch('/mgs-52/info.json')
      .then(res => res.json())
      .then(data => setState(data));
  }, []);

  if (!state) {
    return <div>Loading...</div>;
  }

  return (
    <MangaReader images={state}/>
  );
}

export default App;
