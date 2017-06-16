// flow-typed signature: 5e2b9617a54788db6e642aa22f14dc1c
// flow-typed version: <<STUB>>/redux-actions_v^2.0.1/flow_v0.37.0



declare module 'redux-actions' {
  declare function payloadCreator(args: any): void
  declare export function createAction(
    type: string,
    payloadCreator?: payloadCreator
  ): (any) => ({ type: string, payload: any })
  declare export function handleActions({
    [key: string]: Function
  }, Object): Object
}
