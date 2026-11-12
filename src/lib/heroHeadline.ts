import type { Incident } from './incidents';

/** The text faces that the hero can show. The CSS draws each one. */
export type FaceName = 'happy';

export interface HeroHeadline {
  /** The claim, in the text colour. */
  headline: string;
  /** The quiet run after the claim. */
  muted: string;
  /** The face at the end of the quiet run, when the state is good. */
  face?: FaceName;
}

const NUMBER_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

/**
 * The two-tone headline of the homepage. It says the state that the incident
 * files give: `unresolved` are the open items (incidents and maintenances in
 * progress), `scheduled` are the maintenances that did not start. The live
 * checks of the components are in their own section.
 */
export function heroHeadline(unresolved: Incident[], scheduled: Incident[]): HeroHeadline {
  const incidents = unresolved.filter((incident) => !incident.isMaintenance);
  const maintenances = unresolved.filter((incident) => incident.isMaintenance);

  if (incidents.length > 0) {
    const count = incidents.length;
    return {
      headline:
        count === 1
          ? 'We are working on an incident.'
          : `We are working on ${NUMBER_WORDS[count] ?? count} incidents.`,
      muted: 'Updates are below.',
    };
  }

  if (maintenances.length > 0) {
    return { headline: 'Maintenance is in progress.', muted: 'Updates are below.' };
  }

  return {
    headline: 'All systems operational.',
    muted: scheduled.length > 0 ? 'Maintenance is scheduled: details are below.' : 'No open incidents.',
    face: 'happy',
  };
}
