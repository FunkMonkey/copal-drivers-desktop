/* eslint global-require: "off" */
import Rx from 'rxjs/Rx';
import yaml from 'js-yaml';
import observableFromNodeCB from './utils/observable-from-node-cb';

export default function ( fs ) {
  const readFile = observableFromNodeCB( fs.readFile );
  const readFileAsText = filePath => readFile( filePath, 'utf8' );

  const jsLoader = filePath => Rx.Observable.of( require( filePath ) );
  const jsonLoader = filePath => readFileAsText( filePath )
                                   .map( content => JSON.parse( content ) );

  const yamlLoader = filePath => readFileAsText( filePath )
                                   .map( content => yaml.safeLoad( content ) );

  return {
    js: jsLoader,
    json: jsonLoader,
    yml: yamlLoader,
    yaml: yamlLoader
  };
}
