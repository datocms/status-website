import readData from './readData'
import generateFeeds from './generateFeeds'
import IncidentsRepo from './src/models/IncidentsRepo'
import subDays from 'date-fns/subDays'
import subMonths from 'date-fns/subMonths'
import startOfMonth from 'date-fns/startOfMonth'
import differenceInMonths from 'date-fns/differenceInMonths'

export default {
  siteRoot: `${process.env.DEPLOY_PRIME_URL}/`,
  plugins: ['react-static-plugin-sass'],
  getSiteData: () => ({
    title: 'DatoCMS Status',
  }),
  //bundleAnalyzer: true,
  getRoutes: async () => {
    const {
      incidents
    } = readData();

    const incidentsRepo = new IncidentsRepo(incidents);

    const routes = [];

    routes.push({
      path: '/',
      getData: () => ({
        incidents: incidentsRepo.allSince(subDays(new Date(), 7)).map(i => i.data),
        incidentsOverviewDays: 7
      }),
    });

    const monthsPerPage = 3;
    const historyPagesCount = Math.max(4, Math.ceil(differenceInMonths(new Date(), incidentsRepo.first.date) / monthsPerPage));

    for (let i = 0; i < historyPagesCount; i++) {
      const incidentsByMonth = [];

      for (let j = 0; j < monthsPerPage; j++) {
        const month = subMonths(startOfMonth(new Date()), i * monthsPerPage + j);

        incidentsByMonth.push({
          month,
          incidents: incidentsRepo.ofMonth(month).filter(i => i.status !== 'scheduled').map(i => i.data),
        })
      }

      routes.push({
        path: i === 0 ? `/history/` : `/history/page/${i}/`,
        component: 'src/containers/History',
        getData: () => ({
          nextPath: i === 0 ? null : (i === 1 ? `/history/` : `/history/page/${i - 1}/`),
          prevPath: i === historyPagesCount - 1 ? null : `/history/page/${i + 1}/`,
          incidentsByMonth,
        }),
      });
    }

    incidentsRepo.all.forEach(incident => {
      routes.push({
        path: `/incidents/${incident.slug}/`,
        component: 'src/containers/Incident',
        getData: () => ({ incident: incident.data }),
      });
    });

    return routes;
  },
  onBuild: async () => {
    await generateFeeds();
  }
}
