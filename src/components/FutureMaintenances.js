import React from 'react';
import startOfDay from 'date-fns/startOfDay';
import subDays from 'date-fns/subDays';
import format from 'date-fns/format';
import { Link } from '@reach/router';
import ReactMarkdown from 'react-markdown';

function timeLink(date, title) {
  return `https://timee.io/${date
    .toISOString()
    .substring(0, 16)
    .replace(/[\-\:]/g, '')}?tl=${encodeURIComponent(title)}`;
}

export default class FutureMaintenances extends React.Component {
  renderIncident(incident) {
    return (
      <div
        className={`scheduled-maintenances__incident scheduled-maintenances__incident--impact-${incident.impact}`}
        key={incident.slug}
      >
        <h6 className="scheduled-maintenances__incident__title">
          <a href={`/incidents/${incident.slug}`}>{incident.name}</a>
        </h6>
        <div className="scheduled-maintenances__description">
          <ReactMarkdown
            className="ugc"
            source={incident.firstUpdate.content}
          />
        </div>
        <div className="scheduled-maintenances__components">
          This scheduled maintenance will affect:{' '}
          {incident.affectedComponents.join(', ')}
        </div>
        <p className="scheduled-maintenances__timestamp">
          Scheduled for {format(incident.scheduledStart, 'MMM d')}
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
      </div>
    );
  }

  render() {
    const { incidents } = this.props;

    if (incidents.futureMaintenances.length === 0) {
      return null;
    }

    return (
      <div className="scheduled-maintenances">
        <div className="scheduled-maintenances__title">
          Scheduled Maintenance
        </div>
        {incidents.futureMaintenances.map(this.renderIncident.bind(this))}
      </div>
    );
  }
}
