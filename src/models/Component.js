import i18n from '../i18n'
import sortBy from 'sort-by'
import getOverlappingMsInIntervals from '../utils/getOverlappingMsInIntervals'

import subDays from 'date-fns/sub_days'
import startOfDay from 'date-fns/start_of_day'
import endOfDay from 'date-fns/end_of_day'

export default class Component {
  constructor(id, statusUpdates) {
    this._id = id;
    this.statusUpdates = statusUpdates.sort(sortBy('date'));
  }

  get id() {
    return this._id;
  }

  get name() {
    return i18n[`component.${this.id}`];
  }

  get status() {
    if (this.statusUpdates.length > 0) {
      return this.statusUpdates[this.statusUpdates.length - 1].status;
    } else {
      return 'operational';
    }
  }

  get statusLabel() {
    return i18n[`status.${this.status}`];
  }

  getDayByDayMsOfOutage(days) {
    let date = startOfDay(new Date());
    const result = [];

    for (let i = 0; i < days; i++) {
      result.push({
        date: date,
        msOfOutage: this.getMsOfOutage(date),
      });

      date = subDays(date, 1);
    }

    return result.reverse();
  }

  getMsOfOutage(date) {
    let outageMs = 0;

    this.outageRanges.forEach((outageRange) => {
      outageMs += Math.ceil(
        getOverlappingMsInIntervals(
          outageRange,
          {
            start: startOfDay(date),
            end: endOfDay(date),
          }
        )
      );
    });

    return outageMs;
  }

  get outageRanges() {
    const outages = [];
    let startOutage = null;

    this.statusUpdates.forEach((update) => {
      if (update.status !== 'operational' && !startOutage) {
        startOutage = new Date(update.date);
      } else if (update.status === 'operational' && startOutage) {
        outages.push({ start: startOutage, end: new Date(update.date) });
        startOutage = null;
      }
    });

    if (startOutage) {
      outages.push({ start: startOutage, end: new Date() });
    }

    return outages;
  }
}

