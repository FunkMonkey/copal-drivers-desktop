import path from 'path';
import fs from 'fs';
import Rx from 'rx';

import observableFromNodeCB from './utils/observable-from-node-cb';
import fileLoaders from './file-loaders';

const readdir = observableFromNodeCB( fs.readdir );

const appDataDir = process.env.APPDATA ||
  ( process.platform === 'darwin' ? `${process.env.HOME}Library/Preference`
                                  : '/var/local' );
const defaultProfileDir = path.join( appDataDir, 'copal' );

function createSettingsDriver( profileDir ) {
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
        } );

      const content$ = exts$.map( exts => {
        for ( let i = 0; i < fileLoaders.length; ++i ) {
          for ( let j = 0; j < exts.length; ++j )
            if ( fileLoaders[i].ext === exts[j] )
              return fileLoaders[i].loader( `${filePathNoExt}${exts[j]}` );
        }

        throw new Error( `Cannot retrieve settings for ${name}. File format not supported!` );
      } );

      return content$;
    }
  };
}

export default function createProfileDriver( options ) {
  const profileDir = options.dir || defaultProfileDir;

  return {
    settings: createSettingsDriver( profileDir )
  };
}
