import React from 'react'
import mixColors from '../utils/mixColors'
import LogScale from 'log-scale'
import flatten from 'lodash.flatten'
import format from 'date-fns/format'
import distanceInWordsStrict from 'date-fns/distance_in_words_strict'
import addMilliseconds from 'date-fns/add_milliseconds'

const maxOutage = 50 * 60 * 1000;
const logScale = new LogScale(0, maxOutage);

export default ({ data }) => (
  <div className="daily-outage">
    <svg preserveAspectRatio="none" height="34" viewBox={`0 0 ${5 * data.length - 2} 34`}>
      {
        flatten(
          data.map((dayData, i) => (
            [
              <rect
                key={dayData.date}
                height="34"
                width="3"
                x={5 * i}
                y="0"
                data-tip={
                  `
                    <div><strong>${format(dayData.date, 'MMMM D')}</strong></div>
                    <div>
                      ${
                        dayData.msOfOutage === 0 ?
                          'No downtime reported for this day' :
                          `${distanceInWordsStrict(new Date(), addMilliseconds(new Date(), dayData.msOfOutage))} of outage`
                      }
                    </div>
                  `
                }
                fill={
                  mixColors(
                    'f1c40f',
                    '2fcc66',
                    logScale.logarithmicToLinear(Math.min(dayData.msOfOutage, maxOutage)) * 100
                  )
                }
              />,
            ]
          ))
        )
      }
    </svg>
  </div>
);
