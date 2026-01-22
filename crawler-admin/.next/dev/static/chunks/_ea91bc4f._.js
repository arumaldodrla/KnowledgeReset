(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/hooks/use-mobile.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useIsMobile",
    ()=>useIsMobile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
const MOBILE_BREAKPOINT = 1024;
function useIsMobile() {
    _s();
    const [isMobile, setIsMobile] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](undefined);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "useIsMobile.useEffect": ()=>{
            const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
            const onChange = {
                "useIsMobile.useEffect.onChange": ()=>{
                    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
                }
            }["useIsMobile.useEffect.onChange"];
            mql.addEventListener('change', onChange);
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
            return ({
                "useIsMobile.useEffect": ()=>mql.removeEventListener('change', onChange)
            })["useIsMobile.useEffect"];
        }
    }["useIsMobile.useEffect"], []);
    return !!isMobile;
}
_s(useIsMobile, "D6B2cPXNCaIbeOx+abFr1uxLRM0=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/use-scroll-position.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useScrollPosition",
    ()=>useScrollPosition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
function useScrollPosition({ targetRef } = {}) {
    _s();
    const [scrollPosition, setScrollPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useScrollPosition.useEffect": ()=>{
            // If the ref is not provided or its current value is null, fall back to document
            const target = targetRef?.current || document;
            const scrollable = target === document ? window : target;
            const updatePosition = {
                "useScrollPosition.useEffect.updatePosition": ()=>{
                    // Determine if we're scrolling the document or a specific element
                    const scrollY = target === document ? window.scrollY : target.scrollTop;
                    setScrollPosition(scrollY);
                }
            }["useScrollPosition.useEffect.updatePosition"];
            scrollable.addEventListener('scroll', updatePosition);
            // Set the initial position
            updatePosition();
            return ({
                "useScrollPosition.useEffect": ()=>{
                    scrollable.removeEventListener('scroll', updatePosition);
                }
            })["useScrollPosition.useEffect"];
        }
    }["useScrollPosition.useEffect"], [
        targetRef
    ]);
    return scrollPosition;
}
_s(useScrollPosition, "Q2iK3kJoTBUHGJF6VgTmVb/ctE4=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/use-menu.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useMenu",
    ()=>useMenu
]);
const useMenu = (pathname)=>{
    const isActive = (path)=>{
        if (path && path === '/') {
            return path === pathname;
        } else {
            return !!path && pathname.startsWith(path);
        }
    };
    const hasActiveChild = (children)=>{
        if (!children || !Array.isArray(children)) return false;
        return children.some((child)=>child.path && isActive(child.path) || child.children && hasActiveChild(child.children));
    };
    const isItemActive = (item)=>{
        return (item.path ? isActive(item.path) : false) || (item.children ? hasActiveChild(item.children) : false);
    };
    const getCurrentItem = (items)=>{
        for (const item of items){
            if (item.path && isActive(item.path)) {
                if (item.children && item.children.length > 0) {
                    const childMatch = getCurrentItem(item.children);
                    return childMatch || item;
                }
                return item;
            }
            if (item.children && item.children.length > 0) {
                const childMatch = getCurrentItem(item.children);
                if (childMatch) {
                    return childMatch;
                }
            }
        }
        return undefined;
    };
    const getBreadcrumb = (items)=>{
        const findBreadcrumb = (nodes, breadcrumb = [])=>{
            for (const item of nodes){
                const currentBreadcrumb = [
                    ...breadcrumb,
                    item
                ];
                // Check if this item is active
                if (item.path && isActive(item.path)) {
                    return currentBreadcrumb; // Return the breadcrumb up to this point
                }
                // If item has children, recurse and check them
                if (item.children && item.children.length > 0) {
                    const childBreadcrumb = findBreadcrumb(item.children, currentBreadcrumb);
                    if (childBreadcrumb.length > currentBreadcrumb.length) {
                        return childBreadcrumb; // Return the deeper breadcrumb if found
                    }
                }
            }
            return breadcrumb; // Return current breadcrumb if no match found
        };
        const breadcrumb = findBreadcrumb(items);
        return breadcrumb.length > 0 ? breadcrumb : [];
    };
    const getChildren = (items, level)=>{
        const hasActiveChildAtLevel = (items)=>{
            for (const item of items){
                if (item.path && (item.path === pathname || item.path !== '/' && item.path !== '' && pathname.startsWith(item.path)) || item.children && hasActiveChildAtLevel(item.children)) {
                    return true;
                }
            }
            return false;
        };
        const findChildren = (items, targetLevel, currentLevel = 0)=>{
            for (const item of items){
                if (item.children) {
                    if (targetLevel === currentLevel && hasActiveChildAtLevel(item.children)) {
                        return item.children;
                    }
                    const children = findChildren(item.children, targetLevel, currentLevel + 1);
                    if (children) {
                        return children;
                    }
                } else if (targetLevel === currentLevel && item.path && (item.path === pathname || item.path !== '/' && item.path !== '' && pathname.startsWith(item.path))) {
                    return items;
                }
            }
            return null;
        };
        return findChildren(items, level);
    };
    return {
        isActive,
        hasActiveChild,
        isItemActive,
        getCurrentItem,
        getBreadcrumb,
        getChildren
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/config/general.config.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generalSettings",
    ()=>generalSettings
]);
const generalSettings = {
    purchaseLink: 'https://1.envato.market/Vm7VRE',
    docsLink: '',
    licenseLink: '',
    devsLink: 'https://devs.keenthemes.com',
    faqLink: 'https://keenthemes.com/metronic',
    aboutLink: 'https://keenthemes.com/metronic'
};
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/config/layout-1.config.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MENU_MEGA",
    ()=>MENU_MEGA,
    "MENU_MEGA_MOBILE",
    ()=>MENU_MEGA_MOBILE,
    "MENU_SIDEBAR",
    ()=>MENU_SIDEBAR
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/award.js [app-client] (ecmascript) <export default as Award>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$badge$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/badge.js [app-client] (ecmascript) <export default as Badge>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-client] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bitcoin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bitcoin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bitcoin.js [app-client] (ecmascript) <export default as Bitcoin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Book$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book.js [app-client] (ecmascript) <export default as Book>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/briefcase.js [app-client] (ecmascript) <export default as Briefcase>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building.js [app-client] (ecmascript) <export default as Building>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-check.js [app-client] (ecmascript) <export default as CalendarCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$captions$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Captions$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/captions.js [app-client] (ecmascript) <export default as Captions>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/code.js [app-client] (ecmascript) <export default as Code>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coffee$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coffee$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/coffee.js [app-client] (ecmascript) <export default as Coffee>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file.js [app-client] (ecmascript) <export default as File>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$euro$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Euro$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/euro.js [app-client] (ecmascript) <export default as Euro>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileQuestion$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-question-mark.js [app-client] (ecmascript) <export default as FileQuestion>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flag.js [app-client] (ecmascript) <export default as Flag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ghost$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ghost$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ghost.js [app-client] (ecmascript) <export default as Ghost>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gift$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gift$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gift.js [app-client] (ecmascript) <export default as Gift>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grid-3x3.js [app-client] (ecmascript) <export default as Grid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-client] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$kanban$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Kanban$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/kanban.js [app-client] (ecmascript) <export default as Kanban>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Key$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/key.js [app-client] (ecmascript) <export default as Key>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panels-top-left.js [app-client] (ecmascript) <export default as Layout>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-client] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$life$2d$buoy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LifeBuoy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/life-buoy.js [app-client] (ecmascript) <export default as LifeBuoy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor.js [app-client] (ecmascript) <export default as Monitor>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/network.js [app-client] (ecmascript) <export default as Network>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plug$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plug$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plug.js [app-client] (ecmascript) <export default as Plug>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/share-2.js [app-client] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-off.js [app-client] (ecmascript) <export default as ShieldOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$mouse$2d$pointer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SquareMousePointer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-mouse-pointer.js [app-client] (ecmascript) <export default as SquareMousePointer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/thumbs-up.js [app-client] (ecmascript) <export default as ThumbsUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-check.js [app-client] (ecmascript) <export default as UserCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-user.js [app-client] (ecmascript) <export default as UserCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
;
const MENU_SIDEBAR = [
    {
        title: 'Dashboards',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"],
        children: [
            {
                title: 'Light Sidebar',
                path: '/layout-1'
            },
            {
                title: 'Dark Sidebar',
                path: '/layout-1/dark-sidebar'
            },
            {
                title: 'Empty Page',
                path: '#'
            }
        ]
    },
    {
        heading: 'User'
    },
    {
        title: 'Public Profile',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircle$3e$__["UserCircle"],
        children: [
            {
                title: 'Profiles',
                children: [
                    {
                        title: 'Default',
                        path: '#'
                    },
                    {
                        title: 'Creator',
                        path: '#'
                    },
                    {
                        title: 'Company',
                        path: '#'
                    },
                    {
                        title: 'NFT',
                        path: '#'
                    },
                    {
                        title: 'Blogger',
                        path: '#'
                    },
                    {
                        title: 'CRM',
                        path: '#'
                    },
                    {
                        title: 'More',
                        collapse: true,
                        collapseTitle: 'Show less',
                        expandTitle: 'Show 4 more',
                        children: [
                            {
                                title: 'Gamer',
                                path: '#'
                            },
                            {
                                title: 'Feeds',
                                path: '#'
                            },
                            {
                                title: 'Plain',
                                path: '#'
                            },
                            {
                                title: 'Modal',
                                path: '#'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Projects',
                children: [
                    {
                        title: '3 Columns',
                        path: '#'
                    },
                    {
                        title: '2 Columns',
                        path: '#'
                    }
                ]
            },
            {
                title: 'Works',
                path: '#'
            },
            {
                title: 'Teams',
                path: '#'
            },
            {
                title: 'Network',
                path: '#'
            },
            {
                title: 'Activity',
                path: '#'
            },
            {
                title: 'More',
                collapse: true,
                collapseTitle: 'Show less',
                expandTitle: 'Show 3 more',
                children: [
                    {
                        title: 'Campaigns - Card',
                        path: '#'
                    },
                    {
                        title: 'Campaigns - List',
                        path: '#'
                    },
                    {
                        title: 'Empty',
                        path: '#'
                    }
                ]
            }
        ]
    },
    {
        title: 'My Account',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
        children: [
            {
                title: 'Account',
                children: [
                    {
                        title: 'Get Started',
                        path: '#'
                    },
                    {
                        title: 'User Profile',
                        path: '#'
                    },
                    {
                        title: 'Company Profile',
                        path: '#'
                    },
                    {
                        title: 'Settings - With Sidebar',
                        path: '#'
                    },
                    {
                        title: 'Settings - Enterprise',
                        path: '#'
                    },
                    {
                        title: 'Settings - Plain',
                        path: '#'
                    },
                    {
                        title: 'Settings - Modal',
                        path: '#'
                    }
                ]
            },
            {
                title: 'Billing',
                children: [
                    {
                        title: 'Billing - Basic',
                        path: '#'
                    },
                    {
                        title: 'Billing - Enterprise',
                        path: '#'
                    },
                    {
                        title: 'Plans',
                        path: '#'
                    },
                    {
                        title: 'Billing History',
                        path: '#'
                    }
                ]
            },
            {
                title: 'Security',
                children: [
                    {
                        title: 'Get Started',
                        path: '#'
                    },
                    {
                        title: 'Security Overview',
                        path: '#'
                    },
                    {
                        title: 'Allowed IP Addresses',
                        path: '#'
                    },
                    {
                        title: 'Privacy Settings',
                        path: '#'
                    },
                    {
                        title: 'Device Management',
                        path: '#'
                    },
                    {
                        title: 'Backup & Recovery',
                        path: '#'
                    },
                    {
                        title: 'Current Sessions',
                        path: '#'
                    },
                    {
                        title: 'Security Log',
                        path: '#'
                    }
                ]
            },
            {
                title: 'Members & Roles',
                children: [
                    {
                        title: 'Teams Starter',
                        path: '#'
                    },
                    {
                        title: 'Teams',
                        path: '#'
                    },
                    {
                        title: 'Team Info',
                        path: '#'
                    },
                    {
                        title: 'Members Starter',
                        path: '#'
                    },
                    {
                        title: 'Team Members',
                        path: '#'
                    },
                    {
                        title: 'Import Members',
                        path: '#'
                    },
                    {
                        title: 'Roles',
                        path: '#'
                    },
                    {
                        title: 'Permissions - Toggler',
                        path: '#'
                    },
                    {
                        title: 'Permissions - Check',
                        path: '#'
                    }
                ]
            },
            {
                title: 'Integrations',
                path: '#'
            },
            {
                title: 'Notifications',
                path: '#'
            },
            {
                title: 'API Keys',
                path: '#'
            },
            {
                title: 'More',
                collapse: true,
                collapseTitle: 'Show less',
                expandTitle: 'Show 3 more',
                children: [
                    {
                        title: 'Appearance',
                        path: '#'
                    },
                    {
                        title: 'Invite a Friend',
                        path: '#'
                    },
                    {
                        title: 'Activity',
                        path: '#'
                    }
                ]
            }
        ]
    },
    {
        title: 'Network',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
        children: [
            {
                title: 'Get Started',
                path: '#'
            },
            {
                title: 'User Cards',
                children: [
                    {
                        title: 'Mini Cards',
                        path: '#'
                    },
                    {
                        title: 'Team Crew',
                        path: '#'
                    },
                    {
                        title: 'Author',
                        path: '#'
                    },
                    {
                        title: 'NFT',
                        path: '#'
                    },
                    {
                        title: 'Social',
                        path: '#'
                    }
                ]
            },
            {
                title: 'User Table',
                children: [
                    {
                        title: 'Team Crew',
                        path: '#'
                    },
                    {
                        title: 'App Roster',
                        path: '#'
                    },
                    {
                        title: 'Market Authors',
                        path: '#'
                    },
                    {
                        title: 'SaaS Users',
                        path: '#'
                    },
                    {
                        title: 'Store Clients',
                        path: '#'
                    },
                    {
                        title: 'Visitors',
                        path: '#'
                    }
                ]
            },
            {
                title: 'Cooperations',
                path: '#',
                disabled: true
            },
            {
                title: 'Leads',
                path: '#',
                disabled: true
            },
            {
                title: 'Donators',
                path: '#',
                disabled: true
            }
        ]
    }
];
const MENU_MEGA = [
    {
        title: 'Home',
        path: '/layout-1'
    },
    {
        title: 'Profiles',
        children: [
            {
                title: 'Profiles',
                children: [
                    {
                        children: [
                            {
                                title: 'Default',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$badge$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"],
                                path: '#'
                            },
                            {
                                title: 'Creator',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coffee$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coffee$3e$__["Coffee"],
                                path: '#'
                            },
                            {
                                title: 'Company',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building$3e$__["Building"],
                                path: '#'
                            },
                            {
                                title: 'NFT',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bitcoin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bitcoin$3e$__["Bitcoin"],
                                path: '#'
                            },
                            {
                                title: 'Blogger',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"],
                                path: '#'
                            },
                            {
                                title: 'CRM',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"],
                                path: '#'
                            },
                            {
                                title: 'Gamer',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ghost$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ghost$3e$__["Ghost"],
                                path: '#'
                            }
                        ]
                    },
                    {
                        children: [
                            {
                                title: 'Feeds',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Book$3e$__["Book"],
                                path: '#'
                            },
                            {
                                title: 'Plain',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
                                path: '#'
                            },
                            {
                                title: 'Modal',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$mouse$2d$pointer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SquareMousePointer$3e$__["SquareMousePointer"],
                                path: '#'
                            },
                            {
                                title: 'Freelancer',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"],
                                path: '#',
                                disabled: true
                            },
                            {
                                title: 'Developer',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__["Code"],
                                path: '#',
                                disabled: true
                            },
                            {
                                title: 'Team',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                                path: '#',
                                disabled: true
                            },
                            {
                                title: 'Events',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarCheck$3e$__["CalendarCheck"],
                                path: '#',
                                disabled: true
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Other Pages',
                children: [
                    {
                        children: [
                            {
                                title: 'Projects - 3 Cols',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__["Layout"],
                                path: '#'
                            },
                            {
                                title: 'Projects - 2 Cols',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid$3e$__["Grid"],
                                path: '#'
                            },
                            {
                                title: 'Works',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"],
                                path: '#'
                            },
                            {
                                title: 'Teams',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                                path: '#'
                            },
                            {
                                title: 'Network',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__["Network"],
                                path: '#'
                            },
                            {
                                title: 'Activity',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"],
                                path: '#'
                            },
                            {
                                title: 'Campaigns - Card',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"],
                                path: '#'
                            }
                        ]
                    },
                    {
                        children: [
                            {
                                title: 'Campaigns - List',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$kanban$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Kanban$3e$__["Kanban"],
                                path: '#'
                            },
                            {
                                title: 'Empty',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
                                path: '#'
                            },
                            {
                                title: 'Documents',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__["File"],
                                path: '#',
                                disabled: true
                            },
                            {
                                title: 'Badges',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"],
                                path: '#',
                                disabled: true
                            },
                            {
                                title: 'Awards',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gift$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gift$3e$__["Gift"],
                                path: '#',
                                disabled: true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        title: 'My Account',
        children: [
            {
                title: 'General Pages',
                children: [
                    {
                        title: 'Integrations',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plug$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plug$3e$__["Plug"],
                        path: '#'
                    },
                    {
                        title: 'Notifications',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"],
                        path: '#'
                    },
                    {
                        title: 'API Keys',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Key$3e$__["Key"],
                        path: '#'
                    },
                    {
                        title: 'Appearance',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"],
                        path: '#'
                    },
                    {
                        title: 'Invite a Friend',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__["UserCheck"],
                        path: '#'
                    },
                    {
                        title: 'Activity',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$life$2d$buoy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LifeBuoy$3e$__["LifeBuoy"],
                        path: '#'
                    },
                    {
                        title: 'Brand',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"],
                        disabled: true
                    },
                    {
                        title: 'Get Paid',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$euro$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Euro$3e$__["Euro"],
                        disabled: true
                    }
                ]
            },
            {
                title: 'Other pages',
                children: [
                    {
                        title: 'Account Home',
                        children: [
                            {
                                title: 'Get Started',
                                path: '#'
                            },
                            {
                                title: 'User Profile',
                                path: '#'
                            },
                            {
                                title: 'Company Profile',
                                path: '#'
                            },
                            {
                                title: 'With Sidebar',
                                path: '#'
                            },
                            {
                                title: 'Enterprise',
                                path: '#'
                            },
                            {
                                title: 'Plain',
                                path: '#'
                            },
                            {
                                title: 'Modal',
                                path: '#'
                            }
                        ]
                    },
                    {
                        title: 'Billing',
                        children: [
                            {
                                title: 'Basic Billing',
                                path: '#'
                            },
                            {
                                title: 'Enterprise',
                                path: '#'
                            },
                            {
                                title: 'Plans',
                                path: '#'
                            },
                            {
                                title: 'Billing History',
                                path: '#'
                            },
                            {
                                title: 'Tax Info',
                                disabled: true
                            },
                            {
                                title: 'Invoices',
                                disabled: true
                            },
                            {
                                title: 'Gateaways',
                                disabled: true
                            }
                        ]
                    },
                    {
                        title: 'Security',
                        children: [
                            {
                                title: 'Get Started',
                                path: '#'
                            },
                            {
                                title: 'Security Overview',
                                path: '#'
                            },
                            {
                                title: 'IP Addresses',
                                path: '#'
                            },
                            {
                                title: 'Privacy Settings',
                                path: '#'
                            },
                            {
                                title: 'Device Management',
                                path: '#'
                            },
                            {
                                title: 'Backup & Recovery',
                                path: '#'
                            },
                            {
                                title: 'Current Sessions',
                                path: '#'
                            },
                            {
                                title: 'Security Log',
                                path: '#'
                            }
                        ]
                    },
                    {
                        title: 'Members & Roles',
                        children: [
                            {
                                title: 'Teams Starter',
                                path: '#'
                            },
                            {
                                title: 'Teams',
                                path: '#'
                            },
                            {
                                title: 'Team Info',
                                path: '#'
                            },
                            {
                                title: 'Members Starter',
                                path: '#'
                            },
                            {
                                title: 'Team Members',
                                path: '#'
                            },
                            {
                                title: 'Import Members',
                                path: '#'
                            },
                            {
                                title: 'Roles',
                                path: '#'
                            },
                            {
                                title: 'Permissions - Toggler',
                                path: '#'
                            },
                            {
                                title: 'Permissions - Check',
                                path: '#'
                            }
                        ]
                    },
                    {
                        title: 'Other Pages',
                        children: [
                            {
                                title: 'Integrations',
                                path: '#'
                            },
                            {
                                title: 'Notifications',
                                path: '#'
                            },
                            {
                                title: 'API Keys',
                                path: '#'
                            },
                            {
                                title: 'Appearance',
                                path: '#'
                            },
                            {
                                title: 'Invite a Friend',
                                path: '#'
                            },
                            {
                                title: 'Activity',
                                path: '#'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        title: 'Network',
        children: [
            {
                title: 'General Pages',
                children: [
                    {
                        title: 'Get Started',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__["Flag"],
                        path: '#'
                    },
                    {
                        title: 'Colleagues',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                        path: '#',
                        disabled: true
                    },
                    {
                        title: 'Donators',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"],
                        path: '#',
                        disabled: true
                    },
                    {
                        title: 'Leads',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"],
                        path: '#',
                        disabled: true
                    }
                ]
            },
            {
                title: 'Other pages',
                children: [
                    {
                        title: 'User Cards',
                        children: [
                            {
                                title: 'Mini Cards',
                                path: '#'
                            },
                            {
                                title: 'Team Members',
                                path: '#'
                            },
                            {
                                title: 'Authors',
                                path: '#'
                            },
                            {
                                title: 'NFT Users',
                                path: '#'
                            },
                            {
                                title: 'Social Users',
                                path: '#'
                            },
                            {
                                title: 'Gamers',
                                path: '#',
                                disabled: true
                            }
                        ]
                    },
                    {
                        title: 'User Base',
                        badge: 'Datatables',
                        children: [
                            {
                                title: 'Team Crew',
                                path: '#'
                            },
                            {
                                title: 'App Roster',
                                path: '#'
                            },
                            {
                                title: 'Market Authors',
                                path: '#'
                            },
                            {
                                title: 'SaaS Users',
                                path: '#'
                            },
                            {
                                title: 'Store Clients',
                                path: '#'
                            },
                            {
                                title: 'Visitors',
                                path: '#'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        title: 'Authentication',
        children: [
            {
                title: 'General pages',
                children: [
                    {
                        title: 'Classic Layout',
                        children: [
                            {
                                title: 'Sign In',
                                path: '#'
                            },
                            {
                                title: 'Sign Up',
                                path: '#'
                            },
                            {
                                title: '2FA',
                                path: '#'
                            },
                            {
                                title: 'Check Email',
                                path: '#'
                            },
                            {
                                title: 'Reset Password',
                                children: [
                                    {
                                        title: 'Enter Email',
                                        path: '#'
                                    },
                                    {
                                        title: 'Check Email',
                                        path: '#'
                                    },
                                    {
                                        title: 'Password is Changed',
                                        path: '#'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        title: 'Branded Layout',
                        children: [
                            {
                                title: 'Sign In',
                                path: '#'
                            },
                            {
                                title: 'Sign Up',
                                path: '#'
                            },
                            {
                                title: '2FA',
                                path: '#'
                            },
                            {
                                title: 'Check Email',
                                path: '#'
                            },
                            {
                                title: 'Reset Password',
                                children: [
                                    {
                                        title: 'Enter Email',
                                        path: '#'
                                    },
                                    {
                                        title: 'Check Email',
                                        path: '#'
                                    },
                                    {
                                        title: 'Password is Changed',
                                        path: '#'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Other Pages',
                children: [
                    {
                        title: 'Welcome Message',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsUp$3e$__["ThumbsUp"],
                        path: '#'
                    },
                    {
                        title: 'Account Deactivated',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldOff$3e$__["ShieldOff"],
                        path: '#'
                    },
                    {
                        title: 'Error 404',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"],
                        path: '#'
                    },
                    {
                        title: 'Error 500',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
                        path: '#'
                    }
                ]
            }
        ]
    },
    {
        title: 'Store ',
        children: [
            {
                title: 'Store - Client',
                children: [
                    {
                        children: [
                            {
                                title: 'Home',
                                path: '/layout-1'
                            },
                            {
                                title: 'Search Results - Grid',
                                path: '#'
                            },
                            {
                                title: 'Search Results - List',
                                path: '#'
                            },
                            {
                                title: 'Product Details',
                                path: '#'
                            },
                            {
                                title: 'Wishlist',
                                path: '#'
                            },
                            {
                                title: 'My Orders',
                                path: '#'
                            }
                        ]
                    },
                    {
                        children: [
                            {
                                title: 'Checkout - Order Summary',
                                path: '#'
                            },
                            {
                                title: 'Checkout - Shipping Info',
                                path: '#'
                            },
                            {
                                title: 'Checkout - Payment Method',
                                path: '#'
                            },
                            {
                                title: 'Checkout - Order Placed',
                                path: '#'
                            },
                            {
                                title: 'Order Receipt',
                                path: '#'
                            }
                        ]
                    }
                ]
            }
        ]
    }
];
const MENU_MEGA_MOBILE = [
    {
        title: 'Home',
        path: '/layout-1'
    },
    {
        title: 'Profiles',
        children: [
            {
                title: 'Profiles',
                children: [
                    {
                        title: 'Default',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$badge$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"],
                        path: '#'
                    },
                    {
                        title: 'Creator',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coffee$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coffee$3e$__["Coffee"],
                        path: '#'
                    },
                    {
                        title: 'Company',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building$3e$__["Building"],
                        path: '#'
                    },
                    {
                        title: 'NFT',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bitcoin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bitcoin$3e$__["Bitcoin"],
                        path: '#'
                    },
                    {
                        title: 'Blogger',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"],
                        path: '#'
                    },
                    {
                        title: 'CRM',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"],
                        path: '#'
                    },
                    {
                        title: 'Gamer',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ghost$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ghost$3e$__["Ghost"],
                        path: '#'
                    },
                    {
                        title: 'Feeds',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Book$3e$__["Book"],
                        path: '#'
                    },
                    {
                        title: 'Plain',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__["File"],
                        path: '#'
                    },
                    {
                        title: 'Modal',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$mouse$2d$pointer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SquareMousePointer$3e$__["SquareMousePointer"],
                        path: '#'
                    },
                    {
                        title: 'Freelancer',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"],
                        path: '#',
                        disabled: true
                    },
                    {
                        title: 'Developer',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__["Code"],
                        path: '#',
                        disabled: true
                    },
                    {
                        title: 'Team',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                        path: '#',
                        disabled: true
                    },
                    {
                        title: 'Events',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarCheck$3e$__["CalendarCheck"],
                        path: '#',
                        disabled: true
                    }
                ]
            },
            {
                title: 'Other Pages',
                children: [
                    {
                        title: 'Projects - 3 Cols',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__["Layout"],
                        path: '#'
                    },
                    {
                        title: 'Projects - 2 Cols',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid$3e$__["Grid"],
                        path: '#'
                    },
                    {
                        title: 'Works',
                        path: '#'
                    },
                    {
                        title: 'Teams',
                        path: '#'
                    },
                    {
                        title: 'Network',
                        path: '#'
                    },
                    {
                        title: 'Activity',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"],
                        path: '#'
                    },
                    {
                        title: 'Campaigns - Card',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"],
                        path: '#'
                    },
                    {
                        title: 'Campaigns - List',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$kanban$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Kanban$3e$__["Kanban"],
                        path: '#'
                    },
                    {
                        title: 'Empty',
                        path: '#'
                    },
                    {
                        title: 'Documents',
                        path: '#',
                        disabled: true
                    },
                    {
                        title: 'Badges',
                        path: '#',
                        disabled: true
                    },
                    {
                        title: 'Awards',
                        path: '#',
                        disabled: true
                    }
                ]
            }
        ]
    },
    {
        title: 'My Account',
        children: [
            {
                title: 'General Pages',
                children: [
                    {
                        title: 'Integrations',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plug$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plug$3e$__["Plug"],
                        path: '#'
                    },
                    {
                        title: 'Notifications',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"],
                        path: '#'
                    },
                    {
                        title: 'API Keys',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Key$3e$__["Key"],
                        path: '#'
                    },
                    {
                        title: 'Appearance',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"],
                        path: '#'
                    },
                    {
                        title: 'Invite a Friend',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__["UserCheck"],
                        path: '#'
                    },
                    {
                        title: 'Activity',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$life$2d$buoy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LifeBuoy$3e$__["LifeBuoy"],
                        path: '#'
                    },
                    {
                        title: 'Brand',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"],
                        disabled: true
                    },
                    {
                        title: 'Get Paid',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$euro$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Euro$3e$__["Euro"],
                        disabled: true
                    }
                ]
            },
            {
                title: 'Other pages',
                children: [
                    {
                        title: 'Account Home',
                        children: [
                            {
                                title: 'Get Started',
                                path: '#'
                            },
                            {
                                title: 'User Profile',
                                path: '#'
                            },
                            {
                                title: 'Company Profile',
                                path: '#'
                            },
                            {
                                title: 'With Sidebar',
                                path: '#'
                            },
                            {
                                title: 'Enterprise',
                                path: '#'
                            },
                            {
                                title: 'Plain',
                                path: '#'
                            },
                            {
                                title: 'Modal',
                                path: '#'
                            }
                        ]
                    },
                    {
                        title: 'Billing',
                        children: [
                            {
                                title: 'Basic Billing',
                                path: '#'
                            },
                            {
                                title: 'Enterprise',
                                path: '#'
                            },
                            {
                                title: 'Plans',
                                path: '#'
                            },
                            {
                                title: 'Billing History',
                                path: '#'
                            },
                            {
                                title: 'Tax Info',
                                disabled: true
                            },
                            {
                                title: 'Invoices',
                                disabled: true
                            },
                            {
                                title: 'Gateaways',
                                disabled: true
                            }
                        ]
                    },
                    {
                        title: 'Security',
                        children: [
                            {
                                title: 'Get Started',
                                path: '#'
                            },
                            {
                                title: 'Security Overview',
                                path: '#'
                            },
                            {
                                title: 'IP Addresses',
                                path: '#'
                            },
                            {
                                title: 'Privacy Settings',
                                path: '#'
                            },
                            {
                                title: 'Device Management',
                                path: '#'
                            },
                            {
                                title: 'Backup & Recovery',
                                path: '#'
                            },
                            {
                                title: 'Current Sessions',
                                path: '#'
                            },
                            {
                                title: 'Security Log',
                                path: '#'
                            }
                        ]
                    },
                    {
                        title: 'Members & Roles',
                        children: [
                            {
                                title: 'Teams Starter',
                                path: '#'
                            },
                            {
                                title: 'Teams',
                                path: '#'
                            },
                            {
                                title: 'Team Info',
                                path: '#'
                            },
                            {
                                title: 'Members Starter',
                                path: '#'
                            },
                            {
                                title: 'Team Members',
                                path: '#'
                            },
                            {
                                title: 'Import Members',
                                path: '#'
                            },
                            {
                                title: 'Roles',
                                path: '#'
                            },
                            {
                                title: 'Permissions - Toggler',
                                path: '#'
                            },
                            {
                                title: 'Permissions - Check',
                                path: '#'
                            }
                        ]
                    },
                    {
                        title: 'Other Pages',
                        children: [
                            {
                                title: 'Integrations',
                                path: '#'
                            },
                            {
                                title: 'Notifications',
                                path: '#'
                            },
                            {
                                title: 'API Keys',
                                path: '#'
                            },
                            {
                                title: 'Appearance',
                                path: '#'
                            },
                            {
                                title: 'Invite a Friend',
                                path: '#'
                            },
                            {
                                title: 'Activity',
                                path: '#'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        title: 'Network',
        children: [
            {
                title: 'General Pages',
                children: [
                    {
                        title: 'Get Started',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__["Flag"],
                        path: '#'
                    },
                    {
                        title: 'Colleagues',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                        path: '#',
                        disabled: true
                    },
                    {
                        title: 'Donators',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"],
                        path: '#',
                        disabled: true
                    },
                    {
                        title: 'Leads',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"],
                        path: '#',
                        disabled: true
                    }
                ]
            },
            {
                title: 'Other pages',
                children: [
                    {
                        title: 'User Cards',
                        children: [
                            {
                                title: 'Mini Cards',
                                path: '#'
                            },
                            {
                                title: 'Team Members',
                                path: '#'
                            },
                            {
                                title: 'Authors',
                                path: '#'
                            },
                            {
                                title: 'NFT Users',
                                path: '#'
                            },
                            {
                                title: 'Social Users',
                                path: '#'
                            },
                            {
                                title: 'Gamers',
                                path: '#',
                                disabled: true
                            }
                        ]
                    },
                    {
                        title: 'User Base',
                        badge: 'Datatables',
                        children: [
                            {
                                title: 'Team Crew',
                                path: '#'
                            },
                            {
                                title: 'App Roster',
                                path: '#'
                            },
                            {
                                title: 'Market Authors',
                                path: '#'
                            },
                            {
                                title: 'SaaS Users',
                                path: '#'
                            },
                            {
                                title: 'Store Clients',
                                path: '#'
                            },
                            {
                                title: 'Visitors',
                                path: '#'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        title: 'Store - Client',
        children: [
            {
                title: 'Home',
                path: '/layout-1'
            },
            {
                title: 'Search Results - Grid',
                path: '#'
            },
            {
                title: 'Search Results - List',
                path: '#'
            },
            {
                title: 'Product Details',
                path: '#'
            },
            {
                title: 'Wishlist',
                path: '#'
            },
            {
                title: 'Checkout',
                children: [
                    {
                        title: 'Order Summary',
                        path: '#'
                    },
                    {
                        title: 'Shipping Info',
                        path: '#'
                    },
                    {
                        title: 'Payment Method',
                        path: '#'
                    },
                    {
                        title: 'Order Placed',
                        path: '#'
                    }
                ]
            },
            {
                title: 'My Orders',
                path: '#'
            },
            {
                title: 'Order Receipt',
                path: '#'
            }
        ]
    },
    {
        title: 'Authentication',
        children: [
            {
                title: 'General pages',
                children: [
                    {
                        title: 'Classic Layout',
                        children: [
                            {
                                title: 'Sign In',
                                path: '#'
                            },
                            {
                                title: 'Sign Up',
                                path: '#'
                            },
                            {
                                title: '2FA',
                                path: '#'
                            },
                            {
                                title: 'Check Email',
                                path: '#'
                            },
                            {
                                title: 'Reset Password',
                                children: [
                                    {
                                        title: 'Enter Email',
                                        path: '#'
                                    },
                                    {
                                        title: 'Check Email',
                                        path: '#'
                                    },
                                    {
                                        title: 'Password is Changed',
                                        path: '#'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        title: 'Branded Layout',
                        children: [
                            {
                                title: 'Sign In',
                                path: '#'
                            },
                            {
                                title: 'Sign Up',
                                path: '#'
                            },
                            {
                                title: '2FA',
                                path: '#'
                            },
                            {
                                title: 'Check Email',
                                path: '#'
                            },
                            {
                                title: 'Reset Password',
                                children: [
                                    {
                                        title: 'Enter Email',
                                        path: '#'
                                    },
                                    {
                                        title: 'Check Email',
                                        path: '#'
                                    },
                                    {
                                        title: 'Password is Changed',
                                        path: '#'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Other Pages',
                children: [
                    {
                        title: 'Welcome Message',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thumbs$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThumbsUp$3e$__["ThumbsUp"],
                        path: '#'
                    },
                    {
                        title: 'Account Deactivated',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldOff$3e$__["ShieldOff"],
                        path: '#'
                    },
                    {
                        title: 'Error 404',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"],
                        path: '#'
                    },
                    {
                        title: 'Error 500',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
                        path: '#'
                    }
                ]
            }
        ]
    },
    {
        title: 'Help',
        children: [
            {
                title: 'Getting Started',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coffee$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coffee$3e$__["Coffee"],
                path: 'https://keenthemes.com/metronic/tailwind/docs/getting-started/installation'
            },
            {
                title: 'Support Forum',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
                children: [
                    {
                        title: 'All Questions',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileQuestion$3e$__["FileQuestion"],
                        path: 'https://devs.keenthemes.com'
                    },
                    {
                        title: 'Popular Questions',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"],
                        path: 'https://devs.keenthemes.com/popular'
                    },
                    {
                        title: 'Ask Question',
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"],
                        path: 'https://devs.keenthemes.com/question/create'
                    }
                ]
            },
            {
                title: 'Licenses & FAQ',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$captions$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Captions$3e$__["Captions"],
                path: 'https://keenthemes.com/metronic/tailwind/docs/getting-started/license'
            },
            {
                title: 'Documentation',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileQuestion$3e$__["FileQuestion"],
                path: 'https://keenthemes.com/metronic/tailwind/docs'
            },
            {
                separator: true
            },
            {
                title: 'Contact Us',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"],
                path: 'https://keenthemes.com/contact'
            }
        ]
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/helpers.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "debounce",
    ()=>debounce,
    "formatDate",
    ()=>formatDate,
    "formatDateTime",
    ()=>formatDateTime,
    "getInitials",
    ()=>getInitials,
    "throttle",
    ()=>throttle,
    "timeAgo",
    ()=>timeAgo,
    "toAbsoluteUrl",
    ()=>toAbsoluteUrl,
    "uid",
    ()=>uid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const throttle = (func, limit)=>{
    let lastFunc = null;
    let lastRan = null;
    return function(...args) {
        if (lastRan === null) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            if (lastFunc !== null) {
                clearTimeout(lastFunc);
            }
            lastFunc = setTimeout(()=>{
                if (Date.now() - lastRan >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
};
function debounce(func, wait) {
    let timeout = null;
    return function(...args) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(()=>{
            func(...args);
        }, wait);
    };
}
function uid() {
    return (Date.now() + Math.floor(Math.random() * 1000)).toString();
}
function getInitials(name, count) {
    if (!name || typeof name !== 'string') {
        return '';
    }
    const initials = name.split(' ').filter(Boolean).map((part)=>part[0].toUpperCase());
    return count && count > 0 ? initials.slice(0, count).join('') : initials.join('');
}
function toAbsoluteUrl(pathname) {
    const baseUrl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_BASE_PATH;
    if (baseUrl && baseUrl !== '/') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_BASE_PATH + pathname;
    } else {
        return pathname;
    }
}
function timeAgo(date) {
    const now = new Date();
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    const diff = Math.floor((now.getTime() - inputDate.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''} ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diff / 31536000)} year${Math.floor(diff / 31536000) > 1 ? 's' : ''} ago`;
}
function formatDate(input) {
    const date = new Date(input);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}
function formatDateTime(input) {
    const date = new Date(input);
    return date.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/crawler/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/app/crawler/layout.tsx'\n\nReturn statement is not allowed here");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
]);

//# sourceMappingURL=_ea91bc4f._.js.map