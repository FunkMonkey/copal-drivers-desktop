import { loaders } from 'reactive-plugin-system';

export default function () {
  return {
    load( pluginName ) {
      return loaders.require( pluginName );
    }
  };
}
