import React from 'react';
import { withRouteData, Head } from 'react-static';
import { Link } from '@reach/router';
import Incident from '../models/Incident';
import format from 'date-fns/format';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';

function timeLink(date, title) {
  return `https://timee.io/${date
    .toISOString()
    .substring(0, 16)
    .replace(/[\-\:]/g, '')}?tl=${encodeURIComponent(title)}`;
}

export default withRouteData(({ incident: incidentData }) => {
  const incident = new Incident(incidentData);

  return (
    <div className="page-container page-container--incident">
      <Head>
        <meta charSet="UTF-8" />
        <title>{incident.name} - DatoCMS Status</title>
      </Head>
      <div
        className={`incident-details incident-details--impact-${incident.impact}`}
      >
        <h3 className="incident-details__title">{incident.name}</h3>
        <p className="incident-details__subtitle">
          {incident.isMaintenance
            ? 'Scheduled Maintenance Report for DatoCMS'
            : 'Incident report for DatoCMS'}
        </p>
        <div className="incident-details__updates">
          {incident.updates.map(update => (
            <div className="incident-details__update" key={update.date}>
              <strong className="incident-details__update__status">
                {update.statusLabel}
              </strong>
              <div className="incident-details__update__description">
                <div className="incident-details__update__message">
                  <ReactMarkdown className="ugc" source={update.content} />
                </div>
                <p className="incident-details__update__timestamp">
                  {incident.isMaintenance ? (
                    <>
                      Scheduled for {format(incident.scheduledStart, 'MMM d')}
                      {', '}
                      <a
                        href={timeLink(
                          incident.scheduledStart,
                          'Maintenance start date',
                        )}
                      >
                        {format(incident.scheduledStart, 'HH:mm')}
                      </a>
                      -
                      <a
                        href={timeLink(
                          incident.scheduledEnd,
                          'Maintenance end date',
                        )}
                      >
                        {format(incident.scheduledEnd, 'HH:mm')}
                      </a>{' '}
                      {format(incident.scheduledEnd, 'OOOO')}
                    </>
                  ) : (
                    <>Posted at {format(update.date, 'MMM d, HH:mm OOOO')}</>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Footer linkLabel="Current Status" linkUrl="/" />
      </div>
    </div>
  );
});
