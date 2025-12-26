import React from 'react';

function App() {
  return (
    <div className="w-[300px] h-[400px] p-4 bg-background text-foreground">
      <h1 className="text-xl font-bold mb-4">NeuroSync</h1>
      <p className="text-sm mb-4">Multilingual Speech to Text</p>
      <div className="border rounded p-2 bg-muted">
        <p className="text-xs text-muted-foreground">Status: Inactive</p>
      </div>
      <button className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded">
        Start Recording
      </button>
    </div>
  );
}

export default App;
