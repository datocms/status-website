import React from 'react';
import format from 'date-fns/format';
import ReactMarkdown from 'react-markdown';

export default ({ incident }) => (
  <div className="unresolved-incident__body">
    {incident.updates.map(update => (
      <div className="unresolved-incident__update" key={update.content}>
        <div className="unresolved-incident__update__description">
          <ReactMarkdown className="ugc" source={update.contentWithStatus} />
        </div>
        <p className="unresolved-incident__update__timestamp">
          {format(update.date, 'MMM d, HH:mm OOOO')}
        </p>
      </div>
    ))}
  </div>
);
