

import React from 'react'
import universal, { setHasBabelPlugin } from '/Users/steffoz/code/dato/datocms-status/node_modules/react-universal-component/dist/index.js'

setHasBabelPlugin()

const universalOptions = {
  loading: () => null,
  error: props => {
    console.error(props.error);
    return <div>An error occurred loading this page's template. More information is available in the console.</div>;
  },
  ignoreBabelRename: true
}

const t_0 = universal(import('/Users/steffoz/code/dato/datocms-status/src/pages/404.js'), universalOptions)
      t_0.template = '/Users/steffoz/code/dato/datocms-status/src/pages/404.js'
      
const t_1 = universal(import('/Users/steffoz/code/dato/datocms-status/src/pages/index.js'), universalOptions)
      t_1.template = '/Users/steffoz/code/dato/datocms-status/src/pages/index.js'
      
const t_2 = universal(import('/Users/steffoz/code/dato/datocms-status/src/containers/History'), universalOptions)
      t_2.template = '/Users/steffoz/code/dato/datocms-status/src/containers/History'
      
const t_3 = universal(import('/Users/steffoz/code/dato/datocms-status/src/containers/Incident'), universalOptions)
      t_3.template = '/Users/steffoz/code/dato/datocms-status/src/containers/Incident'
      

// Template Map
export default {
  '/Users/steffoz/code/dato/datocms-status/src/pages/404.js': t_0,
'/Users/steffoz/code/dato/datocms-status/src/pages/index.js': t_1,
'/Users/steffoz/code/dato/datocms-status/src/containers/History': t_2,
'/Users/steffoz/code/dato/datocms-status/src/containers/Incident': t_3
}
// Not Found Template
export const notFoundTemplate = "/Users/steffoz/code/dato/datocms-status/src/pages/404.js"

