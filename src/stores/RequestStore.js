import { Map as map, List as list } from 'immutable';

import { ChangeEmitter } from '../utils/ChangeEmitter.js';
import AppDispatcher from '../dispatcher/AppDispatcher.js';
import SearchConstants from '../constants/SearchConstants.js';

let data = map({
  default: list(),
});

function requestBase() {
  return {
    body: [],
    terms: [],
    filter: [],
    meta_boosts: [],
    index_boosts: [],
    page: 1,
    max_results: 20,
    fields: [],
    sort: [],
    aggregates: {},
    transforms: [],
  };
}

function buildRequest(namespace) {
  return data.get(namespace).reduce((r, t) => (
    t.modifier(r)
  ), requestBase());
}

class RequestStore extends ChangeEmitter {
  getRequest(namespace) {
    return buildRequest(namespace || 'default');
  }
}

const requestStore = new RequestStore();

requestStore.dispatchToken = AppDispatcher.register(payload => {
  const action = payload.action;
  const source = payload.source;

  if (source === 'SEARCH_ACTION') {
    if (action.actionType === SearchConstants.SET_REQUEST_MODIFIER) {
      if (!data.has(action.namespace)) {
        data = data.set(action.namespace, list());
      }
      data = data.updateIn([action.namespace], modifierList => {
        const pos = modifierList.findIndex(i => (i.uuid === action.uuid));

        return pos >= 0 ? modifierList.update(pos, () => (
          {
            uuid: action.uuid,
            modifier: action.modifier,
          }
        )) : modifierList.push({
          uuid: action.uuid,
          modifier: action.modifier,
        });
      });
      requestStore.emitChange();
    } else if (action.actionType === SearchConstants.REMOVE_REQUEST_MODIFIER) {
      data = data.updateIn([action.namespace], modifierList => (
        modifierList.filter(i => (
          i.uuid !== action.uuid
        ))
      ));
      requestStore.emitChange();
    }
  }
});

export default requestStore;