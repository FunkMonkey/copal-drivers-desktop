import { Observable } from 'rxjs';

/**
 * Creates an observable from a function that takes a node-style-callback-function
 * as the last argument.
 *
 * @param  {function}   f
 * @param  {Object}     context
 * @return {Observable}
 */
export default function observableFromNodeCallback( f, context ) {
  // fromNodeCallback already calls the function f, even if not subscribed to
  // we thus wrap it in a new observable
  // TODO: check if still the case in RX5
  return ( ...args ) =>
    Observable.create( observer => {
      const nodeFunc = Observable.bindNodeCallback( f, context );
      const source$ = nodeFunc( ...args );
      source$.subscribe( observer );
    } );
}
