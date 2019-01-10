import React from 'react'
import UnresolvedIncidentBody from '../components/UnresolvedIncidentBody';

export default ({ incident }) => (
  <div className={`unresolved-incident unresolved-incident--impact-${incident.impact}`}>
    <div className="unresolved-incident__title">
      {incident.name}
    </div>
    <UnresolvedIncidentBody incident={incident} />
  </div>
);
