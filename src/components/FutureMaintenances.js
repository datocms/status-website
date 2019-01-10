import React from 'react'
import startOfDay from 'date-fns/start_of_day'
import subDays from 'date-fns/sub_days'
import format from 'date-fns/format'
import { Link } from '@reach/router'
import ReactMarkdown from 'react-markdown'

export default class FutureMaintenances extends React.Component {
  renderIncident(incident) {
    return (
      <div className={`scheduled-maintenances__incident scheduled-maintenances__incident--impact-${incident.impact}`} key={incident.slug}>
        <h6 className="scheduled-maintenances__incident__title">
          {incident.name}
        </h6>
        <div className="scheduled-maintenances__description">
          <ReactMarkdown className="ugc" source={incident.firstUpdate.content} />
        </div>
        <div className="scheduled-maintenances__components">
          This scheduled maintenance will affect: {incident.affectedComponents.join(', ')}
        </div>
        <p className="scheduled-maintenances__timestamp">
          Scheduled for {format(incident.scheduledStart, 'MMM D, hh:mm')}-{format(incident.scheduledEnd, 'hh:mm Z')}
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


