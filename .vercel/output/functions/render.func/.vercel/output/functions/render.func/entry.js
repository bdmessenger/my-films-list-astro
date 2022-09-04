import * as adapter from '@astrojs/vercel/serverless/entrypoint';
import React, { createElement } from 'react';
import ReactDOM from 'react-dom/server';
import { escape } from 'html-escaper';
/* empty css                                      *//* empty css                            */import 'mime';
import 'kleur/colors';
import 'string-width';
import 'path-browserify';
import { compile } from 'path-to-regexp';

/**
 * Astro passes `children` as a string of HTML, so we need
 * a wrapper `div` to render that content as VNodes.
 *
 * As a bonus, we can signal to React that this subtree is
 * entirely static and will never change via `shouldComponentUpdate`.
 */
const StaticHtml = ({ value, name }) => {
	if (!value) return null;
	return createElement('astro-slot', {
		name,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: value },
	});
};

/**
 * This tells React to opt-out of re-rendering this subtree,
 * In addition to being a performance optimization,
 * this also allows other frameworks to attach to `children`.
 *
 * See https://preactjs.com/guide/v8/external-dom-mutations
 */
StaticHtml.shouldComponentUpdate = () => false;

const slotName$1 = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
const reactTypeof = Symbol.for('react.element');

function errorIsComingFromPreactComponent(err) {
	return (
		err.message &&
		(err.message.startsWith("Cannot read property '__H'") ||
			err.message.includes("(reading '__H')"))
	);
}

async function check$1(Component, props, children) {
	// Note: there are packages that do some unholy things to create "components".
	// Checking the $$typeof property catches most of these patterns.
	if (typeof Component === 'object') {
		const $$typeof = Component['$$typeof'];
		return $$typeof && $$typeof.toString().slice('Symbol('.length).startsWith('react');
	}
	if (typeof Component !== 'function') return false;

	if (Component.prototype != null && typeof Component.prototype.render === 'function') {
		return React.Component.isPrototypeOf(Component) || React.PureComponent.isPrototypeOf(Component);
	}

	let error = null;
	let isReactComponent = false;
	function Tester(...args) {
		try {
			const vnode = Component(...args);
			if (vnode && vnode['$$typeof'] === reactTypeof) {
				isReactComponent = true;
			}
		} catch (err) {
			if (!errorIsComingFromPreactComponent(err)) {
				error = err;
			}
		}

		return React.createElement('div');
	}

	await renderToStaticMarkup$1(Tester, props, children, {});

	if (error) {
		throw error;
	}
	return isReactComponent;
}

async function getNodeWritable() {
	let nodeStreamBuiltinModuleName = 'stream';
	let { Writable } = await import(nodeStreamBuiltinModuleName);
	return Writable;
}

async function renderToStaticMarkup$1(Component, props, { default: children, ...slotted }, metadata) {
	delete props['class'];
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		const name = slotName$1(key);
		slots[name] = React.createElement(StaticHtml, { value, name });
	}
	// Note: create newProps to avoid mutating `props` before they are serialized
	const newProps = {
		...props,
		...slots,
		children: children != null ? React.createElement(StaticHtml, { value: children }) : undefined,
	};
	const vnode = React.createElement(Component, newProps);
	let html;
	if (metadata && metadata.hydrate) {
		html = ReactDOM.renderToString(vnode);
		if ('renderToReadableStream' in ReactDOM) {
			html = await renderToReadableStreamAsync(vnode);
		} else {
			html = await renderToPipeableStreamAsync(vnode);
		}
	} else {
		if ('renderToReadableStream' in ReactDOM) {
			html = await renderToReadableStreamAsync(vnode);
		} else {
			html = await renderToStaticNodeStreamAsync(vnode);
		}
	}
	return { html };
}

async function renderToPipeableStreamAsync(vnode) {
	const Writable = await getNodeWritable();
	let html = '';
	return new Promise((resolve, reject) => {
		let error = undefined;
		let stream = ReactDOM.renderToPipeableStream(vnode, {
			onError(err) {
				error = err;
				reject(error);
			},
			onAllReady() {
				stream.pipe(
					new Writable({
						write(chunk, _encoding, callback) {
							html += chunk.toString('utf-8');
							callback();
						},
						destroy() {
							resolve(html);
						},
					})
				);
			},
		});
	});
}

async function renderToStaticNodeStreamAsync(vnode) {
	const Writable = await getNodeWritable();
	let html = '';
	return new Promise((resolve) => {
		let stream = ReactDOM.renderToStaticNodeStream(vnode);
		stream.pipe(
			new Writable({
				write(chunk, _encoding, callback) {
					html += chunk.toString('utf-8');
					callback();
				},
				destroy() {
					resolve(html);
				},
			})
		);
	});
}

async function renderToReadableStreamAsync(vnode) {
	const decoder = new TextDecoder();
	const stream = await ReactDOM.renderToReadableStream(vnode);
	let html = '';
	for await (const chunk of stream) {
		html += decoder.decode(chunk);
	}
	return html;
}

const _renderer1 = {
	check: check$1,
	renderToStaticMarkup: renderToStaticMarkup$1,
};

const ASTRO_VERSION = "1.1.1";
function createDeprecatedFetchContentFn() {
  return () => {
    throw new Error("Deprecated: Astro.fetchContent() has been replaced with Astro.glob().");
  };
}
function createAstroGlobFn() {
  const globHandler = (importMetaGlobResult, globValue) => {
    let allEntries = [...Object.values(importMetaGlobResult)];
    if (allEntries.length === 0) {
      throw new Error(`Astro.glob(${JSON.stringify(globValue())}) - no matches found.`);
    }
    return Promise.all(allEntries.map((fn) => fn()));
  };
  return globHandler;
}
function createAstro(filePathname, _site, projectRootStr) {
  const site = _site ? new URL(_site) : void 0;
  const referenceURL = new URL(filePathname, `http://localhost`);
  const projectRoot = new URL(projectRootStr);
  return {
    site,
    generator: `Astro v${ASTRO_VERSION}`,
    fetchContent: createDeprecatedFetchContentFn(),
    glob: createAstroGlobFn(),
    resolve(...segments) {
      let resolved = segments.reduce((u, segment) => new URL(segment, u), referenceURL).pathname;
      if (resolved.startsWith(projectRoot.pathname)) {
        resolved = "/" + resolved.slice(projectRoot.pathname.length);
      }
      return resolved;
    }
  };
}

const escapeHTML = escape;
class HTMLString extends String {
}
const markHTMLString = (value) => {
  if (value instanceof HTMLString) {
    return value;
  }
  if (typeof value === "string") {
    return new HTMLString(value);
  }
  return value;
};

class Metadata {
  constructor(filePathname, opts) {
    this.modules = opts.modules;
    this.hoisted = opts.hoisted;
    this.hydratedComponents = opts.hydratedComponents;
    this.clientOnlyComponents = opts.clientOnlyComponents;
    this.hydrationDirectives = opts.hydrationDirectives;
    this.mockURL = new URL(filePathname, "http://example.com");
    this.metadataCache = /* @__PURE__ */ new Map();
  }
  resolvePath(specifier) {
    if (specifier.startsWith(".")) {
      const resolved = new URL(specifier, this.mockURL).pathname;
      if (resolved.startsWith("/@fs") && resolved.endsWith(".jsx")) {
        return resolved.slice(0, resolved.length - 4);
      }
      return resolved;
    }
    return specifier;
  }
  getPath(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentUrl) || null;
  }
  getExport(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentExport) || null;
  }
  getComponentMetadata(Component) {
    if (this.metadataCache.has(Component)) {
      return this.metadataCache.get(Component);
    }
    const metadata = this.findComponentMetadata(Component);
    this.metadataCache.set(Component, metadata);
    return metadata;
  }
  findComponentMetadata(Component) {
    const isCustomElement = typeof Component === "string";
    for (const { module, specifier } of this.modules) {
      const id = this.resolvePath(specifier);
      for (const [key, value] of Object.entries(module)) {
        if (isCustomElement) {
          if (key === "tagName" && Component === value) {
            return {
              componentExport: key,
              componentUrl: id
            };
          }
        } else if (Component === value) {
          return {
            componentExport: key,
            componentUrl: id
          };
        }
      }
    }
    return null;
  }
}
function createMetadata(filePathname, options) {
  return new Metadata(filePathname, options);
}

const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7
};
function serializeArray(value) {
  return value.map((v) => convertToSerializedForm(v));
}
function serializeObject(value) {
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v)];
    })
  );
}
function convertToSerializedForm(value) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [PROP_TYPE.Map, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object Set]": {
      return [PROP_TYPE.Set, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, JSON.stringify(serializeArray(value))];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value)];
      } else {
        return [PROP_TYPE.Value, value];
      }
    }
  }
}
function serializeProps(props) {
  return JSON.stringify(serializeObject(props));
}

function serializeListValue(value) {
  const hash = {};
  push(value);
  return Object.keys(hash).join(" ");
  function push(item) {
    if (item && typeof item.forEach === "function")
      item.forEach(push);
    else if (item === Object(item))
      Object.keys(item).forEach((name) => {
        if (item[name])
          push(name);
      });
    else {
      item = item === false || item == null ? "" : String(item).trim();
      if (item) {
        item.split(/\s+/).forEach((name) => {
          hash[name] = true;
        });
      }
    }
  }
}

const HydrationDirectivesRaw = ["load", "idle", "media", "visible", "only"];
const HydrationDirectives = new Set(HydrationDirectivesRaw);
const HydrationDirectiveProps = new Set(HydrationDirectivesRaw.map((n) => `client:${n}`));
function extractDirectives(inputProps) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        case "client:component-hydration": {
          break;
        }
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!HydrationDirectives.has(extracted.hydration.directive)) {
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${Array.from(
                HydrationDirectiveProps
              ).join(", ")}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new Error(
              'Error: Media query must be provided for "client:media", similar to client:media="(max-width: 600px)"'
            );
          }
          break;
        }
      }
    } else if (key === "class:list") {
      extracted.props[key.slice(0, -5)] = serializeListValue(value);
    } else {
      extracted.props[key] = value;
    }
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new Error(
      `Unable to resolve a valid export for "${metadata.displayName}"! Please open an issue at https://astro.build/issues!`
    );
  }
  const island = {
    children: "",
    props: {
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = value;
    }
  }
  island.props["component-url"] = await result.resolve(componentUrl);
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(renderer.clientEntrypoint);
    island.props["props"] = escapeHTML(serializeProps(props));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  island.props["before-hydration-url"] = await result.resolve("astro:scripts/before-hydration.js");
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  return island;
}

var idle_prebuilt_default = `(self.Astro=self.Astro||{}).idle=t=>{const e=async()=>{await(await t())()};"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)},window.dispatchEvent(new Event("astro:idle"));`;

var load_prebuilt_default = `(self.Astro=self.Astro||{}).load=a=>{(async()=>await(await a())())()},window.dispatchEvent(new Event("astro:load"));`;

var media_prebuilt_default = `(self.Astro=self.Astro||{}).media=(s,a)=>{const t=async()=>{await(await s())()};if(a.value){const e=matchMedia(a.value);e.matches?t():e.addEventListener("change",t,{once:!0})}},window.dispatchEvent(new Event("astro:media"));`;

var only_prebuilt_default = `(self.Astro=self.Astro||{}).only=t=>{(async()=>await(await t())())()},window.dispatchEvent(new Event("astro:only"));`;

var visible_prebuilt_default = `(self.Astro=self.Astro||{}).visible=(s,c,n)=>{const r=async()=>{await(await s())()};let i=new IntersectionObserver(e=>{for(const t of e)if(!!t.isIntersecting){i.disconnect(),r();break}});for(let e=0;e<n.children.length;e++){const t=n.children[e];i.observe(t)}},window.dispatchEvent(new Event("astro:visible"));`;

var astro_island_prebuilt_default = `var l;{const c={0:t=>t,1:t=>JSON.parse(t,o),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(JSON.parse(t,o)),5:t=>new Set(JSON.parse(t,o)),6:t=>BigInt(t),7:t=>new URL(t)},o=(t,i)=>{if(t===""||!Array.isArray(i))return i;const[e,n]=i;return e in c?c[e](n):void 0};customElements.get("astro-island")||customElements.define("astro-island",(l=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=()=>{if(!this.hydrator||this.parentElement&&this.parentElement.closest("astro-island[ssr]"))return;const i=this.querySelectorAll("astro-slot"),e={},n=this.querySelectorAll("template[data-astro-template]");for(const s of n){const r=s.closest(this.tagName);!r||!r.isSameNode(this)||(e[s.getAttribute("data-astro-template")||"default"]=s.innerHTML,s.remove())}for(const s of i){const r=s.closest(this.tagName);!r||!r.isSameNode(this)||(e[s.getAttribute("name")||"default"]=s.innerHTML)}const a=this.hasAttribute("props")?JSON.parse(this.getAttribute("props"),o):{};this.hydrator(this)(this.Component,a,e,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),window.removeEventListener("astro:hydrate",this.hydrate),window.dispatchEvent(new CustomEvent("astro:hydrate"))}}connectedCallback(){!this.hasAttribute("await-children")||this.firstChild?this.childrenConnectedCallback():new MutationObserver((i,e)=>{e.disconnect(),this.childrenConnectedCallback()}).observe(this,{childList:!0})}async childrenConnectedCallback(){window.addEventListener("astro:hydrate",this.hydrate),await import(this.getAttribute("before-hydration-url")),this.start()}start(){const i=JSON.parse(this.getAttribute("opts")),e=this.getAttribute("client");if(Astro[e]===void 0){window.addEventListener(\`astro:\${e}\`,()=>this.start(),{once:!0});return}Astro[e](async()=>{const n=this.getAttribute("renderer-url"),[a,{default:s}]=await Promise.all([import(this.getAttribute("component-url")),n?import(n):()=>()=>{}]),r=this.getAttribute("component-export")||"default";if(!r.includes("."))this.Component=a[r];else{this.Component=a;for(const d of r.split("."))this.Component=this.Component[d]}return this.hydrator=s,this.hydrate},i,this)}attributeChangedCallback(){this.hydrator&&this.hydrate()}},l.observedAttributes=["props"],l))}`;

function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
const hydrationScripts = {
  idle: idle_prebuilt_default,
  load: load_prebuilt_default,
  only: only_prebuilt_default,
  media: media_prebuilt_default,
  visible: visible_prebuilt_default
};
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(directive) {
  if (!(directive in hydrationScripts)) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  const directiveScriptText = hydrationScripts[directive];
  return directiveScriptText;
}
function getPrescripts(type, directive) {
  switch (type) {
    case "both":
      return `<style>astro-island,astro-slot{display:contents}</style><script>${getDirectiveScriptText(directive) + astro_island_prebuilt_default}<\/script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(directive)}<\/script>`;
  }
  return "";
}

const Fragment = Symbol.for("astro:fragment");
const Renderer = Symbol.for("astro:renderer");
function stringifyChunk(result, chunk) {
  switch (chunk.type) {
    case "directive": {
      const { hydration } = chunk;
      let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
      let needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
      let prescriptType = needsHydrationScript ? "both" : needsDirectiveScript ? "directive" : null;
      if (prescriptType) {
        let prescripts = getPrescripts(prescriptType, hydration.directive);
        return markHTMLString(prescripts);
      } else {
        return "";
      }
    }
    default: {
      return chunk.toString();
    }
  }
}

function validateComponentProps(props, displayName) {
  var _a;
  if (((_a = {"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true}) == null ? void 0 : _a.DEV) && props != null) {
    for (const prop of Object.keys(props)) {
      if (HydrationDirectiveProps.has(prop)) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`
        );
      }
    }
  }
}
class AstroComponent {
  constructor(htmlParts, expressions) {
    this.htmlParts = htmlParts;
    this.expressions = expressions;
  }
  get [Symbol.toStringTag]() {
    return "AstroComponent";
  }
  async *[Symbol.asyncIterator]() {
    const { htmlParts, expressions } = this;
    for (let i = 0; i < htmlParts.length; i++) {
      const html = htmlParts[i];
      const expression = expressions[i];
      yield markHTMLString(html);
      yield* renderChild(expression);
    }
  }
}
function isAstroComponent(obj) {
  return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object AstroComponent]";
}
function isAstroComponentFactory(obj) {
  return obj == null ? false : !!obj.isAstroComponentFactory;
}
async function* renderAstroComponent(component) {
  for await (const value of component) {
    if (value || value === 0) {
      for await (const chunk of renderChild(value)) {
        switch (chunk.type) {
          case "directive": {
            yield chunk;
            break;
          }
          default: {
            yield markHTMLString(chunk);
            break;
          }
        }
      }
    }
  }
}
async function renderToString(result, componentFactory, props, children) {
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    const response = Component;
    throw response;
  }
  let html = "";
  for await (const chunk of renderAstroComponent(Component)) {
    html += stringifyChunk(result, chunk);
  }
  return html;
}
async function renderToIterable(result, componentFactory, displayName, props, children) {
  validateComponentProps(props, displayName);
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    console.warn(
      `Returning a Response is only supported inside of page components. Consider refactoring this logic into something like a function that can be used in the page.`
    );
    const response = Component;
    throw response;
  }
  return renderAstroComponent(Component);
}
async function renderTemplate(htmlParts, ...expressions) {
  return new AstroComponent(htmlParts, expressions);
}

async function* renderChild(child) {
  child = await child;
  if (child instanceof HTMLString) {
    yield child;
  } else if (Array.isArray(child)) {
    for (const value of child) {
      yield markHTMLString(await renderChild(value));
    }
  } else if (typeof child === "function") {
    yield* renderChild(child());
  } else if (typeof child === "string") {
    yield markHTMLString(escapeHTML(child));
  } else if (!child && child !== 0) ; else if (child instanceof AstroComponent || Object.prototype.toString.call(child) === "[object AstroComponent]") {
    yield* renderAstroComponent(child);
  } else if (typeof child === "object" && Symbol.asyncIterator in child) {
    yield* child;
  } else {
    yield child;
  }
}
async function renderSlot(result, slotted, fallback) {
  if (slotted) {
    let iterator = renderChild(slotted);
    let content = "";
    for await (const chunk of iterator) {
      if (chunk.type === "directive") {
        content += stringifyChunk(result, chunk);
      } else {
        content += chunk;
      }
    }
    return markHTMLString(content);
  }
  return fallback;
}

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary = dictionary.length;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}

const voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes = /^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i;
const htmlEnumAttributes = /^(contenteditable|draggable|spellcheck|value)$/i;
const svgEnumAttributes = /^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
const toIdent = (k) => k.trim().replace(/(?:(?<!^)\b\w|\s+|[^\w]+)/g, (match, index) => {
  if (/[^\w]|\s/.test(match))
    return "";
  return index === 0 ? match : match.toUpperCase();
});
const toAttributeString = (value, shouldEscape = true) => shouldEscape ? String(value).replace(/&/g, "&#38;").replace(/"/g, "&#34;") : value;
const kebab = (k) => k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const toStyleString = (obj) => Object.entries(obj).map(([k, v]) => `${kebab(k)}:${v}`).join(";");
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `let ${toIdent(key)} = ${JSON.stringify(value)};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
function addAttribute(value, key, shouldEscape = true) {
  if (value == null) {
    return "";
  }
  if (value === false) {
    if (htmlEnumAttributes.test(key) || svgEnumAttributes.test(key)) {
      return markHTMLString(` ${key}="false"`);
    }
    return "";
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    const listValue = toAttributeString(serializeListValue(value));
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString) && typeof value === "object") {
    return markHTMLString(` ${key}="${toStyleString(value)}"`);
  }
  if (key === "className") {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  }
  if (value === true && (key.startsWith("data-") || htmlBooleanAttributes.test(key))) {
    return markHTMLString(` ${key}`);
  } else {
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  }
}
function internalSpreadAttributes(values, shouldEscape = true) {
  let output = "";
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape);
  }
  return markHTMLString(output);
}
function renderElement$1(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children = defineScriptVars(defineVars) + "\n" + children;
    }
  }
  if ((children == null || children == "") && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape)} />`;
  }
  return `<${name}${internalSpreadAttributes(props, shouldEscape)}>${children}</${name}>`;
}

function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlot(result, slots == null ? void 0 : slots.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName)
    return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}

const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
function guessRenderers(componentUrl) {
  const extname = componentUrl == null ? void 0 : componentUrl.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact"];
    default:
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/vue", "@astrojs/svelte"];
  }
}
function getComponentType(Component) {
  if (Component === Fragment) {
    return "fragment";
  }
  if (Component && typeof Component === "object" && Component["astro:html"]) {
    return "html";
  }
  if (isAstroComponentFactory(Component)) {
    return "astro-factory";
  }
  return "unknown";
}
async function renderComponent(result, displayName, Component, _props, slots = {}) {
  var _a;
  Component = await Component;
  switch (getComponentType(Component)) {
    case "fragment": {
      const children2 = await renderSlot(result, slots == null ? void 0 : slots.default);
      if (children2 == null) {
        return children2;
      }
      return markHTMLString(children2);
    }
    case "html": {
      const children2 = {};
      if (slots) {
        await Promise.all(
          Object.entries(slots).map(
            ([key, value]) => renderSlot(result, value).then((output) => {
              children2[key] = output;
            })
          )
        );
      }
      const html2 = Component.render({ slots: children2 });
      return markHTMLString(html2);
    }
    case "astro-factory": {
      async function* renderAstroComponentInline() {
        let iterable = await renderToIterable(result, Component, displayName, _props, slots);
        yield* iterable;
      }
      return renderAstroComponentInline();
    }
  }
  if (!Component && !_props["client:only"]) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers } = result._metadata;
  const metadata = { displayName };
  const { hydration, isPage, props } = extractDirectives(_props);
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  if (Array.isArray(renderers) && renderers.length === 0 && typeof Component !== "string" && !componentIsHTMLElement(Component)) {
    const message = `Unable to render ${metadata.displayName}!

There are no \`integrations\` set in your \`astro.config.mjs\` file.
Did you mean to add ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`;
    throw new Error(message);
  }
  const children = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlot(result, value).then((output) => {
          children[key] = output;
        })
      )
    );
  }
  let renderer;
  if (metadata.hydrate !== "only") {
    if (Component && Component[Renderer]) {
      const rendererName = Component[Renderer];
      renderer = renderers.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error;
      for (const r of renderers) {
        try {
          if (await r.ssr.check.call({ result }, Component, props, children)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error ?? (error = e);
        }
      }
      if (!renderer && error) {
        throw error;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = renderHTMLElement(result, Component, _props, slots);
      return output;
    }
  } else {
    if (metadata.hydrateArgs) {
      const passedName = metadata.hydrateArgs;
      const rendererName = rendererAliases.has(passedName) ? rendererAliases.get(passedName) : passedName;
      renderer = renderers.find(
        ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
      );
    }
    if (!renderer && renderers.length === 1) {
      renderer = renderers[0];
    }
    if (!renderer) {
      const extname = (_a = metadata.componentUrl) == null ? void 0 : _a.split(".").pop();
      renderer = renderers.filter(
        ({ name }) => name === `@astrojs/${extname}` || name === extname
      )[0];
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      throw new Error(`Unable to render ${metadata.displayName}!

Using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.
Did you mean to pass <${metadata.displayName} client:only="${probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|")}" />
`);
    } else if (typeof Component !== "string") {
      const matchingRenderers = renderers.filter((r) => probableRendererNames.includes(r.name));
      const plural = renderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new Error(`Unable to render ${metadata.displayName}!

There ${plural ? "are" : "is"} ${renderers.length} renderer${plural ? "s" : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were" : "it was not"} able to server-side render ${metadata.displayName}.

Did you mean to enable ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`);
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          props,
          children,
          metadata
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      html = await renderSlot(result, slots == null ? void 0 : slots.fallback);
    } else {
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        props,
        children,
        metadata
      ));
    }
  }
  if (renderer && !renderer.clientEntrypoint && renderer.name !== "@astrojs/lit" && metadata.hydrate) {
    throw new Error(
      `${metadata.displayName} component has a \`client:${metadata.hydrate}\` directive, but no client entrypoint was provided by ${renderer.name}!`
    );
  }
  if (!html && typeof Component === "string") {
    const childSlots = Object.values(children).join("");
    const iterable = renderAstroComponent(
      await renderTemplate`<${Component}${internalSpreadAttributes(props)}${markHTMLString(
        childSlots === "" && voidElementNames.test(Component) ? `/>` : `>${childSlots}</${Component}>`
      )}`
    );
    html = "";
    for await (const chunk of iterable) {
      html += chunk;
    }
  }
  if (!hydration) {
    if (isPage || (renderer == null ? void 0 : renderer.name) === "astro:jsx") {
      return html;
    }
    return markHTMLString(html.replace(/\<\/?astro-slot\>/g, ""));
  }
  const astroId = shorthash(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        if (!html.includes(key === "default" ? `<astro-slot>` : `<astro-slot name="${key}">`)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
  }
  async function* renderAll() {
    yield { type: "directive", hydration, result };
    yield markHTMLString(renderElement$1("astro-island", island, false));
  }
  return renderAll();
}

const uniqueElements = (item, index, all) => {
  const props = JSON.stringify(item.props);
  const children = item.children;
  return index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children);
};
const alreadyHeadRenderedResults = /* @__PURE__ */ new WeakSet();
function renderHead(result) {
  alreadyHeadRenderedResults.add(result);
  const styles = Array.from(result.styles).filter(uniqueElements).map((style) => renderElement$1("style", style));
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script, i) => {
    return renderElement$1("script", script, false);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement$1("link", link, false));
  return markHTMLString(links.join("\n") + styles.join("\n") + scripts.join("\n"));
}
async function* maybeRenderHead(result) {
  if (alreadyHeadRenderedResults.has(result)) {
    return;
  }
  yield renderHead(result);
}

typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";

new TextEncoder();

function createComponent(cb) {
  cb.isAstroComponentFactory = true;
  return cb;
}
function spreadAttributes(values, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true);
  }
  return markHTMLString(output);
}

const AstroJSX = "astro:jsx";
const Empty = Symbol("empty");
const toSlotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}
function transformSlots(vnode) {
  if (typeof vnode.type === "string")
    return vnode;
  const slots = {};
  if (isVNode(vnode.props.children)) {
    const child = vnode.props.children;
    if (!isVNode(child))
      return;
    if (!("slot" in child.props))
      return;
    const name = toSlotName(child.props.slot);
    slots[name] = [child];
    slots[name]["$$slot"] = true;
    delete child.props.slot;
    delete vnode.props.children;
  }
  if (Array.isArray(vnode.props.children)) {
    vnode.props.children = vnode.props.children.map((child) => {
      if (!isVNode(child))
        return child;
      if (!("slot" in child.props))
        return child;
      const name = toSlotName(child.props.slot);
      if (Array.isArray(slots[name])) {
        slots[name].push(child);
      } else {
        slots[name] = [child];
        slots[name]["$$slot"] = true;
      }
      delete child.props.slot;
      return Empty;
    }).filter((v) => v !== Empty);
  }
  Object.assign(vnode.props, slots);
}
function markRawChildren(child) {
  if (typeof child === "string")
    return markHTMLString(child);
  if (Array.isArray(child))
    return child.map((c) => markRawChildren(c));
  return child;
}
function transformSetDirectives(vnode) {
  if (!("set:html" in vnode.props || "set:text" in vnode.props))
    return;
  if ("set:html" in vnode.props) {
    const children = markRawChildren(vnode.props["set:html"]);
    delete vnode.props["set:html"];
    Object.assign(vnode.props, { children });
    return;
  }
  if ("set:text" in vnode.props) {
    const children = vnode.props["set:text"];
    delete vnode.props["set:text"];
    Object.assign(vnode.props, { children });
    return;
  }
}
function createVNode(type, props) {
  const vnode = {
    [AstroJSX]: true,
    type,
    props: props ?? {}
  };
  transformSetDirectives(vnode);
  transformSlots(vnode);
  return vnode;
}

const ClientOnlyPlaceholder = "astro-client-only";
const skipAstroJSXCheck = /* @__PURE__ */ new WeakSet();
let originalConsoleError;
let consoleFilterRefs = 0;
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join("")
      );
  }
  if (isVNode(vnode)) {
    switch (true) {
      case vnode.type === Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case vnode.type.isAstroComponentFactory: {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        return markHTMLString(await renderToString(result, vnode.type, props, slots));
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder):
        return markHTMLString(await renderElement(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props) {
          _slots[child.props.slot] = [..._slots[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.type["astro:renderer"]) {
        skipAstroJSXCheck.add(vnode.type);
      }
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function" && !skipAstroJSXCheck.has(vnode.type)) {
        useConsoleFilter();
        try {
          const output2 = await vnode.type(vnode.props ?? {});
          if (output2 && output2[AstroJSX]) {
            return await renderJSX(result, output2);
          } else if (!output2) {
            return await renderJSX(result, output2);
          }
        } catch (e) {
          skipAstroJSXCheck.add(vnode.type);
        } finally {
          finishUsingConsoleFilter();
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: []
      };
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0)
              return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      let output;
      if (vnode.type === ClientOnlyPlaceholder && vnode.props["client:only"]) {
        output = await renderComponent(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponent(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      if (typeof output !== "string" && Symbol.asyncIterator in output) {
        let body = "";
        for await (const chunk of output) {
          let html = stringifyChunk(result, chunk);
          body += html;
        }
        return markHTMLString(body);
      } else {
        return markHTMLString(output);
      }
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children == "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, children)}</${tag}>`
    )}`
  );
}
function useConsoleFilter() {
  consoleFilterRefs++;
  if (!originalConsoleError) {
    originalConsoleError = console.error;
    try {
      console.error = filteredConsoleError;
    } catch (error) {
    }
  }
}
function finishUsingConsoleFilter() {
  consoleFilterRefs--;
}
function filteredConsoleError(msg, ...rest) {
  if (consoleFilterRefs > 0 && typeof msg === "string") {
    const isKnownReactHookError = msg.includes("Warning: Invalid hook call.") && msg.includes("https://reactjs.org/link/invalid-hook-call");
    if (isKnownReactHookError)
      return;
  }
}

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(Component, props, { default: children = null, ...slotted } = {}) {
  if (typeof Component !== "function")
    return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children });
    return result[AstroJSX];
  } catch (e) {
  }
  return false;
}
async function renderToStaticMarkup(Component, props = {}, { default: children = null, ...slotted } = {}) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  const html = await renderJSX(result, createVNode(Component, { ...props, ...slots, children }));
  return { html };
}
var server_default = {
  check,
  renderToStaticMarkup
};

const $$metadata$6 = createMetadata("/@fs/C:/Users/branb/Code/my-films-list/src/components/Header.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$6 = createAstro("/@fs/C:/Users/branb/Code/my-films-list/src/components/Header.astro", "", "file:///C:/Users/branb/Code/my-films-list/");
const $$Header = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Header;
  return renderTemplate`${maybeRenderHead($$result)}<header class="bg-blue-700 sticky top-0 z-[99] mb-5 py-4">
    <nav class="container mx-auto px-4 max-w-7xl flex justify-between">
        <a href="/">
            <h4>My Films List</h4>
        </a>
        <ul>
            <li>
                <a href="/">Home</a>
            </li>
        </ul>
    </nav>
</header>`;
});

const $$file$6 = "C:/Users/branb/Code/my-films-list/src/components/Header.astro";
const $$url$6 = undefined;

const $$module1$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$6,
	default: $$Header,
	file: $$file$6,
	url: $$url$6
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$5 = createMetadata("/@fs/C:/Users/branb/Code/my-films-list/src/layouts/Layout.astro", { modules: [{ module: $$module1$1, specifier: "../components/Header.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$5 = createAstro("/@fs/C:/Users/branb/Code/my-films-list/src/layouts/Layout.astro", "", "file:///C:/Users/branb/Code/my-films-list/");
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width">
		<link rel="icon" type="image/svg+xml" href="/favicon.svg">
		<meta name="generator"${addAttribute(Astro2.generator, "content")}>
		<title>${title}</title>
	${renderHead($$result)}</head>
	<body class="bg-blue-500 text-blue-50">
		${renderComponent($$result, "Header", $$Header, {})}
		${renderSlot($$result, $$slots["default"])}
	</body></html>`;
});

const $$file$5 = "C:/Users/branb/Code/my-films-list/src/layouts/Layout.astro";
const $$url$5 = undefined;

const $$module1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$5,
	default: $$Layout,
	file: $$file$5,
	url: $$url$5
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$4 = createMetadata("/@fs/C:/Users/branb/Code/my-films-list/src/components/FilmCard.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$4 = createAstro("/@fs/C:/Users/branb/Code/my-films-list/src/components/FilmCard.astro", "", "file:///C:/Users/branb/Code/my-films-list/");
const $$FilmCard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$FilmCard;
  const { film } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<div class="group bg-blue-800 overflow-hidden rounded-lg w-full relative cursor-pointer drop-shadow-[13px_12px_8px_-2px_rgba(15,33,84,0.79)]">
    <a${addAttribute(`/film/${film.id}`, "href")}>
        <div class="relative w-full pt-[50%] opacity-50 lg:opacity-70 group-hover:opacity-10 lg:group-hover:opacity-30 transition-opacity duration-150 ease-in">
            <img width="500" height="281" class="w-full absolute top-1/2 left-0 translate-y-[-50%]"${addAttribute(film.backdropURL, "src")}>
        </div>
        <div class="transition-opacity duration-150 ease-in lg:opacity-0 group-hover:opacity-100 flex absolute top-0 left-0 w-full h-full justify-center items-center text-center text-2xl p-4">${film.title}</div>
    </a>
</div>`;
});

const $$file$4 = "C:/Users/branb/Code/my-films-list/src/components/FilmCard.astro";
const $$url$4 = undefined;

const $$module2$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$4,
	default: $$FilmCard,
	file: $$file$4,
	url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

const created_by = "bdmessenger";
const description = "";
const favorite_count = 0;
const id = "5802933";
const items = [
	{
		adult: false,
		backdrop_path: "/30lunazeLIB9bZVoPNOVbCC9Xx4.jpg",
		genre_ids: [
			35,
			12
		],
		id: 5683,
		media_type: "movie",
		original_language: "en",
		original_title: "Pee-wee's Big Adventure",
		overview: "The eccentric and childish Pee-wee Herman embarks on a big adventure when his beloved bicycle is stolen. Armed with information from a fortune-teller and a relentless obsession with his prized possession, Pee-wee encounters a host of odd characters and bizarre situations as he treks across the country to recover his bike.",
		popularity: 11.359,
		poster_path: "/414IUXc54mrhX88ZUQiRDLXn01i.jpg",
		release_date: "1985-07-26",
		title: "Pee-wee's Big Adventure",
		video: false,
		vote_average: 6.4,
		vote_count: 624
	},
	{
		adult: false,
		backdrop_path: "/eIi3klFf7mp3oL5EEF4mLIDs26r.jpg",
		genre_ids: [
			878,
			18,
			53
		],
		id: 78,
		media_type: "movie",
		original_language: "en",
		original_title: "Blade Runner",
		overview: "In the smog-choked dystopian Los Angeles of 2019, blade runner Rick Deckard is called out of retirement to terminate a quartet of replicants who have escaped to Earth seeking their creator for a way to extend their short life spans.",
		popularity: 38.407,
		poster_path: "/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg",
		release_date: "1982-06-25",
		title: "Blade Runner",
		video: false,
		vote_average: 7.9,
		vote_count: 11691
	},
	{
		adult: false,
		backdrop_path: "/c7Mjuip0jfHLY7x8ZSEriRj45cu.jpg",
		genre_ids: [
			12,
			28
		],
		id: 85,
		media_type: "movie",
		original_language: "en",
		original_title: "Raiders of the Lost Ark",
		overview: "When Dr. Indiana Jones – the tweed-suited professor who just happens to be a celebrated archaeologist – is hired by the government to locate the legendary Ark of the Covenant, he finds himself up against the entire Nazi regime.",
		popularity: 36.205,
		poster_path: "/ceG9VzoRAVGwivFU403Wc3AHRys.jpg",
		release_date: "1981-06-12",
		title: "Raiders of the Lost Ark",
		video: false,
		vote_average: 7.9,
		vote_count: 10294
	},
	{
		adult: false,
		backdrop_path: "/cE9Gtz5KEVkien4VDSgXjtwfcs.jpg",
		genre_ids: [
			28,
			12,
			878
		],
		id: 861,
		media_type: "movie",
		original_language: "en",
		original_title: "Total Recall",
		overview: "Construction worker Douglas Quaid's obsession with the planet Mars leads him to visit Recall, a company who manufacture memories. Something goes wrong during his memory implant turning Doug's life upside down and even to question what is reality and what isn't.",
		popularity: 34.657,
		poster_path: "/wVbeL6fkbTKSmNfalj4VoAUUqJv.jpg",
		release_date: "1990-06-01",
		title: "Total Recall",
		video: false,
		vote_average: 7.3,
		vote_count: 4751
	},
	{
		adult: false,
		backdrop_path: "/lO5pFsXSwO7gkUbkhx4W6nooyVe.jpg",
		genre_ids: [
			18,
			878,
			9648
		],
		id: 329865,
		media_type: "movie",
		original_language: "en",
		original_title: "Arrival",
		overview: "Taking place after alien crafts land around the world, an expert linguist is recruited by the military to determine whether they come in peace or are a threat.",
		popularity: 55.446,
		poster_path: "/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
		release_date: "2016-11-10",
		title: "Arrival",
		video: false,
		vote_average: 7.6,
		vote_count: 15364
	},
	{
		adult: false,
		backdrop_path: "/hdHIjZxq3SWFqpAz4NFhdbud0iz.jpg",
		genre_ids: [
			27,
			878
		],
		id: 348,
		media_type: "movie",
		original_language: "en",
		original_title: "Alien",
		overview: "During its return to the earth, commercial spaceship Nostromo intercepts a distress signal from a distant planet. When a three-member team of the crew discovers a chamber containing thousands of eggs on the planet, a creature inside one of the eggs attacks an explorer. The entire crew is unaware of the impending nightmare set to descend upon them when the alien parasite planted inside its unfortunate host is birthed.",
		popularity: 66.421,
		poster_path: "/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg",
		release_date: "1979-05-25",
		title: "Alien",
		video: false,
		vote_average: 8.1,
		vote_count: 11946
	},
	{
		adult: false,
		backdrop_path: "/aRka9neADW1M0Zf9lF8kW2jEgXe.jpg",
		genre_ids: [
			27,
			53
		],
		id: 948,
		media_type: "movie",
		original_language: "en",
		original_title: "Halloween",
		overview: "Fifteen years after murdering his sister on Halloween Night 1963, Michael Myers escapes from a mental hospital and returns to the small town of Haddonfield, Illinois to kill again.",
		popularity: 42.331,
		poster_path: "/qVpCaBcnjRzGL3nOPHi6Suy0sB6.jpg",
		release_date: "1978-10-24",
		title: "Halloween",
		video: false,
		vote_average: 7.6,
		vote_count: 4350
	},
	{
		adult: false,
		backdrop_path: "/o51fkX20MoZSvhQ1coH03pc2XVG.jpg",
		genre_ids: [
			18,
			9648,
			27
		],
		id: 2291,
		media_type: "movie",
		original_language: "en",
		original_title: "Jacob's Ladder",
		overview: "After returning home from the Vietnam War, veteran Jacob Singer struggles to maintain his sanity. Plagued by hallucinations and flashbacks, Singer rapidly falls apart as the world and people around him morph and twist into disturbing images. His girlfriend, Jezzie, and ex-wife, Sarah, try to help, but to little avail. Even Singer's chiropractor friend, Louis, fails to reach him as he descends into madness.",
		popularity: 16.711,
		poster_path: "/4GY4FsM0ZOtbSTeMpY0g4WkEuBW.jpg",
		release_date: "1990-11-02",
		title: "Jacob's Ladder",
		video: false,
		vote_average: 7.4,
		vote_count: 1242
	},
	{
		adult: false,
		backdrop_path: "/yrdAamkeqXHm0UYukk8xgoCvc7G.jpg",
		genre_ids: [
			12,
			28,
			878
		],
		id: 11,
		media_type: "movie",
		original_language: "en",
		original_title: "Star Wars",
		overview: "Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Empire.",
		popularity: 76.27,
		poster_path: "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
		release_date: "1977-05-25",
		title: "Star Wars",
		video: false,
		vote_average: 8.2,
		vote_count: 17600
	},
	{
		adult: false,
		backdrop_path: "/5bzPWQ2dFUl2aZKkp7ILJVVkRed.jpg",
		genre_ids: [
			12,
			35,
			878,
			10751
		],
		id: 105,
		media_type: "movie",
		original_language: "en",
		original_title: "Back to the Future",
		overview: "Eighties teenager Marty McFly is accidentally sent back in time to 1955, inadvertently disrupting his parents' first meeting and attracting his mother's romantic interest. Marty must repair the damage to history by rekindling his parents' romance and - with the help of his eccentric inventor friend Doc Brown - return to 1985.",
		popularity: 75.678,
		poster_path: "/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg",
		release_date: "1985-07-03",
		title: "Back to the Future",
		video: false,
		vote_average: 8.3,
		vote_count: 16890
	},
	{
		adult: false,
		backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
		genre_ids: [
			12,
			18,
			878
		],
		id: 157336,
		media_type: "movie",
		original_language: "en",
		original_title: "Interstellar",
		overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
		popularity: 151.698,
		poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
		release_date: "2014-11-05",
		title: "Interstellar",
		video: false,
		vote_average: 8.4,
		vote_count: 29190
	},
	{
		adult: false,
		backdrop_path: "/kjC48HRQpojr3FHx5pZF7Ro9xFg.jpg",
		genre_ids: [
			12,
			28,
			53
		],
		id: 36557,
		media_type: "movie",
		original_language: "en",
		original_title: "Casino Royale",
		overview: "Le Chiffre, a banker to the world's terrorists, is scheduled to participate in a high-stakes poker game in Montenegro, where he intends to use his winnings to establish his financial grip on the terrorist market. M sends Bond—on his maiden mission as a 00 Agent—to attend this game and prevent Le Chiffre from winning. With the help of Vesper Lynd and Felix Leiter, Bond enters the most important poker game in his already dangerous career.",
		popularity: 37.145,
		poster_path: "/8Gv1dylImVuoj3bZtEWoL1TLl2q.jpg",
		release_date: "2006-11-14",
		title: "Casino Royale",
		video: false,
		vote_average: 7.5,
		vote_count: 9129
	},
	{
		adult: false,
		backdrop_path: "/n2nm4aZRmXyJ9LT4xQX9X6ThcP7.jpg",
		genre_ids: [
			28,
			878
		],
		id: 603,
		media_type: "movie",
		original_language: "en",
		original_title: "The Matrix",
		overview: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
		popularity: 84.982,
		poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
		release_date: "1999-03-30",
		title: "The Matrix",
		video: false,
		vote_average: 8.2,
		vote_count: 21971
	},
	{
		adult: false,
		backdrop_path: "/rpp7XSFsFgaslZB5IqDDdZB9CjR.jpg",
		genre_ids: [
			35
		],
		id: 813,
		media_type: "movie",
		original_language: "en",
		original_title: "Airplane!",
		overview: "The persons and events in this film are fictitious - fortunately! A masterpiece of off-the-wall comedy, Airplane! features Robert Hays as an ex-fighter pilot forced to take over the controls of an airliner when the flight crew succumbs to food poisoning; Julie Hagerty as his girlfriend/stewardess/co-pilot; and a cast of all-stars including Robert Stack, Lloyd Bridges, Peter Graves, Leslie Nielsen, Kareem Abdul-Jabbar... and more. Their hilarious high jinks spoof airplane disaster flicks, religious zealots, television commercials, romantic love... the list whirls by in rapid succession. And the story races from one moment of zany fun to the next.",
		popularity: 30.928,
		poster_path: "/7Q3efxd3AF1vQjlSxnlerSA7RzN.jpg",
		release_date: "1980-07-02",
		title: "Airplane!",
		video: false,
		vote_average: 7.3,
		vote_count: 3632
	},
	{
		adult: false,
		backdrop_path: "/4OrW7cqYrABIYbJHoVZUpE8AH1h.jpg",
		genre_ids: [
			27,
			9648
		],
		id: 2667,
		media_type: "movie",
		original_language: "en",
		original_title: "The Blair Witch Project",
		overview: "In October of 1994 three student filmmakers disappeared in the woods near Burkittsville, Maryland, while shooting a documentary. A year later their footage was found.",
		popularity: 48.738,
		poster_path: "/9050VGrYjYrEjpOvDZVAngLbg1f.jpg",
		release_date: "1999-07-14",
		title: "The Blair Witch Project",
		video: false,
		vote_average: 6.3,
		vote_count: 3845
	},
	{
		adult: false,
		backdrop_path: "/3BPocRQcnZG4BrxocERhP4TCtDY.jpg",
		genre_ids: [
			12,
			14,
			28,
			35,
			10751
		],
		id: 9593,
		media_type: "movie",
		original_language: "en",
		original_title: "Last Action Hero",
		overview: "Following the death of his father, young Danny Madigan takes comfort in watching action movies featuring the indestructible Los Angeles cop Jack Slater. After being given a magic ticket by theater manager Nick, Danny is sucked into the screen and bonds with Slater. When evil fictional villain Benedict gets his hands on the ticket and enters the real world, Danny and Jack must follow and stop him.",
		popularity: 24.766,
		poster_path: "/8B4aFGBHWmj2F4jkDNHjzSX2GOw.jpg",
		release_date: "1993-06-18",
		title: "Last Action Hero",
		video: false,
		vote_average: 6.4,
		vote_count: 2145
	},
	{
		adult: false,
		backdrop_path: "/hQ0k6RJwcWLJEHfP5vxrDpMiRdk.jpg",
		genre_ids: [
			28,
			53
		],
		id: 562,
		media_type: "movie",
		original_language: "en",
		original_title: "Die Hard",
		overview: "NYPD cop John McClane's plan to reconcile with his estranged wife is thrown for a serious loop when, minutes after he arrives at her office, the entire building is overtaken by a group of terrorists. With little help from the LAPD, wisecracking McClane sets out to single-handedly rescue the hostages and bring the bad guys down.",
		popularity: 41.228,
		poster_path: "/yFihWxQcmqcaBR31QM6Y8gT6aYV.jpg",
		release_date: "1988-07-15",
		title: "Die Hard",
		video: false,
		vote_average: 7.8,
		vote_count: 9290
	},
	{
		adult: false,
		backdrop_path: "/uif5fUshJrXyyDzfpzp1DLw3N0S.jpg",
		genre_ids: [
			27,
			18,
			53
		],
		id: 539,
		media_type: "movie",
		original_language: "en",
		original_title: "Psycho",
		overview: "When larcenous real estate clerk Marion Crane goes on the lam with a wad of cash and hopes of starting a new life, she ends up at the notorious Bates Motel, where manager Norman Bates cares for his housebound mother.",
		popularity: 41.729,
		poster_path: "/uK46P78BvWGDW4dbq9C13LAwpmw.jpg",
		release_date: "1960-06-22",
		title: "Psycho",
		video: false,
		vote_average: 8.4,
		vote_count: 8364
	},
	{
		adult: false,
		backdrop_path: "/3uM41OT0RfBkE6Gb6U89LEskJBr.jpg",
		genre_ids: [
			37,
			18,
			12
		],
		id: 281957,
		media_type: "movie",
		original_language: "en",
		original_title: "The Revenant",
		overview: "In the 1820s, a frontiersman, Hugh Glass, sets out on a path of vengeance against those who left him for dead after a bear mauling.",
		popularity: 56.699,
		poster_path: "/ji3ecJphATlVgWNY0B0RVXZizdf.jpg",
		release_date: "2015-12-25",
		title: "The Revenant",
		video: false,
		vote_average: 7.5,
		vote_count: 16088
	},
	{
		adult: false,
		backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
		genre_ids: [
			18,
			28,
			80,
			53
		],
		id: 155,
		media_type: "movie",
		original_language: "en",
		original_title: "The Dark Knight",
		overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
		popularity: 75.326,
		poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
		release_date: "2008-07-14",
		title: "The Dark Knight",
		video: false,
		vote_average: 8.5,
		vote_count: 28119
	},
	{
		adult: false,
		backdrop_path: "/gU84vBGG2x8K3x1zrz4SggiN5hr.jpg",
		genre_ids: [
			12,
			14,
			28
		],
		id: 120,
		media_type: "movie",
		original_language: "en",
		original_title: "The Lord of the Rings: The Fellowship of the Ring",
		overview: "Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home in order to keep it from falling into the hands of its evil creator. Along the way, a fellowship is formed to protect the ringbearer and make sure that the ring arrives at its final destination: Mt. Doom, the only place where it can be destroyed.",
		popularity: 140.69,
		poster_path: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
		release_date: "2001-12-18",
		title: "The Lord of the Rings: The Fellowship of the Ring",
		video: false,
		vote_average: 8.4,
		vote_count: 21374
	},
	{
		adult: false,
		backdrop_path: "/2UFxrUHVuSK3Tth7DvQQlF4mGTd.jpg",
		genre_ids: [
			28,
			878,
			12
		],
		id: 118340,
		media_type: "movie",
		original_language: "en",
		original_title: "Guardians of the Galaxy",
		overview: "Light years from Earth, 26 years after being abducted, Peter Quill finds himself the prime target of a manhunt after discovering an orb wanted by Ronan the Accuser.",
		popularity: 70.901,
		poster_path: "/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg",
		release_date: "2014-07-30",
		title: "Guardians of the Galaxy",
		video: false,
		vote_average: 7.9,
		vote_count: 24826
	},
	{
		adult: false,
		backdrop_path: "/7FWlcZq3r6525LWOcvO9kNWurN1.jpg",
		genre_ids: [
			12,
			28,
			878
		],
		id: 271110,
		media_type: "movie",
		original_language: "en",
		original_title: "Captain America: Civil War",
		overview: "Following the events of Age of Ultron, the collective governments of the world pass an act designed to regulate all superhuman activity. This polarizes opinion amongst the Avengers, causing two factions to side with Iron Man or Captain America, which causes an epic battle between former allies.",
		popularity: 134.959,
		poster_path: "/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg",
		release_date: "2016-04-27",
		title: "Captain America: Civil War",
		video: false,
		vote_average: 7.4,
		vote_count: 20186
	},
	{
		adult: false,
		backdrop_path: "/sWvxBXNtCOaGdtpKNLiOqmwb10N.jpg",
		genre_ids: [
			14,
			28
		],
		id: 557,
		media_type: "movie",
		original_language: "en",
		original_title: "Spider-Man",
		overview: "After being bitten by a genetically altered spider at Oscorp, nerdy but endearing high school student Peter Parker is endowed with amazing powers to become the superhero known as Spider-Man.",
		popularity: 119.503,
		poster_path: "/gh4cZbhZxyTbgxQPxD0dOudNPTn.jpg",
		release_date: "2002-05-01",
		title: "Spider-Man",
		video: false,
		vote_average: 7.2,
		vote_count: 16106
	},
	{
		adult: false,
		backdrop_path: "/3Rfvhy1Nl6sSGJwyjb0QiZzZYlB.jpg",
		genre_ids: [
			16,
			12,
			10751,
			35
		],
		id: 862,
		media_type: "movie",
		original_language: "en",
		original_title: "Toy Story",
		overview: "Led by Woody, Andy's toys live happily in his room until Andy's birthday brings Buzz Lightyear onto the scene. Afraid of losing his place in Andy's heart, Woody plots against Buzz. But when circumstances separate Buzz and Woody from their owner, the duo eventually learns to put aside their differences.",
		popularity: 189.424,
		poster_path: "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
		release_date: "1995-10-30",
		title: "Toy Story",
		video: false,
		vote_average: 8,
		vote_count: 15751
	},
	{
		adult: false,
		backdrop_path: "/vUTVUdfbsY4DePCYzxxDMXKp6v6.jpg",
		genre_ids: [
			16,
			35,
			10751
		],
		id: 585,
		media_type: "movie",
		original_language: "en",
		original_title: "Monsters, Inc.",
		overview: "James Sullivan and Mike Wazowski are monsters, they earn their living scaring children and are the best in the business... even though they're more afraid of the children than they are of them. When a child accidentally enters their world, James and Mike suddenly find that kids are not to be afraid of and they uncover a conspiracy that could threaten all children across the world.",
		popularity: 192.576,
		poster_path: "/sgheSKxZkttIe8ONsf2sWXPgip3.jpg",
		release_date: "2001-11-01",
		title: "Monsters, Inc.",
		video: false,
		vote_average: 7.8,
		vote_count: 15845
	},
	{
		adult: false,
		backdrop_path: "/5HKdFlSWI6U7CjyNAHH6xJHQZHX.jpg",
		genre_ids: [
			878,
			12
		],
		id: 2157,
		media_type: "movie",
		original_language: "en",
		original_title: "Lost in Space",
		overview: "The prospects for continuing life on Earth in the year 2058 are grim. So the Robinsons are launched into space to colonize Alpha Prime, the only other inhabitable planet in the galaxy. But when a stowaway sabotages the mission, the Robinsons find themselves hurtling through uncharted space.",
		popularity: 24.28,
		poster_path: "/4miEpZmUOMqV8P0T6oq5HVBiVHw.jpg",
		release_date: "1998-04-03",
		title: "Lost in Space",
		video: false,
		vote_average: 5.4,
		vote_count: 1014
	},
	{
		adult: false,
		backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
		genre_ids: [
			28,
			878,
			12
		],
		id: 27205,
		media_type: "movie",
		original_language: "en",
		original_title: "Inception",
		overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
		popularity: 102.515,
		poster_path: "/8IB2e4r4oVhHnANbnm7O3Tj6tF8.jpg",
		release_date: "2010-07-15",
		title: "Inception",
		video: false,
		vote_average: 8.4,
		vote_count: 32138
	},
	{
		adult: false,
		backdrop_path: "/q2CtXYjp9IlnfBcPktNkBPsuAEO.jpg",
		genre_ids: [
			9648,
			53
		],
		id: 77,
		media_type: "movie",
		original_language: "en",
		original_title: "Memento",
		overview: "Leonard Shelby is tracking down the man who raped and murdered his wife. The difficulty of locating his wife's killer, however, is compounded by the fact that he suffers from a rare, untreatable form of short-term memory loss. Although he can recall details of life before his accident, Leonard cannot remember what happened fifteen minutes ago, where he's going, or why.",
		popularity: 28.37,
		poster_path: "/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg",
		release_date: "2000-10-11",
		title: "Memento",
		video: false,
		vote_average: 8.2,
		vote_count: 12526
	},
	{
		adult: false,
		backdrop_path: "/ulVUa2MvnJAjAeRt7h23FFJVRKH.jpg",
		genre_ids: [
			12,
			16,
			14
		],
		id: 81,
		media_type: "movie",
		original_language: "ja",
		original_title: "風の谷のナウシカ",
		overview: "After a global war, the seaside kingdom known as the Valley of the Wind remains one of the last strongholds on Earth untouched by a poisonous jungle and the powerful insects that guard it. Led by the courageous Princess Nausicaä, the people of the Valley engage in an epic struggle to restore the bond between humanity and Earth.",
		popularity: 43.354,
		poster_path: "/sIpcATxMrKHRRUJAGI5UIUT7XMG.jpg",
		release_date: "1984-03-11",
		title: "Nausicaä of the Valley of the Wind",
		video: false,
		vote_average: 7.9,
		vote_count: 2794
	},
	{
		adult: false,
		backdrop_path: "/pSsHFCwM5KMoRCc8X8wjpUDrlvr.jpg",
		genre_ids: [
			16,
			14,
			10749,
			18
		],
		id: 476292,
		media_type: "movie",
		original_language: "ja",
		original_title: "さよならの朝に約束の花をかざろう",
		overview: "Maquia is a member of a special race called the Iorph who can live for hundreds of years. However, Maquia has always felt lonely despite being surrounded by her people, as she was orphaned from a young age. She daydreams about the outside world, but dares not travel from her home due to the warnings of the clan's chief.  One day the kingdom of Mezarte invades her homeland. They already have what is left of the giant dragons, the Renato, under their control, and now their king wishes to add the immortality to his bloodline.  They ravage the Iorph homeland and kill most of its inhabitants. Caught in the midst of the attack, Maquia is carried off by one of the Renato. It soon dies, and she is left deserted in a forest, now truly alone save for the cries of a single baby off in the distance. Maquia finds the baby in a destroyed village and decides to raise him as her own, naming him Ariel. Although she knows nothing of the human world, how to raise a child that ages much faster than her.",
		popularity: 61.094,
		poster_path: "/hL3NqRE2ccR4Y2sYSJTrmalRjrz.jpg",
		release_date: "2018-02-24",
		title: "Maquia: When the Promised Flower Blooms",
		video: false,
		vote_average: 8.3,
		vote_count: 476
	},
	{
		adult: false,
		backdrop_path: "/agoBZfL1q5G79SD0npArSlJn8BH.jpg",
		genre_ids: [
			35,
			10752,
			18
		],
		id: 515001,
		media_type: "movie",
		original_language: "en",
		original_title: "Jojo Rabbit",
		overview: "A World War II satire that follows a lonely German boy whose world view is turned upside down when he discovers his single mother is hiding a young Jewish girl in their attic. Aided only by his idiotic imaginary friend, Adolf Hitler, Jojo must confront his blind nationalism.",
		popularity: 35.713,
		poster_path: "/7GsM4mtM0worCtIVeiQt28HieeN.jpg",
		release_date: "2019-10-18",
		title: "Jojo Rabbit",
		video: false,
		vote_average: 8.1,
		vote_count: 7686
	},
	{
		adult: false,
		backdrop_path: "/2Xe9lISpwXKhvKiHttbFfVRERQX.jpg",
		genre_ids: [
			18,
			35
		],
		id: 490132,
		media_type: "movie",
		original_language: "en",
		original_title: "Green Book",
		overview: "Tony Lip, a bouncer in 1962, is hired to drive pianist Don Shirley on a tour through the Deep South in the days when African Americans, forced to find alternate accommodations and services due to segregation laws below the Mason-Dixon Line, relied on a guide called The Negro Motorist Green Book.",
		popularity: 27.823,
		poster_path: "/7BsvSuDQuoqhWmU2fL7W2GOcZHU.jpg",
		release_date: "2018-11-16",
		title: "Green Book",
		video: false,
		vote_average: 8.2,
		vote_count: 9305
	},
	{
		adult: false,
		backdrop_path: "/i66aLpliUx5Dr4nfMrzYM1NpneN.jpg",
		genre_ids: [
			80,
			18
		],
		id: 157845,
		media_type: "movie",
		original_language: "en",
		original_title: "The Rover",
		overview: "10 years after a global economic collapse, a hardened loner pursues the men who stole his car through the lawless wasteland of the Australian outback, aided by the brother of one of the thieves.",
		popularity: 26.779,
		poster_path: "/734OOkr69mt8lyPk8iw3TwgQ90R.jpg",
		release_date: "2014-06-04",
		title: "The Rover",
		video: false,
		vote_average: 6.3,
		vote_count: 778
	},
	{
		adult: false,
		backdrop_path: "/hMwEsIEl5RNrfFrKzeyww8knrCN.jpg",
		genre_ids: [
			28,
			12,
			53
		],
		id: 10999,
		media_type: "movie",
		original_language: "en",
		original_title: "Commando",
		overview: "John Matrix, the former leader of a special commando strike force that always got the toughest jobs done, is forced back into action when his young daughter is kidnapped. To find her, Matrix has to fight his way through an array of punks, killers, one of his former commandos, and a fully equipped private army. With the help of a feisty stewardess and an old friend, Matrix has only a few hours to overcome his greatest challenge: finding his daughter before she's killed.",
		popularity: 25.848,
		poster_path: "/ollPAAAgZ7euU8VisfqU3cuXhZ6.jpg",
		release_date: "1985-10-03",
		title: "Commando",
		video: false,
		vote_average: 6.6,
		vote_count: 2214
	},
	{
		adult: false,
		backdrop_path: "/AeXX4mzpXIRrB0EHXNjbno2woWe.jpg",
		genre_ids: [
			28,
			12,
			53,
			10752
		],
		id: 1368,
		media_type: "movie",
		original_language: "en",
		original_title: "First Blood",
		overview: "When former Green Beret John Rambo is harassed by local law enforcement and arrested for vagrancy, the Vietnam vet snaps, runs for the hills and rat-a-tat-tats his way into the action-movie hall of fame. Hounded by a relentless sheriff, Rambo employs heavy-handed guerilla tactics to shake the cops off his tail.",
		popularity: 47.522,
		poster_path: "/a9sa6ERZCpplbPEO7OMWE763CLD.jpg",
		release_date: "1982-10-22",
		title: "First Blood",
		video: false,
		vote_average: 7.5,
		vote_count: 5061
	},
	{
		adult: false,
		backdrop_path: "/s6cQgJSkviamXAXBggT2xmj7JiG.jpg",
		genre_ids: [
			28,
			878,
			12
		],
		id: 1726,
		media_type: "movie",
		original_language: "en",
		original_title: "Iron Man",
		overview: "After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.",
		popularity: 116.516,
		poster_path: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
		release_date: "2008-04-30",
		title: "Iron Man",
		video: false,
		vote_average: 7.6,
		vote_count: 23177
	},
	{
		adult: false,
		backdrop_path: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
		genre_ids: [
			53,
			80
		],
		id: 680,
		media_type: "movie",
		original_language: "en",
		original_title: "Pulp Fiction",
		overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.",
		popularity: 63.649,
		poster_path: "/fIE3lAGcZDV1G6XM5KmuWnNsPp1.jpg",
		release_date: "1994-09-10",
		title: "Pulp Fiction",
		video: false,
		vote_average: 8.5,
		vote_count: 23657
	},
	{
		adult: false,
		backdrop_path: "/7gfDVfaw0VaIkUGiEH13o3TIC7A.jpg",
		genre_ids: [
			18,
			9648,
			37
		],
		id: 273248,
		media_type: "movie",
		original_language: "en",
		original_title: "The Hateful Eight",
		overview: "Bounty hunters seek shelter from a raging blizzard and get caught up in a plot of betrayal and deception.",
		popularity: 31.031,
		poster_path: "/jIywvdPjia2t3eKYbjVTcwBQlG8.jpg",
		release_date: "2015-12-25",
		title: "The Hateful Eight",
		video: false,
		vote_average: 7.7,
		vote_count: 12332
	},
	{
		adult: false,
		backdrop_path: "/43508X0evUDHMoyMSecsLxcy7RK.jpg",
		genre_ids: [
			18,
			28,
			53,
			10752
		],
		id: 16869,
		media_type: "movie",
		original_language: "en",
		original_title: "Inglourious Basterds",
		overview: "In Nazi-occupied France during World War II, a group of Jewish-American soldiers known as \"The Basterds\" are chosen specifically to spread fear throughout the Third Reich by scalping and brutally killing Nazis. The Basterds, lead by Lt. Aldo Raine soon cross paths with a French-Jewish teenage girl who runs a movie theater in Paris which is targeted by the soldiers.",
		popularity: 105.479,
		poster_path: "/7sfbEnaARXDDhKm0CZ7D7uc2sbo.jpg",
		release_date: "2009-08-19",
		title: "Inglourious Basterds",
		video: false,
		vote_average: 8.2,
		vote_count: 19096
	},
	{
		adult: false,
		backdrop_path: "/jU8MC5uSgBkZXyZYGtZgMsMsfeN.jpg",
		genre_ids: [
			80,
			9648,
			53
		],
		id: 320,
		media_type: "movie",
		original_language: "en",
		original_title: "Insomnia",
		overview: "Two Los Angeles homicide detectives are dispatched to a northern town where the sun doesn't set to investigate the methodical murder of a local teen.",
		popularity: 14.145,
		poster_path: "/cwB0t4OHX1Pw1Umzc9jPgzalUpS.jpg",
		release_date: "2002-05-24",
		title: "Insomnia",
		video: false,
		vote_average: 6.9,
		vote_count: 3839
	},
	{
		adult: false,
		backdrop_path: "/eNWjMbuhGxJdzaIY9ZZ2KvWx2sQ.jpg",
		genre_ids: [
			16,
			18,
			10751,
			14
		],
		id: 110420,
		media_type: "movie",
		original_language: "ja",
		original_title: "おおかみこどもの雨と雪",
		overview: "After her werewolf lover unexpectedly dies in an accident, a woman must find a way to raise the son and daughter that she had with him. However, their inheritance of their father's traits prove to be a challenge for her.",
		popularity: 38.346,
		poster_path: "/vHMvBkr42Gh3OORcnmfCFfqJ1E.jpg",
		release_date: "2012-07-21",
		title: "Wolf Children",
		video: false,
		vote_average: 8.3,
		vote_count: 1832
	},
	{
		adult: false,
		backdrop_path: "/7Ly4Smxxp5qBBxsoIZ4otEOG1kc.jpg",
		genre_ids: [
			16,
			18,
			10749
		],
		id: 38142,
		media_type: "movie",
		original_language: "ja",
		original_title: "秒速5センチメートル",
		overview: "Three moments in Takaki's life: his relationship with Akari and their forced separation; his friendship with Kanae, who is secretly in love with him; the demands and disappointments of adulthood, an unhappy life in a cold city.",
		popularity: 41.239,
		poster_path: "/t0ISGhwZtghakg46TWCOWBTIflZ.jpg",
		release_date: "2007-03-03",
		title: "5 Centimeters per Second",
		video: false,
		vote_average: 7.3,
		vote_count: 1549
	},
	{
		adult: false,
		backdrop_path: "/wXsQvli6tWqja51pYxXNG1LFIGV.jpg",
		genre_ids: [
			10751,
			16,
			18
		],
		id: 8587,
		media_type: "movie",
		original_language: "en",
		original_title: "The Lion King",
		overview: "A young lion prince is cast out of his pride by his cruel uncle, who claims he killed his father. While the uncle rules with an iron paw, the prince grows up beyond the Savannah, living by a philosophy: No worries for the rest of your days. But when his past comes to haunt him, the young prince must decide his fate: Will he remain an outcast or face his demons and become what he needs to be?",
		popularity: 192.528,
		poster_path: "/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg",
		release_date: "1994-06-23",
		title: "The Lion King",
		video: false,
		vote_average: 8.3,
		vote_count: 15640
	},
	{
		adult: false,
		backdrop_path: "/hO7KbdvGOtDdeg0W4Y5nKEHeDDh.jpg",
		genre_ids: [
			80,
			53,
			18
		],
		id: 475557,
		media_type: "movie",
		original_language: "en",
		original_title: "Joker",
		overview: "During the 1980s, a failed stand-up comedian is driven insane and turns to a life of crime and chaos in Gotham City while becoming an infamous psychopathic crime figure.",
		popularity: 134.778,
		poster_path: "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
		release_date: "2019-10-01",
		title: "Joker",
		video: false,
		vote_average: 8.2,
		vote_count: 21118
	},
	{
		adult: false,
		backdrop_path: "/9NunpQrxyqpIKIfovfvJcVrEEbt.jpg",
		genre_ids: [
			16,
			35,
			10751
		],
		id: 1267,
		media_type: "movie",
		original_language: "en",
		original_title: "Meet the Robinsons",
		overview: "Lewis, a brilliant young inventor, is keen on creating a time machine to find his mother, who abandoned him in an orphanage. Things take a turn when he meets Wilbur Robinson and his family.",
		popularity: 50.841,
		poster_path: "/swsjj0jZtsx53Yp9zBORPwsmGWj.jpg",
		release_date: "2007-03-23",
		title: "Meet the Robinsons",
		video: false,
		vote_average: 6.9,
		vote_count: 2318
	},
	{
		adult: false,
		backdrop_path: "/xKb6mtdfI5Qsggc44Hr9CCUDvaj.jpg",
		genre_ids: [
			28,
			53,
			878
		],
		id: 280,
		media_type: "movie",
		original_language: "en",
		original_title: "Terminator 2: Judgment Day",
		overview: "Nearly 10 years have passed since Sarah Connor was targeted for termination by a cyborg from the future. Now her son, John, the future leader of the resistance, is the target for a newer, more deadly terminator. Once again, the resistance has managed to send a protector back to attempt to save John and his mother Sarah.",
		popularity: 86.141,
		poster_path: "/5M0j0B18abtBI5gi2RhfjjurTqb.jpg",
		release_date: "1991-07-03",
		title: "Terminator 2: Judgment Day",
		video: false,
		vote_average: 8.1,
		vote_count: 10615
	},
	{
		adult: false,
		backdrop_path: "/xXWT0je8dTFFNBq6P2CeTZkPUu2.jpg",
		genre_ids: [
			12,
			28,
			53,
			9648
		],
		id: 2059,
		media_type: "movie",
		original_language: "en",
		original_title: "National Treasure",
		overview: "Modern treasure hunters, led by archaeologist Ben Gates, search for a chest of riches rumored to have been stashed away by George Washington, Thomas Jefferson and Benjamin Franklin during the Revolutionary War. The chest's whereabouts may lie in secret clues embedded in the Constitution and the Declaration of Independence, and Gates is in a race to find the gold before his enemies do.",
		popularity: 30.631,
		poster_path: "/20MSnfTICmwvAs2YJTqcSTjwBDc.jpg",
		release_date: "2004-11-19",
		title: "National Treasure",
		video: false,
		vote_average: 6.6,
		vote_count: 5355
	},
	{
		adult: false,
		backdrop_path: "/747dgDfL5d8esobk7h4odaOFhUq.jpg",
		genre_ids: [
			80,
			18,
			53
		],
		id: 275,
		media_type: "movie",
		original_language: "en",
		original_title: "Fargo",
		overview: "Jerry, a small-town Minnesota car salesman is bursting at the seams with debt... but he's got a plan. He's going to hire two thugs to kidnap his wife in a scheme to collect a hefty ransom from his wealthy father-in-law. It's going to be a snap and nobody's going to get hurt... until people start dying. Enter Police Chief Marge, a coffee-drinking, parka-wearing - and extremely pregnant - investigator who'll stop at nothing to get her man. And if you think her small-time investigative skills will give the crooks a run for their ransom... you betcha!",
		popularity: 22.309,
		poster_path: "/rt7cpEr1uP6RTZykBFhBTcRaKvG.jpg",
		release_date: "1996-03-08",
		title: "Fargo",
		video: false,
		vote_average: 7.9,
		vote_count: 6556
	},
	{
		adult: false,
		backdrop_path: "/lpTXHNKCozJgfUQZZJ1Xn3LKpIS.jpg",
		genre_ids: [
			35,
			80
		],
		id: 115,
		media_type: "movie",
		original_language: "en",
		original_title: "The Big Lebowski",
		overview: "Jeffrey 'The Dude' Lebowski, a Los Angeles slacker who only wants to bowl and drink White Russians, is mistaken for another Jeffrey Lebowski, a wheelchair-bound millionaire, and finds himself dragged into a strange series of events involving nihilists, adult film producers, ferrets, errant toes, and large sums of money.",
		popularity: 27.126,
		poster_path: "/5DpmtMBXXNDujIuSlKW3WLKuqEd.jpg",
		release_date: "1998-03-06",
		title: "The Big Lebowski",
		video: false,
		vote_average: 7.8,
		vote_count: 9523
	},
	{
		adult: false,
		backdrop_path: "/kd9jFTTabg4xJpHDgxY0h8F9BzG.jpg",
		genre_ids: [
			80,
			18,
			53
		],
		id: 6977,
		media_type: "movie",
		original_language: "en",
		original_title: "No Country for Old Men",
		overview: "Llewelyn Moss stumbles upon dead bodies, $2 million and a hoard of heroin in a Texas desert, but methodical killer Anton Chigurh comes looking for it, with local sheriff Ed Tom Bell hot on his trail. The roles of prey and predator blur as the violent pursuit of money and justice collide.",
		popularity: 34.44,
		poster_path: "/bj1v6YKF8yHqA489VFfnQvOJpnc.jpg",
		release_date: "2007-06-13",
		title: "No Country for Old Men",
		video: false,
		vote_average: 7.9,
		vote_count: 9941
	},
	{
		adult: false,
		backdrop_path: "/AdKA2F1SzYPhSZdEbjH1Zh75UVQ.jpg",
		genre_ids: [
			27,
			53
		],
		id: 694,
		media_type: "movie",
		original_language: "en",
		original_title: "The Shining",
		overview: "Jack Torrance accepts a caretaker job at the Overlook Hotel, where he, along with his wife Wendy and their son Danny, must live isolated from the rest of the world for the winter. But they aren't prepared for the madness that lurks within.",
		popularity: 50.774,
		poster_path: "/nRj5511mZdTl4saWEPoj9QroTIu.jpg",
		release_date: "1980-05-23",
		title: "The Shining",
		video: false,
		vote_average: 8.2,
		vote_count: 14761
	},
	{
		adult: false,
		backdrop_path: "/en971MEXui9diirXlogOrPKmsEn.jpg",
		genre_ids: [
			28,
			12,
			35
		],
		id: 293660,
		media_type: "movie",
		original_language: "en",
		original_title: "Deadpool",
		overview: "The origin story of former Special Forces operative turned mercenary Wade Wilson, who, after being subjected to a rogue experiment that leaves him with accelerated healing powers, adopts the alter ego Deadpool. Armed with his new abilities and a dark, twisted sense of humor, Deadpool hunts down the man who nearly destroyed his life.",
		popularity: 175.385,
		poster_path: "/zq8Cl3PNIDGU3iWNRoc5nEZ6pCe.jpg",
		release_date: "2016-02-09",
		title: "Deadpool",
		video: false,
		vote_average: 7.6,
		vote_count: 27192
	},
	{
		adult: false,
		backdrop_path: "/377E9KSoUGxKWuvyR1Zu9aXcU4I.jpg",
		genre_ids: [
			27
		],
		id: 764,
		media_type: "movie",
		original_language: "en",
		original_title: "The Evil Dead",
		overview: "When a group of college students finds a mysterious book and recording in the old wilderness cabin they've rented for the weekend, they unwittingly unleash a demonic force from the surrounding forest.",
		popularity: 37.429,
		poster_path: "/li05U702n3FzwX2mYtjDBVzeWio.jpg",
		release_date: "1981-09-10",
		title: "The Evil Dead",
		video: false,
		vote_average: 7.3,
		vote_count: 3040
	},
	{
		adult: false,
		backdrop_path: "/bTvc9hzculIuScIZwWz4faa4dOu.jpg",
		genre_ids: [
			27,
			53,
			18,
			9648
		],
		id: 8408,
		media_type: "movie",
		original_language: "en",
		original_title: "Day of the Dead",
		overview: "Trapped in a missile silo, a small team of scientists, civilians, and trigger-happy soldiers battle desperately to ensure the survival of the human race. However, the tension inside the base is reaching a breaking point, and the zombies are gathering outside.",
		popularity: 19.853,
		poster_path: "/jj0kxhH02baF3TMSW5pfWXvaZpQ.jpg",
		release_date: "1985-07-03",
		title: "Day of the Dead",
		video: false,
		vote_average: 7,
		vote_count: 950
	},
	{
		adult: false,
		backdrop_path: "/lVy5Zqcty2NfemqKYbVJfdg44rK.jpg",
		genre_ids: [
			28,
			80
		],
		id: 24,
		media_type: "movie",
		original_language: "en",
		original_title: "Kill Bill: Vol. 1",
		overview: "An assassin is shot by her ruthless employer, Bill, and other members of their assassination circle – but she lives to plot her vengeance.",
		popularity: 45.476,
		poster_path: "/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg",
		release_date: "2003-10-10",
		title: "Kill Bill: Vol. 1",
		video: false,
		vote_average: 8,
		vote_count: 14918
	},
	{
		adult: false,
		backdrop_path: "/yNr7tuh3Ka3XLaVniaDmt6wXUho.jpg",
		genre_ids: [
			35,
			10751,
			14
		],
		id: 10719,
		media_type: "movie",
		original_language: "en",
		original_title: "Elf",
		overview: "When young Buddy falls into Santa's gift sack on Christmas Eve, he's transported back to the North Pole and raised as a toy-making elf by Santa's helpers. But as he grows into adulthood, he can't shake the nagging feeling that he doesn't belong. Buddy vows to visit Manhattan and find his real dad, a workaholic publisher.",
		popularity: 15.353,
		poster_path: "/zDHFQmaxlTIJGQDfTrLTL9RK2tQ.jpg",
		release_date: "2003-10-09",
		title: "Elf",
		video: false,
		vote_average: 6.6,
		vote_count: 3275
	},
	{
		adult: false,
		backdrop_path: "/n53EPBWZiz69sYzNDZmamYHdo6Q.jpg",
		genre_ids: [
			35
		],
		id: 12133,
		media_type: "movie",
		original_language: "en",
		original_title: "Step Brothers",
		overview: "Brennan Huff and Dale Doback might be grown men. But that doesn't stop them from living at home and turning into jealous, competitive stepbrothers when their single parents marry. Brennan's constant competition with Dale strains his mom's marriage to Dale's dad, leaving everyone to wonder whether they'll ever see eye to eye.",
		popularity: 25,
		poster_path: "/jV0eDViuTRf9cmj4H0JNvbvaNbR.jpg",
		release_date: "2008-07-25",
		title: "Step Brothers",
		video: false,
		vote_average: 6.6,
		vote_count: 2591
	},
	{
		adult: false,
		backdrop_path: "/8gdplxQsNDGTYYTTHajsU0jUlFQ.jpg",
		genre_ids: [
			12,
			35,
			878
		],
		id: 1648,
		media_type: "movie",
		original_language: "en",
		original_title: "Bill & Ted's Excellent Adventure",
		overview: "Bill and Ted are high school buddies starting a band. They are also about to fail their history class—which means Ted would be sent to military school—but receive help from Rufus, a traveller from a future where their band is the foundation for a perfect society. With the use of Rufus' time machine, Bill and Ted travel to various points in history, returning with important figures to help them complete their final history presentation.",
		popularity: 17.707,
		poster_path: "/tV25lGWGWGEqUe3U0xjQTBgilSx.jpg",
		release_date: "1989-02-17",
		title: "Bill & Ted's Excellent Adventure",
		video: false,
		vote_average: 6.9,
		vote_count: 1460
	},
	{
		adult: false,
		backdrop_path: "/h5Y9T4OoFpMrONhVBZvN2X2DfAB.jpg",
		genre_ids: [
			80,
			35,
			12
		],
		id: 9273,
		media_type: "movie",
		original_language: "en",
		original_title: "Ace Ventura: When Nature Calls",
		overview: "Summoned from an ashram in Tibet, Ace finds himself on a perilous journey into the jungles of Africa to find Shikaka, the missing sacred animal of the friendly Wachati tribe. He must accomplish this before the wedding of the Wachati's Princess to the prince of the warrior Wachootoos. If Ace fails, the result will be a vicious tribal war.",
		popularity: 31.075,
		poster_path: "/wcinCf1ov2D6M3P7BBZkzQFOiIb.jpg",
		release_date: "1995-11-10",
		title: "Ace Ventura: When Nature Calls",
		video: false,
		vote_average: 6.3,
		vote_count: 3455
	},
	{
		adult: false,
		backdrop_path: "/aCHn2TXYJfzPXQKA6r9mKPbMlUB.jpg",
		genre_ids: [
			35,
			18
		],
		id: 37165,
		media_type: "movie",
		original_language: "en",
		original_title: "The Truman Show",
		overview: "Truman Burbank is the star of The Truman Show, a 24-hour-a-day reality TV show that broadcasts every aspect of his life without his knowledge. His entire life has been an unending soap opera for consumption by the rest of the world. And everyone he knows, including his wife and his best friend is really an actor, paid to be part of his life.",
		popularity: 74.055,
		poster_path: "/vuza0WqY239yBXOadKlGwJsZJFE.jpg",
		release_date: "1998-06-04",
		title: "The Truman Show",
		video: false,
		vote_average: 8.1,
		vote_count: 15126
	},
	{
		adult: false,
		backdrop_path: "/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg",
		genre_ids: [
			16,
			10751,
			14
		],
		id: 129,
		media_type: "movie",
		original_language: "ja",
		original_title: "千と千尋の神隠し",
		overview: "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
		popularity: 87.832,
		poster_path: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
		release_date: "2001-07-20",
		title: "Spirited Away",
		video: false,
		vote_average: 8.5,
		vote_count: 13247
	},
	{
		adult: false,
		backdrop_path: "/iuFbU5jiNh8DAxLBGifZCvv3KmB.jpg",
		genre_ids: [
			14,
			16,
			12
		],
		id: 4935,
		media_type: "movie",
		original_language: "ja",
		original_title: "ハウルの動く城",
		overview: "When Sophie, a shy young woman, is cursed with an old body by a spiteful witch, her only chance of breaking the spell lies with a self-indulgent yet insecure young wizard and his companions in his legged, walking castle.",
		popularity: 80.802,
		poster_path: "/1QRmDIYOMzdcTBaf0Pn09fCi83x.jpg",
		release_date: "2004-09-09",
		title: "Howl's Moving Castle",
		video: false,
		vote_average: 8.4,
		vote_count: 7559
	},
	{
		adult: false,
		backdrop_path: "/r4yFYBEcV247B9VXi1307fIhVqN.jpg",
		genre_ids: [
			28,
			35,
			80
		],
		id: 2109,
		media_type: "movie",
		original_language: "en",
		original_title: "Rush Hour",
		overview: "When Hong Kong Inspector Lee is summoned to Los Angeles to investigate a kidnapping, the FBI doesn't want any outside help and assigns cocky LAPD Detective James Carter to distract Lee from the case. Not content to watch the action from the sidelines, Lee and Carter form an unlikely partnership and investigate the case themselves.",
		popularity: 65.668,
		poster_path: "/we7wOLVFgxhzLzUt0qNe50xdIQZ.jpg",
		release_date: "1998-09-18",
		title: "Rush Hour",
		video: false,
		vote_average: 7,
		vote_count: 3820
	},
	{
		adult: false,
		backdrop_path: "/oxQJT3CCwxRRDgnPUZvT6xmts61.jpg",
		genre_ids: [
			28,
			35
		],
		id: 11230,
		media_type: "movie",
		original_language: "cn",
		original_title: "醉拳",
		overview: "A mischievous young man is sent to hone his martial arts skills with an older, alcoholic kung fu master.",
		popularity: 26.072,
		poster_path: "/cf43J2SH8tECZVl9N5n0Q6Ckche.jpg",
		release_date: "1978-10-05",
		title: "Drunken Master",
		video: false,
		vote_average: 7.3,
		vote_count: 722
	},
	{
		adult: false,
		backdrop_path: "/vian6RN3bC4QdBQzY1wTmBkhxVQ.jpg",
		genre_ids: [
			12,
			35
		],
		id: 9896,
		media_type: "movie",
		original_language: "en",
		original_title: "Rat Race",
		overview: "In an ensemble film about easy money, greed, manipulation and bad driving, a Las Vegas casino tycoon entertains his wealthiest high rollers -- a group that will bet on anything -- by pitting six ordinary people against each other in a wild dash for $2 million jammed into a locker hundreds of miles away. The tycoon and his wealthy friends monitor each racer's every move to keep track of their favorites. The only rule in this race is that there are no rules.",
		popularity: 20.888,
		poster_path: "/8ghNCfFbCJjcNSz2K5jOC3eO6ZD.jpg",
		release_date: "2001-08-17",
		title: "Rat Race",
		video: false,
		vote_average: 6.2,
		vote_count: 1465
	},
	{
		adult: false,
		backdrop_path: "/f3EfYaQCLIVKURufYN5DFk8hAKm.jpg",
		genre_ids: [
			12,
			35,
			14
		],
		id: 762,
		media_type: "movie",
		original_language: "en",
		original_title: "Monty Python and the Holy Grail",
		overview: "King Arthur, accompanied by his squire, recruits his Knights of the Round Table, including Sir Bedevere the Wise, Sir Lancelot the Brave, Sir Robin the Not-Quite-So-Brave-As-Sir-Lancelot and Sir Galahad the Pure. On the way, Arthur battles the Black Knight who, despite having had all his limbs chopped off, insists he can still fight. They reach Camelot, but Arthur decides not  to enter, as \"it is a silly place\".",
		popularity: 20.297,
		poster_path: "/8AVb7tyxZRsbKJNOTJHQZl7JYWO.jpg",
		release_date: "1975-05-25",
		title: "Monty Python and the Holy Grail",
		video: false,
		vote_average: 7.8,
		vote_count: 4780
	},
	{
		adult: false,
		backdrop_path: "/g1h8OE4ZPg5aLbwUm7DPeCOBuHC.jpg",
		genre_ids: [
			35,
			878
		],
		id: 957,
		media_type: "movie",
		original_language: "en",
		original_title: "Spaceballs",
		overview: "When the nefarious Dark Helmet hatches a plan to snatch Princess Vespa and steal her planet's air, space-bum-for-hire Lone Starr and his clueless sidekick fly to the rescue. Along the way, they meet Yogurt, who puts Lone Starr wise to the power of \"The Schwartz.\" Can he master it in time to save the day?",
		popularity: 18.838,
		poster_path: "/o624HTt93iIJIc1Sg5hNkDTnk5l.jpg",
		release_date: "1987-06-24",
		title: "Spaceballs",
		video: false,
		vote_average: 6.8,
		vote_count: 2414
	},
	{
		adult: false,
		backdrop_path: "/hG6mFOpPWflUkJa4QN9lP2IpGF7.jpg",
		genre_ids: [
			35,
			10751
		],
		id: 771,
		media_type: "movie",
		original_language: "en",
		original_title: "Home Alone",
		overview: "Eight-year-old Kevin McCallister makes the most of the situation after his family unwittingly leaves him behind when they go on Christmas vacation. But when a pair of bungling burglars set their sights on Kevin's house, the plucky kid stands ready to defend his territory. By planting booby traps galore, adorably mischievous Kevin stands his ground as his frantic mother attempts to race home before Christmas Day.",
		popularity: 2.837,
		poster_path: "/9wSbe4CwObACCQvaUVhWQyLR5Vz.jpg",
		release_date: "1990-11-16",
		title: "Home Alone",
		video: false,
		vote_average: 7.4,
		vote_count: 9175
	},
	{
		adult: false,
		backdrop_path: "/zmVq7y63z8NewluK7MUBfTxuyvD.jpg",
		genre_ids: [
			35
		],
		id: 9377,
		media_type: "movie",
		original_language: "en",
		original_title: "Ferris Bueller's Day Off",
		overview: "After high school slacker Ferris Bueller successfully fakes an illness in order to skip school for the day, he goes on a series of adventures throughout Chicago with his girlfriend Sloane and best friend Cameron, all the while trying to outwit his wily school principal and fed-up sister.",
		popularity: 20.883,
		poster_path: "/9LTQNCvoLsKXP0LtaKAaYVtRaQL.jpg",
		release_date: "1986-06-11",
		title: "Ferris Bueller's Day Off",
		video: false,
		vote_average: 7.6,
		vote_count: 4020
	},
	{
		adult: false,
		backdrop_path: "/bpV8wn48s82au37QyUJ51S7X2Vf.jpg",
		genre_ids: [
			18
		],
		id: 489,
		media_type: "movie",
		original_language: "en",
		original_title: "Good Will Hunting",
		overview: "Will Hunting has a genius-level IQ but chooses to work as a janitor at MIT. When he solves a difficult graduate-level math problem, his talents are discovered by Professor Gerald Lambeau, who decides to help the misguided youth reach his potential. When Will is arrested for attacking a police officer, Professor Lambeau makes a deal to get leniency for him if he will get treatment from therapist Sean Maguire.",
		popularity: 45.387,
		poster_path: "/bABCBKYBK7A5G1x0FzoeoNfuj2.jpg",
		release_date: "1997-12-05",
		title: "Good Will Hunting",
		video: false,
		vote_average: 8.1,
		vote_count: 9892
	},
	{
		adult: false,
		backdrop_path: "/cYOrsnmbZfPBmgchYghAmyn9B99.jpg",
		genre_ids: [
			35,
			80
		],
		id: 378,
		media_type: "movie",
		original_language: "en",
		original_title: "Raising Arizona",
		overview: "When a childless couple of an ex-con and an ex-cop decide to help themselves to one of another family's quintuplets, their lives become more complicated than they anticipated.",
		popularity: 13.48,
		poster_path: "/m5Zp4K4hKdPhsBl3E0p8I7QomlT.jpg",
		release_date: "1987-03-01",
		title: "Raising Arizona",
		video: false,
		vote_average: 7,
		vote_count: 1658
	},
	{
		adult: false,
		backdrop_path: "/9LuL3pwJiwIWSckeCbOX8G12F4X.jpg",
		genre_ids: [
			28,
			12,
			16,
			878
		],
		id: 324857,
		media_type: "movie",
		original_language: "en",
		original_title: "Spider-Man: Into the Spider-Verse",
		overview: "Miles Morales is juggling his life between being a high school student and being a spider-man. When Wilson \"Kingpin\" Fisk uses a super collider, others from across the Spider-Verse are transported to this dimension.",
		popularity: 103.315,
		poster_path: "/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
		release_date: "2018-12-06",
		title: "Spider-Man: Into the Spider-Verse",
		video: false,
		vote_average: 8.4,
		vote_count: 11661
	},
	{
		adult: false,
		backdrop_path: "/q5Y0IPNZvAhC5hpsLubH6jFTCxn.jpg",
		genre_ids: [
			18,
			53,
			878,
			9648
		],
		id: 2675,
		media_type: "movie",
		original_language: "en",
		original_title: "Signs",
		overview: "A family living on a farm finds mysterious crop circles in their fields which suggests something more frightening to come.",
		popularity: 32.091,
		poster_path: "/hyZkNEbNgnciUVTyu4NZTjlCh4L.jpg",
		release_date: "2002-08-02",
		title: "Signs",
		video: false,
		vote_average: 6.7,
		vote_count: 4668
	},
	{
		adult: false,
		backdrop_path: "/paUKxrbN2ww0JeT2JtvgAuaGlPf.jpg",
		genre_ids: [
			9648,
			53,
			18
		],
		id: 745,
		media_type: "movie",
		original_language: "en",
		original_title: "The Sixth Sense",
		overview: "Following an unexpected tragedy, a child psychologist named Malcolm Crowe meets an nine year old boy named Cole Sear, who is hiding a dark secret.",
		popularity: 37.091,
		poster_path: "/4AfSDjjCy6T5LA1TMz0Lh2HlpRh.jpg",
		release_date: "1999-08-06",
		title: "The Sixth Sense",
		video: false,
		vote_average: 7.9,
		vote_count: 9784
	},
	{
		adult: false,
		backdrop_path: "/rl6TA8Hhvc3f5LR59WiCBo9QxSa.jpg",
		genre_ids: [
			28,
			35,
			10749
		],
		id: 22538,
		media_type: "movie",
		original_language: "en",
		original_title: "Scott Pilgrim vs. the World",
		overview: "As bass guitarist for a garage-rock band, Scott Pilgrim has never had trouble getting a girlfriend; usually, the problem is getting rid of them. But when Ramona Flowers skates into his heart, he finds she has the most troublesome baggage of all: an army of ex-boyfriends who will stop at nothing to eliminate him from her list of suitors.",
		popularity: 37.915,
		poster_path: "/g5IoYeudx9XBEfwNL0fHvSckLBz.jpg",
		release_date: "2010-08-12",
		title: "Scott Pilgrim vs. the World",
		video: false,
		vote_average: 7.5,
		vote_count: 6499
	},
	{
		adult: false,
		backdrop_path: "/h8C7KZwCJO5DN7jPifc7AoIjx7k.jpg",
		genre_ids: [
			16,
			35,
			10751,
			12
		],
		id: 14160,
		media_type: "movie",
		original_language: "en",
		original_title: "Up",
		overview: "Carl Fredricksen spent his entire life dreaming of exploring the globe and experiencing life to its fullest. But at age 78, life seems to have passed him by, until a twist of fate (and a persistent 8-year old Wilderness Explorer named Russell) gives him a new lease on life.",
		popularity: 107.707,
		poster_path: "/vpbaStTMt8qqXaEgnOR2EE4DNJk.jpg",
		release_date: "2009-05-28",
		title: "Up",
		video: false,
		vote_average: 7.9,
		vote_count: 17502
	},
	{
		adult: false,
		backdrop_path: "/se5Hxz7PArQZOG3Nx2bpfOhLhtV.jpg",
		genre_ids: [
			28,
			12,
			16,
			10751
		],
		id: 9806,
		media_type: "movie",
		original_language: "en",
		original_title: "The Incredibles",
		overview: "Bob Parr has given up his superhero days to log in time as an insurance adjuster and raise his three children with his formerly heroic wife in suburbia. But when he receives a mysterious assignment, it's time to get back into costume.",
		popularity: 91.623,
		poster_path: "/2LqaLgk4Z226KkgPJuiOQ58wvrm.jpg",
		release_date: "2004-10-27",
		title: "The Incredibles",
		video: false,
		vote_average: 7.7,
		vote_count: 15476
	},
	{
		adult: false,
		backdrop_path: "/1ZIeGwD2lMlLMr4u6IIR302jqhD.jpg",
		genre_ids: [
			80,
			35,
			28,
			12
		],
		id: 207703,
		media_type: "movie",
		original_language: "en",
		original_title: "Kingsman: The Secret Service",
		overview: "The story of a super-secret spy organization that recruits an unrefined but promising street kid into the agency's ultra-competitive training program just as a global threat emerges from a twisted tech genius.",
		popularity: 147.669,
		poster_path: "/ay7xwXn1G9fzX9TUBlkGA584rGi.jpg",
		release_date: "2015-01-24",
		title: "Kingsman: The Secret Service",
		video: false,
		vote_average: 7.6,
		vote_count: 14623
	},
	{
		adult: false,
		backdrop_path: "/i4Fp0AJsqAzbeVQyCoG0adRRfdh.jpg",
		genre_ids: [
			28,
			53
		],
		id: 11474,
		media_type: "movie",
		original_language: "en",
		original_title: "The Warriors",
		overview: "Prominent gang leader Cyrus calls a meeting of New York's gangs to set aside their turf wars and take over the city. At the meeting, a rival leader kills Cyrus, but a Coney Island gang called the Warriors is wrongly blamed for Cyrus' death. Before you know it, the cops and every gangbanger in town is hot on the Warriors' trail.",
		popularity: 31.161,
		poster_path: "/fCDXAJcPvpsMd5CL1kBKkkNGW3X.jpg",
		release_date: "1979-02-09",
		title: "The Warriors",
		video: false,
		vote_average: 7.7,
		vote_count: 1680
	},
	{
		adult: false,
		backdrop_path: "/t3LicFpYHeYpwqm7L5wDpd22hL5.jpg",
		genre_ids: [
			12,
			14
		],
		id: 671,
		media_type: "movie",
		original_language: "en",
		original_title: "Harry Potter and the Philosopher's Stone",
		overview: "Harry Potter has lived under the stairs at his aunt and uncle's house his whole life. But on his 11th birthday, he learns he's a powerful wizard—with a place waiting for him at the Hogwarts School of Witchcraft and Wizardry. As he learns to harness his newfound powers with the help of the school's kindly headmaster, Harry uncovers the truth about his parents' deaths—and about the villain who's to blame.",
		popularity: 243.123,
		poster_path: "/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg",
		release_date: "2001-11-16",
		title: "Harry Potter and the Philosopher's Stone",
		video: false,
		vote_average: 7.9,
		vote_count: 23113
	},
	{
		adult: false,
		backdrop_path: "/2J283YNxKhxAqHeVegUJ5mzLfGb.jpg",
		genre_ids: [
			9648,
			80,
			18
		],
		id: 392044,
		media_type: "movie",
		original_language: "en",
		original_title: "Murder on the Orient Express",
		overview: "Genius Belgian detective Hercule Poirot investigates the murder of an American tycoon aboard the Orient Express train.",
		popularity: 28.326,
		poster_path: "/kc2gJjebceoFgOQbukzPzP8SXVZ.jpg",
		release_date: "2017-11-03",
		title: "Murder on the Orient Express",
		video: false,
		vote_average: 6.7,
		vote_count: 8562
	},
	{
		adult: false,
		backdrop_path: "/uslmOwQpdRRUwr6AmBP6JdzeHjS.jpg",
		genre_ids: [
			18,
			53,
			80
		],
		id: 64690,
		media_type: "movie",
		original_language: "en",
		original_title: "Drive",
		overview: "Driver is a skilled Hollywood stuntman who moonlights as a getaway driver for criminals. Though he projects an icy exterior, lately he's been warming up to a pretty neighbor named Irene and her young son, Benicio. When Irene's husband gets out of jail, he enlists Driver's help in a million-dollar heist. The job goes horribly wrong, and Driver must risk his life to protect Irene and Benicio from the vengeful masterminds behind the robbery.",
		popularity: 51.462,
		poster_path: "/602vevIURmpDfzbnv5Ubi6wIkQm.jpg",
		release_date: "2011-09-15",
		title: "Drive",
		video: false,
		vote_average: 7.6,
		vote_count: 10633
	},
	{
		adult: false,
		backdrop_path: "/rsclb1vtH6IkxmVBuCC37biEBT.jpg",
		genre_ids: [
			35,
			53,
			80,
			9648
		],
		id: 15196,
		media_type: "movie",
		original_language: "en",
		original_title: "Clue",
		overview: "Clue finds six colorful dinner guests gathered at the mansion of their host, Mr. Boddy -- who turns up dead after his secret is exposed: He was blackmailing all of them. With the killer among them, the guests and Boddy's chatty butler must suss out the culprit before the body count rises.",
		popularity: 21.218,
		poster_path: "/brhtU86OVCsHRhd35AAztFLP4cZ.jpg",
		release_date: "1985-12-13",
		title: "Clue",
		video: false,
		vote_average: 7.2,
		vote_count: 1353
	},
	{
		adult: false,
		backdrop_path: "/p8HJznvwvFCkXJb2eKiJCfCIIM5.jpg",
		genre_ids: [
			35,
			878
		],
		id: 11591,
		media_type: "movie",
		original_language: "en",
		original_title: "The Man with Two Brains",
		overview: "A brain surgeon tries to end his unhappy marriage to spend more time with a disembodied brain.",
		popularity: 10.392,
		poster_path: "/jSnGiPE17sgicRyTPrE6UB0pnEU.jpg",
		release_date: "1983-06-10",
		title: "The Man with Two Brains",
		video: false,
		vote_average: 6.2,
		vote_count: 321
	},
	{
		adult: false,
		backdrop_path: "/yMlk79kLF4GrqqP1OY0KccYB787.jpg",
		genre_ids: [
			35,
			37,
			12
		],
		id: 8388,
		media_type: "movie",
		original_language: "en",
		original_title: "¡Three Amigos!",
		overview: "Three unemployed actors accept an invitation to a Mexican village to replay their bandit fighter roles, unaware that it is the real thing.",
		popularity: 15.616,
		poster_path: "/nHQS54SD54c09jhlQwyr8fHYgd2.jpg",
		release_date: "1986-12-12",
		title: "¡Three Amigos!",
		video: false,
		vote_average: 6.4,
		vote_count: 762
	},
	{
		adult: false,
		backdrop_path: "/u0Vyi8ntIs0jTqtMiScaAtK1fDQ.jpg",
		genre_ids: [
			35,
			12
		],
		id: 11153,
		media_type: "movie",
		original_language: "en",
		original_title: "National Lampoon's Vacation",
		overview: "Clark Griswold is on a quest to take his family on a quest to Walley World theme park for a vacation, but things don't go exactly as planned.",
		popularity: 25.645,
		poster_path: "/q3DvoqY06yZnRp9faH6uge7n7VP.jpg",
		release_date: "1983-07-28",
		title: "National Lampoon's Vacation",
		video: false,
		vote_average: 7.1,
		vote_count: 1202
	},
	{
		adult: false,
		backdrop_path: "/bZ4diYf7oyDVaRYeWG42Oify2mB.jpg",
		genre_ids: [
			35
		],
		id: 11381,
		media_type: "movie",
		original_language: "en",
		original_title: "Tommy Boy",
		overview: "To save the family business, two ne’er-do-well traveling salesmen hit the road with disastrously funny consequences.",
		popularity: 12.989,
		poster_path: "/cUvdzCbhLyYUAwbIkBjT3tC28cK.jpg",
		release_date: "1995-03-31",
		title: "Tommy Boy",
		video: false,
		vote_average: 6.8,
		vote_count: 771
	},
	{
		adult: false,
		backdrop_path: "/cxaapBWXYqyKsLOdV4pzW3McPWv.jpg",
		genre_ids: [
			35,
			10402
		],
		id: 8872,
		media_type: "movie",
		original_language: "en",
		original_title: "Wayne's World",
		overview: "The adventures of two amiably aimless metal-head friends, Wayne and Garth. From Wayne's basement, the pair broadcast a talk-show called \"Wayne's World\" on local public access television. The show comes to the attention of a sleazy network executive who wants to produce a big-budget version of \"Wayne's World\"—and he also wants Wayne's girlfriend, a rock singer named Cassandra. Wayne and Garth have to battle the executive not only to save their show, but also Cassandra.",
		popularity: 21.236,
		poster_path: "/rsgklbt5KxeuUuchehnLACxzisP.jpg",
		release_date: "1992-02-14",
		title: "Wayne's World",
		video: false,
		vote_average: 6.7,
		vote_count: 1825
	},
	{
		adult: false,
		backdrop_path: "/giaqkJawiez0jnXMdm9OwSmJhPd.jpg",
		genre_ids: [
			12,
			35,
			878,
			10751
		],
		id: 18162,
		media_type: "movie",
		original_language: "en",
		original_title: "Land of the Lost",
		overview: "On his latest expedition, Dr. Rick Marshall is sucked into a space-time vortex alongside his research assistant and a redneck survivalist. In this alternate universe, the trio make friends with a primate named Chaka, their only ally in a world full of dinosaurs and other fantastic creatures.",
		popularity: 26.587,
		poster_path: "/xVlTgP2iZe9GFuAf6pXAP9WZ5nX.jpg",
		release_date: "2009-06-05",
		title: "Land of the Lost",
		video: false,
		vote_average: 5.5,
		vote_count: 1086
	},
	{
		adult: false,
		backdrop_path: "/R0p2aJVD7NTrCJFbDlTPKoVCCz.jpg",
		genre_ids: [
			35,
			28
		],
		id: 10074,
		media_type: "movie",
		original_language: "en",
		original_title: "Hot Rod",
		overview: "For Rod Kimball, performing stunts is a way of life, even though he is rather accident-prone. Poor Rod cannot even get any respect from his stepfather, Frank, who beats him up in weekly sparring matches. When Frank falls ill, Rod devises his most outrageous stunt yet to raise money for Frank's operation -- and then Rod will kick Frank's butt.",
		popularity: 17.331,
		poster_path: "/jRkt03dXCVKnbvcQm3ygU1cjg9Y.jpg",
		release_date: "2007-08-03",
		title: "Hot Rod",
		video: false,
		vote_average: 6.4,
		vote_count: 782
	},
	{
		adult: false,
		backdrop_path: "/lmZFxXgJE3vgrciwuDib0N8CfQo.jpg",
		genre_ids: [
			12,
			28,
			878
		],
		id: 299536,
		media_type: "movie",
		original_language: "en",
		original_title: "Avengers: Infinity War",
		overview: "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. A despot of intergalactic infamy, his goal is to collect all six Infinity Stones, artifacts of unimaginable power, and use them to inflict his twisted will on all of reality. Everything the Avengers have fought for has led up to this moment - the fate of Earth and existence itself has never been more uncertain.",
		popularity: 334.642,
		poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
		release_date: "2018-04-25",
		title: "Avengers: Infinity War",
		video: false,
		vote_average: 8.3,
		vote_count: 25248
	},
	{
		adult: false,
		backdrop_path: "/sAtoMqDVhNDQBc3QJL3RF6hlhGq.jpg",
		genre_ids: [
			878,
			18
		],
		id: 335984,
		media_type: "movie",
		original_language: "en",
		original_title: "Blade Runner 2049",
		overview: "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos. K's discovery leads him on a quest to find Rick Deckard, a former LAPD blade runner who has been missing for 30 years.",
		popularity: 67.402,
		poster_path: "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
		release_date: "2017-10-04",
		title: "Blade Runner 2049",
		video: false,
		vote_average: 7.5,
		vote_count: 11015
	},
	{
		adult: false,
		backdrop_path: "/2mUpYunvmXQni74Lydj2kKP2M10.jpg",
		genre_ids: [
			28,
			12
		],
		id: 177677,
		media_type: "movie",
		original_language: "en",
		original_title: "Mission: Impossible - Rogue Nation",
		overview: "Ethan and team take on their most impossible mission yet—eradicating 'The Syndicate', an International and highly-skilled rogue organisation committed to destroying the IMF.",
		popularity: 53.089,
		poster_path: "/jwqL7croP7JMVfz0l9o7V4yJsJO.jpg",
		release_date: "2015-07-23",
		title: "Mission: Impossible - Rogue Nation",
		video: false,
		vote_average: 7.2,
		vote_count: 7453
	},
	{
		adult: false,
		backdrop_path: "/mpMC8HEUjnU0mMVlFsWTlFJeiq5.jpg",
		genre_ids: [
			27,
			9648
		],
		id: 11587,
		media_type: "movie",
		original_language: "en",
		original_title: "The Exorcist III",
		overview: "Fifteen years after the original film, the philosophical Lieutenant William F. Kinderman is investigating a baffling series of murders around Georgetown that all contain the hallmarks of The Gemini, a deceased serial killer. His investigation eventually leads him to a catatonic patient in a psychiatric hospital who has recently started to speak, claiming he is The Gemini and detailing the murders, but bears a striking resemblance to Father Damien Karras.",
		popularity: 38.467,
		poster_path: "/bl6nSPcyqz6xD2Igd2VQvz8qWo0.jpg",
		release_date: "1990-08-17",
		title: "The Exorcist III",
		video: false,
		vote_average: 6.2,
		vote_count: 528
	},
	{
		adult: false,
		backdrop_path: "/U8QRD7jvTXEYsUXq74IFKaSiL5.jpg",
		genre_ids: [
			18,
			53,
			9648
		],
		id: 11324,
		media_type: "movie",
		original_language: "en",
		original_title: "Shutter Island",
		overview: "World War II soldier-turned-U.S. Marshal Teddy Daniels investigates the disappearance of a patient from a hospital for the criminally insane, but his efforts are compromised by troubling visions and a mysterious doctor.",
		popularity: 76.593,
		poster_path: "/kve20tXwUZpu4GUX8l6X7Z4jmL6.jpg",
		release_date: "2010-02-14",
		title: "Shutter Island",
		video: false,
		vote_average: 8.2,
		vote_count: 20341
	},
	{
		adult: false,
		backdrop_path: "/9RuC3UD6mNZ0p1J6RbfJDUkQ03i.jpg",
		genre_ids: [
			18,
			53,
			80
		],
		id: 1422,
		media_type: "movie",
		original_language: "en",
		original_title: "The Departed",
		overview: "To take down South Boston's Irish Mafia, the police send in one of their own to infiltrate the underworld, not realizing the syndicate has done likewise. While an undercover cop curries favor with the mob kingpin, a career criminal rises through the police ranks. But both sides soon discover there's a mole among them.",
		popularity: 42.832,
		poster_path: "/jyAgiqVSx5fl0NNj7WoGGKweXrL.jpg",
		release_date: "2006-10-04",
		title: "The Departed",
		video: false,
		vote_average: 8.2,
		vote_count: 12653
	},
	{
		adult: false,
		backdrop_path: "/jqFjgNnxpXIXWuPsyfqmcLXRo9p.jpg",
		genre_ids: [
			80,
			53
		],
		id: 500,
		media_type: "movie",
		original_language: "en",
		original_title: "Reservoir Dogs",
		overview: "A botched robbery indicates a police informant, and the pressure mounts in the aftermath at a warehouse. Crime begets violence as the survivors -- veteran Mr. White, newcomer Mr. Orange, psychopathic parolee Mr. Blonde, bickering weasel Mr. Pink and Nice Guy Eddie -- unravel.",
		popularity: 34.096,
		poster_path: "/lsBnfheKZBO3UKU7lVHIeGZLWuF.jpg",
		release_date: "1992-09-02",
		title: "Reservoir Dogs",
		video: false,
		vote_average: 8.1,
		vote_count: 12147
	},
	{
		adult: false,
		backdrop_path: "/1YRtgjLb5xxUb2rsNRnr54Oc0B2.jpg",
		genre_ids: [
			16,
			53
		],
		id: 10494,
		media_type: "movie",
		original_language: "ja",
		original_title: "パーフェクトブルー",
		overview: "A retired pop singer turned actress' sense of reality is shaken when she is stalked by an obsessed fan and seemingly a ghost of her past.",
		popularity: 28.354,
		poster_path: "/79vujbsWEbX4dzffBV541QXN6sf.jpg",
		release_date: "1997-07-25",
		title: "Perfect Blue",
		video: false,
		vote_average: 8.3,
		vote_count: 1770
	},
	{
		adult: false,
		backdrop_path: "/jFp5aAlGQ1H3gwdORL2urr8dnoN.jpg",
		genre_ids: [
			36,
			18,
			53,
			10752
		],
		id: 205596,
		media_type: "movie",
		original_language: "en",
		original_title: "The Imitation Game",
		overview: "Based on the real life story of legendary cryptanalyst Alan Turing, the film portrays the nail-biting race against time by Turing and his brilliant team of code-breakers at Britain's top-secret Government Code and Cypher School at Bletchley Park, during the darkest days of World War II.",
		popularity: 43.118,
		poster_path: "/zSqJ1qFq8NXFfi7JeIYMlzyR0dx.jpg",
		release_date: "2014-11-14",
		title: "The Imitation Game",
		video: false,
		vote_average: 8,
		vote_count: 14893
	}
];
const item_count = 100;
const iso_639_1 = "en";
const name = "Test List";
const poster_path = null;
const listData = {
	created_by: created_by,
	description: description,
	favorite_count: favorite_count,
	id: id,
	items: items,
	item_count: item_count,
	iso_639_1: iso_639_1,
	name: name,
	poster_path: poster_path
};

const $$module3$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	created_by,
	description,
	favorite_count,
	id,
	items,
	item_count,
	iso_639_1,
	name,
	poster_path,
	default: listData
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$3 = createMetadata("/@fs/C:/Users/branb/Code/my-films-list/src/pages/index.astro", { modules: [{ module: $$module1, specifier: "../layouts/Layout.astro", assert: {} }, { module: $$module2$1, specifier: "../components/FilmCard.astro", assert: {} }, { module: $$module3$1, specifier: "../lib/list_data.json", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$3 = createAstro("/@fs/C:/Users/branb/Code/my-films-list/src/pages/index.astro", "", "file:///C:/Users/branb/Code/my-films-list/");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Index;
  const films = listData.items.map((film) => ({
    id: film.id,
    title: film.title,
    backdropURL: film.backdrop_path ? `https://image.tmdb.org/t/p/w500${film.backdrop_path}` : "https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-4ee37443c461fff5bc221b43ae018a5dae317469c8e2479a87d562537dd45fdc.svg"
  }));
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "My Films List - Home" }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<main class="container max-w-7xl mx-auto px-4">
		<h1 class="text-4xl mb-5">Welcome to my films list</h1>
		<div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-5">
			${films.map((film) => renderTemplate`${renderComponent($$result, "FilmCard", $$FilmCard, { "film": film, "key": film.id })}`)}
		</div>
	</main>` })}`;
});

const $$file$3 = "C:/Users/branb/Code/my-films-list/src/pages/index.astro";
const $$url$3 = "";

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$3,
	default: $$Index,
	file: $$file$3,
	url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$2 = createMetadata("/@fs/C:/Users/branb/Code/my-films-list/src/components/CastCard.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$2 = createAstro("/@fs/C:/Users/branb/Code/my-films-list/src/components/CastCard.astro", "", "file:///C:/Users/branb/Code/my-films-list/");
const $$CastCard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$CastCard;
  const { name, character, headshot } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<figure class="select-none w-48 bg-gray-50 rounded overflow-hidden text-blue-900 mr-4 last:mr-0">
    <picture>
        <img width="600" height="900"${addAttribute(`${name}'s headshot`, "alt")} class="bg-gray-600 w-full h-56 object-cover object-center"${addAttribute(headshot, "src")}>
    </picture>
    <figcaption class="p-4">
        <h2 class="font-medium">${name}</h2>
        <span class="text-sm">${character}</span>
    </figcaption>
</figure>`;
});

const $$file$2 = "C:/Users/branb/Code/my-films-list/src/components/CastCard.astro";
const $$url$2 = undefined;

const $$module2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$2,
	default: $$CastCard,
	file: $$file$2,
	url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s;}
    return s;
};

Number.prototype.timeConvert = function() {
    var time = this;

    if(time === 0) return 'Invalid time'
    let arr = [];
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    
    if(hours !== 0) arr.push(hours + 'h');
    if(minutes !== 0) arr.push(minutes + 'm');
    
    return arr.join(' ');
};


const fetchFilmById = async (id) => {
    const { TMDB_KEY } = (Object.assign({"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true},{TMDB_KEY:"e5aafdd8f18d5b1267389d38b538606e",}));
    try {
        const apis = [
            `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=en-US`,
            `https://api.themoviedb.org/3/movie/${id}/release_dates?api_key=${TMDB_KEY}`,
            `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_KEY}`,
            `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${TMDB_KEY}&language=en-US&page=1`
        ];

        const data = await Promise.all(apis.map(url => (
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.success === false) {
                        throw new Error('Fetch call unsuccessful');
                    }
                    
                    return data;
                })
        )));

        const [filmDetails, filmRelease, filmCredits, filmRecommendations] = data;

        const {iso_3166_1: country, release_dates } = filmRelease.results.find(obj => obj.iso_3166_1 === 'US') || filmRelease.results[0];
        const date = filmDetails.release_date && new Date(release_dates[0].release_date);
        const { date: filmDateReleased, year: filmYearReleased} = date && {
            date: `${(date.getUTCMonth() + 1).pad()}/${date.getUTCDate().pad()}/${date.getUTCFullYear()}`,
            year: date.getFullYear(),
            month: (date.getMonth() + 1).pad(),
            day: date.getDate().pad()
        };

        const rating = release_dates.find(obj => obj.certification !== "")?.certification || 'NR';

        const crew = {};

        filmCredits.crew.filter(person => person.job === 'Director' || person.job === 'Screenplay' || person.job === 'Story' || person.job === 'Writer' || person.job === 'Characters' || person.job === 'Novel').forEach(({id, job, name}) => {
            if(!crew.hasOwnProperty(name)) { 
                crew[name] = {};
                crew[name].jobs = [];
                crew[name].id = id;
                crew[name].name = name;
            }

            crew[name].jobs.push(job);
        });

        const directors = Object.keys(crew).filter(name => crew[name].jobs.find(job => job === 'Director'));

        const cast = filmCredits.cast.map(({id, name, character, profile_path}) => ({id, name, character, image: profile_path ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${profile_path}` : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-4-user-grey-d8fe957375e70239d6abdd549fd7568c89281b2179b5f4470e2e12895792dfa5.svg'}));

        const recommendations = filmRecommendations.results.splice(0, 15).map(({id, title, backdrop_path: path}) => ({id, title, backdrop: path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-4ee37443c461fff5bc221b43ae018a5dae317469c8e2479a87d562537dd45fdc.svg'}));

        return {
            backdrop: filmDetails.backdrop_path ? `https://www.themoviedb.org/t/p/w1920_and_h800_multi_faces/${filmDetails.backdrop_path}` : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-4ee37443c461fff5bc221b43ae018a5dae317469c8e2479a87d562537dd45fdc.svg',
            cast,
            country,
            crew,
            date: filmDateReleased,
            directors,
            genres: filmDetails.genres.map(obj => obj.name),
            overview: filmDetails.overview,
            poster: filmDetails.poster_path ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${filmDetails.poster_path}` : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-4ee37443c461fff5bc221b43ae018a5dae317469c8e2479a87d562537dd45fdc.svg',
            rating,
            recommendations,
            runtime: filmDetails.runtime ? filmDetails.runtime.timeConvert() : '',
            status: filmDetails.status,
            tagline: filmDetails.tagline,
            title: filmDetails.title,
            year: filmYearReleased,
        }

    } catch (error) {
        console.error(error);
        return null
    }
};

const $$module3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	fetchFilmById
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$1 = createMetadata("/@fs/C:/Users/branb/Code/my-films-list/src/pages/film/[id].astro", { modules: [{ module: $$module1, specifier: "../../layouts/Layout.astro", assert: {} }, { module: $$module2, specifier: "../../components/CastCard.astro", assert: {} }, { module: $$module3, specifier: "../../utils", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$1 = createAstro("/@fs/C:/Users/branb/Code/my-films-list/src/pages/film/[id].astro", "", "file:///C:/Users/branb/Code/my-films-list/");
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$id;
  const film = await fetchFilmById(Astro2.params.id);
  if (!film) {
    return Astro2.redirect("/404");
  }
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `My Films List - ${film.title}`, "class": "astro-CQ2ID4TG" }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<main class="-mt-5 astro-CQ2ID4TG">
        <section id="film-top" class="bg-blue-900 w-full overflow-hidden relative mb-5 astro-CQ2ID4TG">
            <img width="1920" height="800" class="absolute bg-blue-500 top-0 left-0 w-full h-64 md:h-full opacity-60 md:opacity-10 object-cover object-center z-0 astro-CQ2ID4TG"${addAttribute(film.backdrop, "src")}>
            <div class="container flex flex-col md:flex-row md:items-center max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-[1] astro-CQ2ID4TG">
                <div class="w-32 md:w-2/5 lg:w-2/6 xl:w-1/4 rounded overflow-hidden mb-10 md:mb-0 md:mr-10 xl:mr-16 astro-CQ2ID4TG">
                    <img width="600" height="900" class="w-full bg-blue-300 astro-CQ2ID4TG"${addAttribute(film.poster, "src")}>
                </div>
                <div class="py-4 md:py-0 md:w-3/5 lg:w-4/6 xl:w-3/4 astro-CQ2ID4TG">
                    <h2 class="text-3xl lg:text-4xl mb-3 overflow-hidden astro-CQ2ID4TG">
                        <span class="font-bold astro-CQ2ID4TG">${film.title}</span>
                        ${" "}(${film.year})
                    </h2>
                    <ul class="mb-5 text-sm lg:text-base leading-6 astro-CQ2ID4TG">
                        <li class="inline-block text-sm opacity-80 mr-1 border px-[4px] pt-[0.55px] pb-[2px] astro-CQ2ID4TG">${film.rating}</li>
                        <li class="inline-block before:content-['•'] before:mr-2 mr-1 astro-CQ2ID4TG">${film.date} (${film.country})</li>
                        <li class="mt-2 md:mt-0 block md:inline align-top md:before:content-['•'] md:before:mr-2 mr-1 astro-CQ2ID4TG">${film.genres.join(", ")}</li>
                        <li class="inline-block md:before:content-['•'] md:before:mr-2 astro-CQ2ID4TG">${film.runtime}</li>
                    </ul>
                    <h4 class="mb-5 font-medium italic opacity-70 astro-CQ2ID4TG">${film.tagline}</h4>
                    <div class="mb-6 astro-CQ2ID4TG">
                        <h5 class="font-medium mb-1 text-lg astro-CQ2ID4TG">Overview</h5>
                        <p class="text-sm astro-CQ2ID4TG">${film.overview}</p>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-5 md:gap-5 astro-CQ2ID4TG">
                        ${Object.values(film.crew).map((worker) => renderTemplate`<div class="astro-CQ2ID4TG">
                                <h4 class="font-medium astro-CQ2ID4TG">${worker.name}</h4>
                                <span class="inline-block text-sm leading-0 astro-CQ2ID4TG">${worker.jobs.join(", ")}</span>
                            </div>`)}
                    </div>
                </div>
            </div>
        </section>
        <section id="cast" class="mb-6 container max-w-7xl mx-auto lg:px-4 astro-CQ2ID4TG">
            <h3 class="mb-5 text-4xl font-semibold px-4 lg:px-0 astro-CQ2ID4TG">Cast</h3>
            <div class="overflow-auto astro-CQ2ID4TG">
                <div class="flex w-max pb-5 px-4 lg:px-0 astro-CQ2ID4TG">
                    ${film.cast.map((actor) => renderTemplate`${renderComponent($$result, "CastCard", $$CastCard, { "key": actor.id, "name": actor.name, "character": actor.character, "headshot": actor.image, "class": "astro-CQ2ID4TG" })}`)}
                </div>
            </div>
        </section>
        <section id="recommendations" class="mb-5 container max-w-7xl mx-auto px-4 astro-CQ2ID4TG">
            <h3 class="mb-6 text-4xl font-semibold astro-CQ2ID4TG">Recommendations</h3>
            <div class="overflow-auto astro-CQ2ID4TG">
                <div class="flex w-max pb-5 astro-CQ2ID4TG">
                    ${film.recommendations.map((film2) => renderTemplate`<div class="mr-5 last:mr-0 astro-CQ2ID4TG">
                                <a${addAttribute(`/film/${film2.id}`, "href")} class="astro-CQ2ID4TG">
                                    <figure class="w-72 bg-gray-50 rounded h-full overflow-hidden astro-CQ2ID4TG">
                                        <picture class="astro-CQ2ID4TG">
                                            <img class="bg-gray-600 w-full h-40 object-cover object-center astro-CQ2ID4TG" width="500" height="281"${addAttribute(`${film2.title} cover`, "alt")}${addAttribute(film2.backdrop, "src")}>
                                        </picture>
                                        <figcaption class="text-blue-900 px-4 py-6 astro-CQ2ID4TG">
                                            <h4 class="font-medium text-xl astro-CQ2ID4TG">${film2.title}</h4>
                                        </figcaption>
                                    </figure>
                                </a>
                            </div>`)}
                </div>
            </div>
        </section>
    </main>` })}`;
});

const $$file$1 = "C:/Users/branb/Code/my-films-list/src/pages/film/[id].astro";
const $$url$1 = "/film/[id]";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$1,
	default: $$id,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata = createMetadata("/@fs/C:/Users/branb/Code/my-films-list/src/pages/404.astro", { modules: [{ module: $$module1, specifier: "../layouts/Layout.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro = createAstro("/@fs/C:/Users/branb/Code/my-films-list/src/pages/404.astro", "", "file:///C:/Users/branb/Code/my-films-list/");
const $$404 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$404;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "My Films List - 404" }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<main class="max-w-7xl mx-auto px-4">
        <h1>404</h1>
        <h2>Page Not Found</h2>
    </main>` })}`;
});

const $$file = "C:/Users/branb/Code/my-films-list/src/pages/404.astro";
const $$url = "/404";

const _page2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata,
	default: $$404,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const pageMap = new Map([['src/pages/index.astro', _page0],['src/pages/film/[id].astro', _page1],['src/pages/404.astro', _page2],]);
const renderers = [Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default }),Object.assign({"name":"@astrojs/react","clientEntrypoint":"@astrojs/react/client.js","serverEntrypoint":"@astrojs/react/server.js","jsxImportSource":"react"}, { ssr: _renderer1 }),];

if (typeof process !== "undefined") {
  if (process.argv.includes("--verbose")) ; else if (process.argv.includes("--silent")) ; else ;
}

const SCRIPT_EXTENSIONS = /* @__PURE__ */ new Set([".js", ".ts"]);
new RegExp(
  `\\.(${Array.from(SCRIPT_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

const STYLE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".css",
  ".pcss",
  ".postcss",
  ".scss",
  ".sass",
  ".styl",
  ".stylus",
  ".less"
]);
new RegExp(
  `\\.(${Array.from(STYLE_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return segment[0].spread ? `/:${segment[0].content.slice(3)}(.*)?` : "/" + segment.map((part) => {
      if (part)
        return part.dynamic ? `:${part.content}` : part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  return {
    ...serializedManifest,
    assets,
    routes
  };
}

const _manifest = Object.assign(deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"","links":["assets/404-film-_id_-index.a31c7904.css"],"scripts":[],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/404-film-_id_-index.a31c7904.css","assets/film-_id_.ea69e0d7.css"],"scripts":[],"routeData":{"route":"/film/[id]","type":"page","pattern":"^\\/film\\/([^/]+?)\\/?$","segments":[[{"content":"film","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/film/[id].astro","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/404-film-_id_-index.a31c7904.css"],"scripts":[],"routeData":{"route":"/404","type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","_meta":{"trailingSlash":"ignore"}}}],"base":"/","markdown":{"drafts":false,"syntaxHighlight":"shiki","shikiConfig":{"langs":[],"theme":"github-dark","wrap":false},"remarkPlugins":[],"rehypePlugins":[],"remarkRehype":{},"extendDefaultPlugins":false,"isAstroFlavoredMd":false},"pageMap":null,"renderers":[],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.js","@astrojs/react/client.js":"client.bf4f0f8e.js","astro:scripts/before-hydration.js":"data:text/javascript;charset=utf-8,//[no before-hydration script]"},"assets":["/assets/404-film-_id_-index.a31c7904.css","/assets/film-_id_.ea69e0d7.css","/client.bf4f0f8e.js","/favicon.svg"]}), {
	pageMap: pageMap,
	renderers: renderers
});
const _args = undefined;

const _exports = adapter.createExports(_manifest, _args);
const _default = _exports['default'];

const _start = 'start';
if(_start in adapter) {
	adapter[_start](_manifest, _args);
}

export { _default as default };
