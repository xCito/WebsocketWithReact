import { useState, useEffect, useRef, useCallback } from 'react';

const DEBUG = false;
const RETRY_TIMER = 500;
export function useMessageSocket(url) {
  const [attempt, setAttempt] = useState({});
  const [isConnected, setConnected] = useState(false);
  const socket = useRef(null);
  const retryTimeout = useRef(null);
  const onMsg = useRef(() => console.log('default'));

  const subscribe = (cb) => {
    onMsg.current = cb;
  }

  const unsubscribe = () => {
    onMsg.current = null;
  }

  const onMessage = useCallback(msg => {
    onMsg.current && onMsg.current(msg);
  }, [onMsg.current]);

  const onConnect = useCallback(e => {
    DEBUG && console.debug(e);
    !isConnected && setConnected(true);
  }, []);

  const onError = useCallback(e => {
    DEBUG && console.error('socket error');
  }, []);

  const onClose = useCallback(e => {
    if (!e.wasClean) {
      DEBUG && console.log('closing due to server');
      retryTimeout.current = setTimeout(() => setAttempt(({})), RETRY_TIMER);
    } else {
      DEBUG && console.log('clean closing');
    }
    isConnected && setConnected(false);
  }, []);

  const initiateConnection = () => {
    if (socket.current) {
      DEBUG && console.debug('Already open, closing...')
      socket.current?.close();
    } 
    socket.current = new WebSocket(url);
    socket.current.onmessage = onMessage;
    socket.current.onopen = onConnect;
    socket.current.onerror = onError;
    socket.current.onclose = onClose;
  }

  // Make websocket connection on mount or ID changes.
  useEffect(() => {
    DEBUG && console.debug('Socket connection with ID: ' + url);
    initiateConnection();
  
    return () => {
      DEBUG && console.debug('Closing connection with ID: ' + url);
      socket.current?.close();
      clearTimeout(retryTimeout.current); 
    }
  }, [url, attempt]);

  return { isConnected, subscribe, unsubscribe };
}