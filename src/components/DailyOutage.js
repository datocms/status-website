import React, { useState } from 'react';
import format from 'date-fns/format';
import subDays from 'date-fns/subDays';
import formatDistance from 'date-fns/formatDistanceStrict';
import addSeconds from 'date-fns/addSeconds';

import i18n from '../i18n';

const generateDatesSince = days => {
  const dates = [];

  for (let i = 0; i < days; i++) {
    dates.push(subDays(new Date(), days - i - 1));
  }

  return dates;
};

const calculateDowntimePerRegion = (regions, date) =>
  regions.map(({ id, outagesPerDay }) => {
    const day = outagesPerDay.find(
      ({ date: d }) => d === format(date, 'yyyy-MM-dd'),
    );
    return { id, downtime: day ? day.downtime : 0 };
  });

const calculateTotalDowntime = downtimePerRegion =>
  downtimePerRegion.reduce((acc, { downtime }) => acc + downtime, 0);

const TooltipContent = ({ downtimePerRegion, totalDowntime, date }) => {
  return (
    <>
      <div className="daily-outage-tooltip-date">
        {format(date, 'MMMM d')} UTC
      </div>
      <div className="daily-outage-tooltip-content">
        {totalDowntime === 0 && <p>No downtime reported for this day</p>}
        {totalDowntime > 0 &&
          downtimePerRegion.length > 1 &&
          downtimePerRegion
            .filter(({ downtime }) => downtime > 0)
            .map(({ id, downtime }) => (
              <p className="daily-outage-tooltip-content-region">
                {formatDistance(new Date(), addSeconds(new Date(), downtime))}{' '}
                of outage in {i18n[`region.${id}`]}
              </p>
            ))}
        {totalDowntime > 0 && downtimePerRegion.length === 1 && (
          <p>
            {formatDistance(
              new Date(),
              addSeconds(new Date(), downtimePerRegion[0].downtime),
            )}{' '}
            of outage
          </p>
        )}
      </div>
    </>
  );
};

export default ({ regions, daysSince, loading }) => {
  const [activeTooltipData, setActiveTooltipData] = useState(null);

  return (
    <div
      className="daily-outage"
      onMouseLeave={
        loading
          ? undefined
          : () => {
              setActiveTooltipData(null);
            }
      }
    >
      <svg
        preserveAspectRatio="none"
        height="34"
        viewBox={`0 0 ${8 * daysSince - 2} 34`}
      >
        {generateDatesSince(daysSince).map((date, i) => {
          const downtimePerRegion = calculateDowntimePerRegion(regions, date);
          const totalDowntime = calculateTotalDowntime(downtimePerRegion);

          return (
            <rect
              key={date}
              height="34"
              width="7"
              x={8 * i}
              y="0"
              onMouseEnter={() =>
                loading
                  ? undefined
                  : setActiveTooltipData({
                      date,
                      downtimePerRegion,
                      totalDowntime,
                      i,
                    })
              }
              onMouseLeave={() => setActiveTooltipData(null)}
              style={{ transition: 'fill ease-in-out 0.5s' }}
              fill={
                loading ? '#eee' : totalDowntime > 0 ? '#f1c40f' : '#2fcc66'
              }
            />
          );
        })}
      </svg>
      {activeTooltipData && (
        <div
          className="daily-outage-tooltip"
          style={{
            left: `${(activeTooltipData.i / daysSince) * 100}%`,
          }}
        >
          <TooltipContent {...activeTooltipData} />
        </div>
      )}
    </div>
  );
};
