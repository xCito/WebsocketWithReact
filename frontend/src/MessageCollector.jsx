import { useState, useEffect, useRef, useCallback } from 'react';
import { useMessageSocket } from './useMessageSocket.js';
import { Tab } from './Tab.jsx';

export function MessageCollector({id}) {
  const [messagesMap, setMessagesMap] = useState(new Map());
  const { isConnected, subscribe, unsubscribe } = useMessageSocket('ws://localhost:8080?id=' + id);
  const [isSubbed, setSubbed] = useState(true);
  
  const collect = useCallback((msg) => {
    const data = JSON.parse(msg.data);
    setMessagesMap(curMap => {
      const map = new Map(curMap);
      if (map.has(data.session)) {
        console.log('Existing session', data.session);
        const list = map.get(data.session);
        map.set(data.session, [...list, data]);
      } else {
        console.log('New session', data.session)
        map.set(data.session, [data]);
      }
      return map;
    });
  }, []);

  const toggleSub = () => {
    isSubbed ? unsubscribe() : subscribe(collect);
    setSubbed(!isSubbed);
  }

  useEffect(() => {
    setMessagesMap(new Map());
    subscribe(collect);
    setSubbed(true)
    return () => {
      unsubscribe();
    }
  }, [id, collect]);

  return <div>
    <h2>{isConnected ? 'Connected' : 'Not connected'}</h2>
    <div>
      <button onClick={() => setMessagesMap(new Map())}>Clear</button>
      <button onClick={toggleSub}>{!isSubbed ? 'Subscribe': 'Unsubscribe'}</button>
    </div>
    <div style={{display: 'flex', border: '1px solid white', padding: '2em', gap: '1em'}}>
      {Array.from(messagesMap.entries()).map(([sessionId, msgs], i) =>       
        <Tab key={sessionId} sessionId={sessionId} messages={msgs} />
      )}
    </div>

  </div>
}