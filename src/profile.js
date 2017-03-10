import path from 'path';
import Rx from 'rx';

import observableFromNodeCB from './utils/observable-from-node-cb';
import getFileLoaders from './get-file-loaders';

const appDataDir = process.env.APPDATA ||
  ( process.platform === 'darwin' ? `${process.env.HOME}Library/Preference`
                                  : '/var/local' );
const defaultProfileDir = path.join( appDataDir, 'copal' );

function createSettingsDriver( profileDir, fs ) {
  const readdir = observableFromNodeCB( fs.readdir );
  const fileLoaders = getFileLoaders( fs );

  return {
    get( name ) {
      const filePathNoExt = path.join( profileDir, name );
      const dirName = path.dirname( filePathNoExt );
      const baseName = path.basename( filePathNoExt );
      const files$ = readdir( dirName )
        .map( files => Rx.Observable.from( files ) )
        .filter( file => file.startsWith( baseName ) );

      const exts$ = files$.map( path.extname )
        .toArray()
        .do( exts => {
          if ( exts.length === 0 )
            throw new Error( `Cannot retrieve settings for ${name}. File does not exist!` );
        } )
        .map( exts => exts.filter( ext => ext in fileLoaders ) )
        .do( exts => {
          if ( exts.length === 0 )
            throw new Error( `Cannot retrieve settings for ${name}. File format not supported!` );
        } );

      return exts$.map( exts => fileLoaders[ exts[0] ]( `${filePathNoExt}${exts[0]}` ) );
    }
  };
}

export default function createProfileDriver( options ) {
  const profileDir = options.dir || defaultProfileDir;

  return {
    fs: options.fs,
    profileDir,
    settings: createSettingsDriver( profileDir, options.fs )
  };
}
