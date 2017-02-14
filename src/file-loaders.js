/* eslint global-require: "off" */
import fs from 'fs';
import observableFromNodeCB from './utils/observable-from-node-cb';

const readFile = observableFromNodeCB( fs.readFile );

function loadFileAsText( filePath ) {
  return readFile( filePath, 'utf8' );
}

const loaders = [
  {
    ext: '.json',
    loader: ( filePath ) => loadFileAsText( filePath )
                           .map( content => JSON.parse( content ) )
  },
  {
    ext: '.js',
    loader: ( filePath ) => require( filePath )
  }
];

loaders.supportedExtensions = loaders.reduce( ( acc, val ) => {
  acc[val.ext] = val.loader;
  return acc;
}, {} );

export default loaders;
