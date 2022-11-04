import React from 'react';
import startOfDay from 'date-fns/startOfDay';
import subDays from 'date-fns/subDays';
import format from 'date-fns/format';
import { Link } from '@reach/router';
import ReactMarkdown from 'react-markdown';

export default class IncidentsDailyOverview extends React.Component {
  renderIncident(incident) {
    return (
      <div
        className={`incidents-daily__incident incidents-daily__incident--impact-${incident.impact}`}
        key={incident.slug}
      >
        <h6 className="incidents-daily__incident__title">
          <Link to={`/incidents/${incident.slug}/`}>{incident.name}</Link>
        </h6>
        {incident.updates.map(update => (
          <div
            className="incidents-daily__incident__update"
            key={update.content}
          >
            <div className="incidents-daily__incident__update__description">
              <ReactMarkdown
                className="ugc"
                source={update.contentWithStatus}
              />
            </div>
            <p className="incidents-daily__incident__update__timestamp">
              {format(update.date, 'MMM d, HH:mm OOOO')}
            </p>
          </div>
        ))}
      </div>
    );
  }

  renderDay(day) {
    const { incidents } = this.props;
    const dayIncidents = incidents.ofDay(day);

    return (
      <div className="incidents-daily__day" key={day}>
        <h5 className="incidents-daily__day__title">
          {format(day, 'MMMM d, yyyy')}
        </h5>
        <div>
          {dayIncidents.length === 0 ? (
            <p className="incidents-daily__day__no-incidents">
              No incidents reported.
            </p>
          ) : (
            dayIncidents.map(this.renderIncident.bind(this))
          )}
        </div>
      </div>
    );
  }

  render() {
    const { daysCount } = this.props;

    const days = [];
    for (let i = 0; i < daysCount; i++) {
      days.push(subDays(startOfDay(new Date()), i));
    }

    return (
      <div className="incidents-daily">
        <div className="incidents-daily__title">Past incidents</div>
        {days.map(this.renderDay.bind(this))}
      </div>
    );
  }
}
