import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { Feed } from "feed";
import fs from 'fs'
import readData from "./readData";
import IncidentsRepo from './src/models/IncidentsRepo'
import UnresolvedIncidentBody from './src/components/UnresolvedIncidentBody';

export default async function() {
  const feed = new Feed({
    title: "DatoCMS Incident History",
    id: "https://status.datocms.com/",
    link: "https://status.datocms.com/history.atom",
    updated: new Date(),
    feedLinks: {
      rss: "https://status.datocms.com/history.rss",
      json: "https://status.datocms.com/history.json",
      atom: "https://status.datocms.com/history.atom"
    },
    author: {
      name: "DatoCMS",
      link: "https://www.datocms.com/"
    }
  });

  const { incidents: incidentsData } = readData();
  const incidents = new IncidentsRepo(incidentsData);

  incidents.all.forEach(incident => {
    feed.addItem({
      title: incident.name,
      id: incident.slug,
      link: `https://status.datocms.com/incidents/${incident.slug}/`,
      content: ReactDOMServer.renderToStaticMarkup(
        <UnresolvedIncidentBody incident={incident} />
      ),
      date: incident.lastUpdate.date,
    });
  });

  fs.writeFileSync('./dist/history.rss', feed.rss2(), 'utf8');
  fs.writeFileSync('./dist/history.atom', feed.atom1(), 'utf8');
  fs.writeFileSync('./dist/history.json', feed.json1(), 'utf8');
}
