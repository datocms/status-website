import React from 'react';
import DailyOutage from './DailyOutage';
import i18n from '../i18n';
import ReactTooltip from 'react-tooltip';

export default ({ id, daysSince, regions }) => {
  const totalDowntime = regions.reduce(
    (acc, region) =>
      acc +
      region.outagesPerDay.reduce((acc2, { downtime }) => acc2 + downtime, 0),
    0,
  );

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
      <ReactTooltip html delayShow={100} className="tooltip" />
    </div>
  );
};
