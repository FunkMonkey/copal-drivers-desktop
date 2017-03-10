export default function () {
  return {
    get( extensionName ) {
      return require( extensionName );
    }
  };
}
