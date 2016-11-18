import { Client } from 'sajari'

import { ChangeEmitter } from '../utils/ChangeEmitter.js';
import NamespaceStore from './NamespaceStore.js';

let data = {}

class ApiStore extends ChangeEmitter {
  get(namespace = 'default') {
    const entry = data[namespace]
    return entry ? entry.api : null
  }
}

const apiStore = new ApiStore()

const newApi = (project, collection) => ({
  api: new Client(project, collection),
  project,
  collection,
})

function updateStoreState() {
  const namespaces = NamespaceStore.getAll();
  Object.keys(namespaces).forEach(namespace => {
    const ns = data[namespace]
    // Check if namespace isn't in the API store or it's project or collection have changed
    // If so, remake the API object from the new values
    if (!ns || namespaces[namespace].project !== ns.project || namespaces[namespace].collection !== ns.collection) {
      data = {
        ...data,
        [namespace]: newApi(namespaces[namespace].project, namespaces[namespace].collection)
      }
    }
  });
}

NamespaceStore.addChangeListener(updateStoreState);

export default apiStore;
