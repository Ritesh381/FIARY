import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import entriesReducer from './reducer';

const store = createStore(entriesReducer, applyMiddleware(thunk));

export default store;