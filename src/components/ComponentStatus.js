import React from 'react';
import DailyOutage from './DailyOutage';
import i18n from '../i18n';

export default ({ id, daysSince, regions, totalDowntime }) => {
  const problematicRegions = regions.filter(region => region.status !== 'up');
  const status =
    problematicRegions.length > 0
      ? problematicRegions[0].status
      : 'operational';

  const periodInMs = daysSince * 60 * 60 * 24;

  return (
    <div className={`component-status component-status--status-${status}`}>
      <div className="component-status__header">
        <div className="component-status__name">{i18n[`component.${id}`]}</div>
        <div className="component-status__status">
          {i18n[`status.${status}`]}
        </div>
      </div>
      <DailyOutage regions={regions} daysSince={daysSince} />
      <div className="component-status__footer">
        <div className="component-status__left">{daysSince} days ago</div>
        <div className="component-status__uptime">
          {Math.round(((periodInMs - totalDowntime) / periodInMs) * 100000) /
            1000}
          %&nbsp;uptime
        </div>
        <div className="component-status__right">Today</div>
      </div>
    </div>
  );
};
