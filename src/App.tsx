import React, {useEffect, useState} from 'react';
import './App.css';
import MangaReader from "./MangaReader";


function App() {
  const [state, setState] = useState([]);

  useEffect(() => {
    fetch('/output_segments/info.json')
    //fetch('/mgs-52/info.json')
      .then(res => res.json())
      .then(data => setState(data));
  }, []);

  return (
    <MangaReader images={state}/>
  );
}

export default App;
