import navbar from './navbar'
import layout from './layout'
import auth from './authentication'
import notification from './notification'
import dashboard from './dashboard'
import admission from '@src/views/admission/store'
import dataTables from '@src/views/tables/data-tables/store'
import permissions from '@src/views/apps/roles-permissions/store'

const rootReducer = {
  auth,
  notification,
  dashboard,
  admission,
  navbar,
  layout,
  dataTables,
  permissions
}

export default rootReducer