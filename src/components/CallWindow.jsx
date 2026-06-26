import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000';
let socket;

const CallWindow = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedChat } = useSelector((state) => state.chat);

  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(false);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);

    const handleInitiate = () => {
      if(!selectedChat || selectedChat.isGroupChat) {
        alert("Select a single user to call");
        return;
      }
      setIsActive(true);
      startMediaAndCall();
    };
    
    window.addEventListener('initiate-call', handleInitiate);

    socket.on('callUser', (data) => {
      setIsActive(true);
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on('callEnded', () => {
      cleanupCall();
    });

    return () => {
      window.removeEventListener('initiate-call', handleInitiate);
      socket.disconnect();
    };
  }, [user, selectedChat]);

  const startMediaAndCall = async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(currentStream);
      if (myVideo.current) myVideo.current.srcObject = currentStream;

      const userToCall = selectedChat.users.find(u => u._id !== user._id)._id;

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: currentStream,
      });

      peer.on('signal', (data) => {
        socket.emit('callUser', {
          userToCall: userToCall,
          signalData: data,
          from: user._id,
          name: user.name,
        });
      });

      peer.on('stream', (userStream) => {
        if (userVideo.current) userVideo.current.srcObject = userStream;
      });

      socket.on('callAccepted', (signal) => {
        setCallAccepted(true);
        peer.signal(signal);
      });

      connectionRef.current = peer;
    } catch(err) {
      console.error(err);
      alert("Microphone/Camera permission denied.");
      cleanupCall();
    }
  };

  const answerCall = async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(currentStream);
      if (myVideo.current) myVideo.current.srcObject = currentStream;
      
      setCallAccepted(true);
      
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: currentStream,
      });

      peer.on('signal', (data) => {
        socket.emit('answerCall', { signal: data, to: caller });
      });

      peer.on('stream', (userStream) => {
        if (userVideo.current) userVideo.current.srcObject = userStream;
      });

      peer.signal(callerSignal);
      connectionRef.current = peer;
    } catch(err) {
      console.error(err);
      alert("Microphone/Camera permission denied.");
      rejectCall();
    }
  };

  const cleanupCall = () => {
    setCallEnded(true);
    if(connectionRef.current) connectionRef.current.destroy();
    if(stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setIsActive(false);
    setReceivingCall(false);
    setCallAccepted(false);
    setCallEnded(false);
  };

  const leaveCall = () => {
    const to = callAccepted ? caller : (selectedChat && selectedChat.users.find(u => u._id !== user._id)._id);
    if(to) socket.emit('endCall', { to });
    cleanupCall();
  };

  const rejectCall = () => {
    socket.emit('endCall', { to: caller });
    cleanupCall();
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col relative border border-gray-700">
        
        {/* Header */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center text-white">
          <h2 className="text-xl font-semibold">
            {receivingCall && !callAccepted ? `Incoming call from ${name}...` : 'Video Call'}
          </h2>
        </div>

        {/* Video Grid */}
        <div className="flex-1 min-h-[300px] md:min-h-[500px] p-4 flex flex-col md:flex-row gap-4 justify-center items-center relative">
          
          {/* Main User Video (Remote) */}
          {callAccepted && !callEnded ? (
            <div className="w-full h-full relative bg-black rounded-lg overflow-hidden flex-1 shadow-inner">
              <video playsInline ref={userVideo} autoPlay className="w-full h-full object-contain" />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded text-white text-sm backdrop-blur-sm">
                {name || "Caller"}
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center flex-col text-gray-400">
               {receivingCall && !callAccepted ? (
                 <div className="animate-pulse flex flex-col items-center">
                    <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(99,102,241,0.6)]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <p className="text-xl text-white">Ringing...</p>
                 </div>
               ) : (
                 <p>Waiting for answer...</p>
               )}
            </div>
          )}

          {/* Self Video (Local) - PiP style on desktop, stacked on mobile if needed */}
          <div className={`${callAccepted ? 'absolute top-6 right-6 w-32 md:w-48 shadow-2xl border-2 border-gray-700' : 'w-full md:w-1/2 h-full'} bg-black rounded-lg overflow-hidden z-10 transition-all duration-500`}>
            {stream && (
              <>
                <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-2 py-0.5 rounded text-white text-xs backdrop-blur-sm">
                  You
                </div>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 bg-gray-800 flex justify-center gap-6 border-t border-gray-700">
          {receivingCall && !callAccepted ? (
            <>
              <button onClick={answerCall} className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
              </button>
              <button onClick={rejectCall} className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <button onClick={leaveCall} className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full shadow-lg transition-transform hover:scale-105 font-bold text-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              End Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallWindow;
