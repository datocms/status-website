import React from 'react'
import { withRouteData, Head } from 'react-static'
import { Link } from '@reach/router'
import Incident from '../models/Incident'
import format from 'date-fns/format'
import Footer from '../components/Footer'
import ReactMarkdown from 'react-markdown'

export default withRouteData(({ incident: incidentData }) => {
  const incident = new Incident(incidentData);

  return (
    <div className="page-container page-container--incident">
      <Head>
        <meta charSet="UTF-8" />
        <title>{incident.name} - DatoCMS Status</title>
      </Head>
      <div className={`incident-details incident-details--impact-${incident.impact}`}>
        <h3 className="incident-details__title">{incident.name}</h3>
        <p className="incident-details__subtitle">
          {
            incident.isMaintenance ?
              'Scheduled Maintenance Report for DatoCMS' :
              'Incident report for DatoCMS'
          }
        </p>
        <div className="incident-details__updates">
          {
            incident.updates.map(update => (
              <div className="incident-details__update" key={update.date}>
                <strong className="incident-details__update__status">
                  {update.statusLabel}
                </strong>
                <div className="incident-details__update__description">
                  <div className="incident-details__update__message">
                    <ReactMarkdown className="ugc" source={update.content} />
                  </div>
                  <p className="incident-details__update__timestamp">
                    Posted at {format(update.date, 'MMM D, hh:mm Z')}
                  </p>
                </div>
              </div>
            ))
          }
        </div>
        <Footer
          linkLabel="Current Status"
          linkUrl="/"
        />
      </div>
    </div>
  );
})
