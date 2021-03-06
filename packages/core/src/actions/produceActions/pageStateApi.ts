import { ApiPayload } from './componentStateApi';
import ACTION_TYPES from '../actionTypes';
import { createActions } from '../../utils';
import { PlainObjectType } from '../../types';

export const setPageState = (payload:PlainObjectType) =>
	createActions({ type: ACTION_TYPES.setPageState,payload });

export const setPageApi=(payload:ApiPayload)=>createActions({
	type: ACTION_TYPES.setPageApi,
	payload,
});
