import React, { createContext, useContext, useState } from 'react';

const ProctoringContext = createContext(null);

export const ProctoringProvider = ({ children }) => {
  const [cameraStream, setCameraStream] = useState(null);
  const [micStream, setMicStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  const clearStreams = () => {
    if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setMicStream(null);
    setScreenStream(null);
  };

  return (
    <ProctoringContext.Provider
      value={{
        cameraStream,
        setCameraStream,
        micStream,
        setMicStream,
        screenStream,
        setScreenStream,
        clearStreams,
      }}
    >
      {children}
    </ProctoringContext.Provider>
  );
};

export const useProctoring = () => {
  const context = useContext(ProctoringContext);
  if (!context) {
    throw new Error('useProctoring must be used within a ProctoringProvider');
  }
  return context;
};
