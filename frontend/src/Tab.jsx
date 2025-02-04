import { memo } from 'react';

export const Tab = memo(function Tab({sessionId, messages}) {
  return <div>
    <h4>{sessionId}</h4>
    {messages.map((m, index) => <div key={m.text + index}>
        {m.text} -- Session: {m.session}
    </div>)}
  </div>
});
