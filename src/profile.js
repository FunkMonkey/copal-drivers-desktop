import path from 'path';

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
      const files$ = readdir( dirName ) // TODO: filter out directories
        .map( files =>
          files.filter( file => path.basename( file, path.extname( file ) ) === baseName ) );

      const exts$ = files$.map( files => files.map( path.extname )
                                              .map( ext => ext.substring( 1 ) ) )
        .do( exts => {
          if ( exts.length === 0 )
            throw new Error( `Cannot retrieve settings for '${name}'. File does not exist!` );
        } )
        .map( exts => exts.filter( ext => ext in fileLoaders ) )
        .do( exts => {
          if ( exts.length === 0 )
            throw new Error( `Cannot retrieve settings for '${name}'. File format not supported!` );
        } );

      return exts$.flatMap( exts => fileLoaders[ exts[0] ]( `${filePathNoExt}.${exts[0]}` ) );
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
