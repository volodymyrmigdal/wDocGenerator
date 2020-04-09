( function _Helper_js() {

let state = require( 'dmd/lib/state.js' );
let handlebars = require( 'handlebars' );
let ddata = require( 'dmd/helpers/ddata.js' );
let _ = require( 'wFiles' )

//

function escapedAnchor( src )
{
  if ( typeof src !== 'string' ) return null;
  return src.replace( /[\.\+\/]/g, '_' );
}

//

// function saveToSearchIndex( anchor, parent )
// {
//   let id = this.name;

//   if( parent )
//   id = parent.name + '.' + this.name;

//   let url;

//   if( parent )
//   {
//     url = `/#/reference/${parent.kind}/${parent.name}?id=${anchor}`;
//   }
//   else
//   {
//     url = `/#/reference/${this.kind}/${this.name}?id=${anchor}`;
//   }

//   state.searchIndex[ id ] = { title : id, url : url };
// }

//

function emptyLine()
{
  return
  `
  `
}

//

function strCapitalize( src )
{
  return _.strCapitalize( src );
}

//

function namespacesGet( options )
{
  options.hash.kind = 'namespace'

  let index = Object.create( null );
  let identifiers = ddata._identifiers( options ).filter( e =>
  {
    if( index[ e.name ] )
    return false;
    index[ e.name ] = e;
    return true;
  })
  return handlebars.helpers.each( identifiers, options );
}

// function modules2( options )
// {
//   options.hash.kind = 'module';

//   debugger

//   let modules =  ddata._identifiers( options );

//   modules.forEach( ( m ) =>
//   {
//     let result = handlebars.helpers.each( [ m ], options );
//     state.resultsPerModule[ m.name ] = result;
//   })

//   return '';
// }

// function classes2( options )
// {
//   options.hash.kind = 'class';

//   let modules =  ddata._identifiers( options );

//   modules.forEach( ( m ) =>
//   {
//     let result = handlebars.helpers.each( [ m ], options );
//     state.resultsPerClass[ m.name ] = result;
//   })

//   return '';
// }

//

function summaryGet()
{
  let result = _.strIsolateInsideOrAll( this.summary, '<p>', '</p>' )[ 2 ];
  return result || this.summary;
}

//

function nameNoPrefix()
{
  let firstIsSmall = /[a-z]/.test( this.name[ 0 ] );
  let secondIsCapital = /[A-Z]/.test( this.name[ 1 ] );

  if( firstIsSmall && secondIsCapital )
  return this.name.slice( 1 );
  return this.name;
}

//

function nameForUrl()
{
  let name = nameNoPrefix.call( this );

  if( this.kind === 'namespace' )
  {
    name = name.replace( /[():\s]+/g, '_' );
    name = _.strRemoveBegin( name, '_' );
    name = _.strRemoveEnd( name, '_' );
    return name;
  }

  return name;
}


//

function currentEntity( options )
{
  options.hash.id = state.currentId;
  var result = ddata._identifier(options)
  return result ? options.fn(result) : 'ERROR, Cannot find entity.'
}

//

function entitySignature()
{
  let signature;

  var mSig = ddata.methodSig.call( this );

  if( ddata.isConstructor.call( this ) || ddata.isFunction.call( this ) )
  {
    signature = '( ' + mSig + ' )'
  }
  else if( ddata.isEvent.call( this ) )
  {
    if( mSig ) signature = '( ' + mSig + ' )'
  }

  return signature;
}

//

function getLink( input,options )
{
  var linked, matches, namepath
  var output = {}

  if ( ( matches = input.match(/.*?<(.*?)>/) ) )
  {
    namepath = matches[1]
  } else
  {
    namepath = input
  }

  options.hash = { id: namepath }
  linked = ddata._identifier( options )

  if (!linked)
  {
    options.hash = { longname: namepath }
    linked = ddata._identifier( options )
  }

  if( !linked )
  {
    output = { name: input, url: null }
  }
  else
  {
    output.name = linked.name;
    output.url = '/#/reference/';

    let parent = ddata.parentObject.call( linked, options );

    if( !parent )
    parent = linked;


    output.url += parent.kind + '/' + nameForUrl.call( parent ) + '#' + entityKind.call( linked, options ) + '_' + nameNoPrefix.call( linked );
  }

  return output;
}

//

function inlineLinks (text, options)
{
  if( text )
  {
    if( _.strHas( text, 'wTools.arrayLeftIndex' ) )
    debugger

    var links = ddata.parseLink( text );

    if( !links.length )
    {
      options.hash = { id: text };
      let entity = ddata._identifier( options )
      if( entity )
      links = [ { caption : entity.name, url : text, original : text } ];
    }

    links.forEach( function( link )
    {
      var linked = getLink(link.url, options);
      if (link.caption === link.url)
      link.caption = linked.name;
      if( linked.url )
      {
        link.url = linked.url;
        text = text.replace(link.original, `<a href=${link.url}>${link.caption}</a>`);
      }
    })
  }
  return text
}

//

function debug( src )
{
  logger.log( _.toStr( src, { levels : 99 } ) )
}

function entityKind( options )
{
  let kind = this.kind;
  let scope = this.scope;
  let parent = ddata.parentObject.call( this, options );

  if( parent && kind === 'function' )
  {
    if( scope === 'static' )
    kind = 'routine';

    if( scope === 'instance' )
    kind = 'method';
  }

  return kind;
}

exports.escapedAnchor = escapedAnchor;
// exports.saveToSearchIndex = saveToSearchIndex;
exports.emptyLine = emptyLine;

exports.namespaces = namespacesGet;
// exports.modules2 = modules2;
// exports.classes2 = classes2;
exports.summary = summaryGet;
exports.nameNoPrefix = nameNoPrefix;
exports.nameForUrl = nameForUrl;

exports.currentEntity = currentEntity;
exports.entitySignature = entitySignature;
exports.strCapitalize = strCapitalize;

exports.debug = debug;
exports.entityKind = entityKind;

exports.inlineLinks = inlineLinks;

})();
