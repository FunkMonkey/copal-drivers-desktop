export default function () {
  return {
    get( extensionName ) {
      const ext = require( extensionName );
      return ext.default || ext;
    }
  };
}
