import React from 'react'
import DailyOutage from './DailyOutage'
import subDays from 'date-fns/sub_days'

const daysSince = 90

export default ({ component }) => {
  const dailyMsOfOutage = component.getDayByDayMsOfOutage(daysSince)
  const periodInMs = daysSince * 1000 * 60 * 60 * 24;

  return (
    <div className={`component-status component-status--status-${component.status}`}>
      <div className="component-status__header">
        <div className="component-status__name">
          {component.name}
        </div>
        <div className="component-status__status">
          {component.statusLabel}
        </div>
      </div>
      <DailyOutage data={dailyMsOfOutage} />
      <div className="component-status__footer">
        <div className="component-status__left">
          {daysSince} days ago
        </div>
        <div className="component-status__uptime">
          {
            Math.round(
              (periodInMs - dailyMsOfOutage.reduce((acc, day) => acc + day.msOfOutage, 0)) /
              periodInMs * 100000
            ) / 1000
          }
          %&nbsp;uptime
        </div>
        <div className="component-status__right">
          Today
        </div>
      </div>
    </div>
  );
};
