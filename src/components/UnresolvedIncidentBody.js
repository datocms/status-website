import React from 'react';
import format from 'date-fns/format';
import ReactMarkdown from 'react-markdown';

function timeLink(date, title) {
  return `https://timee.io/${date
    .toISOString()
    .substring(0, 16)
    .replace(/[\-\:]/g, '')}?tl=${encodeURIComponent(title)}`;
}

export default ({ incident }) => (
  <div className="unresolved-incident__body">
    {incident.updates.map(update => (
      <div className="unresolved-incident__update" key={update.content}>
        <div className="unresolved-incident__update__description">
          <ReactMarkdown className="ugc" source={update.contentWithStatus} />
        </div>
        {
          incident.isMaintenance ?
            <>
              <div className="unresolved-incident__update__details">
                <strong>This scheduled maintenance will affect:</strong>{' '}
                {incident.affectedComponents.join(', ')}
              </div>
              <p className="unresolved-incident__update__details">
                <strong>Scheduled for:</strong> {format(incident.scheduledStart, 'MMM d')}
                {', '}
                <a href={timeLink(incident.scheduledStart, 'Maintenance start date')}>
                  {format(incident.scheduledStart, 'HH:mm')}
                </a>
                -
                <a href={timeLink(incident.scheduledEnd, 'Maintenance end date')}>
                  {format(incident.scheduledEnd, 'HH:mm')}
                </a>{' '}
                {format(incident.scheduledEnd, 'OOOO')}
              </p>
            </> :
            <p className="unresolved-incident__update__timestamp">
              {format(update.date, 'MMM d, HH:mm OOOO')}
            </p>
        }

      </div>
    ))}
  </div>
);
