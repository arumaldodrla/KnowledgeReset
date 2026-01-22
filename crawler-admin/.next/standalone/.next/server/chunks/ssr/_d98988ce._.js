module.exports=[950463,a=>{"use strict";var b=a.i(187924),c=a.i(497895);function d({className:a,...d}){return(0,b.jsx)("div",{"data-slot":"skeleton",className:(0,c.cn)("animate-pulse rounded-md bg-accent",a),...d})}a.s(["Skeleton",()=>d])},205522,a=>{"use strict";var b=a.i(187924),c=a.i(497895),d=a.i(400187);let e=(0,d.cva)(`
    flex w-full bg-background border border-input shadow-xs shadow-black/5 transition-[color,box-shadow] text-foreground placeholder:text-muted-foreground/80 
    focus-visible:ring-ring/30  focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px]     
    disabled:cursor-not-allowed disabled:opacity-60 
    [&[readonly]]:bg-muted/80 [&[readonly]]:cursor-not-allowed
    file:h-full [&[type=file]]:py-0 file:border-solid file:border-input file:bg-transparent 
    file:font-medium file:not-italic file:text-foreground file:p-0 file:border-0 file:border-e
    aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
  `,{variants:{variant:{lg:"h-10 px-4 text-sm rounded-md file:pe-4 file:me-4",md:"h-8.5 px-3 text-[0.8125rem] leading-(--text-sm--line-height) rounded-md file:pe-3 file:me-3",sm:"h-7 px-2.5 text-xs rounded-md file:pe-2.5 file:me-2.5"}},defaultVariants:{variant:"md"}});(0,d.cva)("flex items-center shrink-0 justify-center bg-muted border border-input shadow-xs shadow-[rgba(0,0,0,0.05)] text-secondary-foreground [&_svg]:text-secondary-foreground/60",{variants:{variant:{sm:"rounded-md h-7 min-w-7 text-xs px-2.5 [&_svg:not([class*=size-])]:size-3.5",md:"rounded-md h-8.5 min-w-8.5 px-3 text-[0.8125rem] leading-(--text-sm--line-height) [&_svg:not([class*=size-])]:size-4.5",lg:"rounded-md h-10 min-w-10 px-4 text-sm [&_svg:not([class*=size-])]:size-4.5"},mode:{default:"",icon:"px-0 justify-center"}},defaultVariants:{variant:"md",mode:"default"}}),(0,d.cva)(`
    flex items-stretch
    [&_[data-slot=input]]:grow
    [&_[data-slot=input-addon]:has(+[data-slot=input])]:rounded-e-none [&_[data-slot=input-addon]:has(+[data-slot=input])]:border-e-0
    [&_[data-slot=input-addon]:has(+[data-slot=datefield])]:rounded-e-none [&_[data-slot=input-addon]:has(+[data-slot=datefield])]:border-e-0 
    [&_[data-slot=input]+[data-slot=input-addon]]:rounded-s-none [&_[data-slot=input]+[data-slot=input-addon]]:border-s-0
    [&_[data-slot=input-addon]:has(+[data-slot=button])]:rounded-e-none
    [&_[data-slot=input]+[data-slot=button]]:rounded-s-none
    [&_[data-slot=button]+[data-slot=input]]:rounded-s-none
    [&_[data-slot=input-addon]+[data-slot=input]]:rounded-s-none
    [&_[data-slot=input-addon]+[data-slot=datefield]]:[&_[data-slot=input]]:rounded-s-none
    [&_[data-slot=datefield]:has(+[data-slot=input-addon])]:[&_[data-slot=input]]:rounded-e-none
    [&_[data-slot=input]:has(+[data-slot=button])]:rounded-e-none
    [&_[data-slot=input]:has(+[data-slot=input-addon])]:rounded-e-none
    [&_[data-slot=datefield]]:grow
    [&_[data-slot=datefield]+[data-slot=input-addon]]:rounded-s-none [&_[data-slot=datefield]+[data-slot=input-addon]]:border-s-0
  `,{variants:{},defaultVariants:{}});let f=(0,d.cva)(`
    flex items-center gap-1.5
    has-[:focus-visible]:ring-ring/30 
    has-[:focus-visible]:border-ring
    has-[:focus-visible]:outline-none 
    has-[:focus-visible]:ring-[3px]

    [&_[data-slot=datefield]]:grow 
    [&_[data-slot=input]]:data-focus-within:ring-transparent  
    [&_[data-slot=input]]:data-focus-within:ring-0 
    [&_[data-slot=input]]:data-focus-within:border-0 
    [&_[data-slot=input]]:flex 
    [&_[data-slot=input]]:w-full 
    [&_[data-slot=input]]:outline-none 
    [&_[data-slot=input]]:transition-colors 
    [&_[data-slot=input]]:text-foreground
    [&_[data-slot=input]]:placeholder:text-muted-foreground 
    [&_[data-slot=input]]:border-0 
    [&_[data-slot=input]]:bg-transparent 
    [&_[data-slot=input]]:p-0
    [&_[data-slot=input]]:shadow-none 
    [&_[data-slot=input]]:focus-visible:ring-0 
    [&_[data-slot=input]]:h-auto 
    [&_[data-slot=input]]:disabled:cursor-not-allowed
    [&_[data-slot=input]]:disabled:opacity-50    

    [&_svg]:text-muted-foreground 
    [&_svg]:shrink-0
  `,{variants:{variant:{sm:"gap-1.25 [&_svg:not([class*=size-])]:size-3.5",md:"gap-1.5 [&_svg:not([class*=size-])]:size-4",lg:"gap-1.5 [&_svg:not([class*=size-])]:size-4"}},defaultVariants:{variant:"md"}});function g({className:a,type:d,variant:f,...g}){return(0,b.jsx)("input",{"data-slot":"input",type:d,className:(0,c.cn)(e({variant:f}),a),...g})}function h({className:a,variant:d,...g}){return(0,b.jsx)("div",{"data-slot":"input-wrapper",className:(0,c.cn)(e({variant:d}),f({variant:d}),a),...g})}a.s(["Input",()=>g,"InputWrapper",()=>h])},587532,a=>{"use strict";let b=(0,a.i(170106).default)("search",[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]);a.s(["Search",()=>b],587532)},944194,a=>{"use strict";let b=(0,a.i(170106).default)("coffee",[["path",{d:"M10 2v2",key:"7u0qdc"}],["path",{d:"M14 2v2",key:"6buw04"}],["path",{d:"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1",key:"pwadti"}],["path",{d:"M6 2v2",key:"colzsn"}]]);a.s(["Coffee",()=>b],944194)},101239,a=>{"use strict";let b=(0,a.i(170106).default)("pin",[["path",{d:"M12 17v5",key:"bb1du9"}],["path",{d:"M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z",key:"1nkz8b"}]]);a.s(["Pin",()=>b],101239)},178145,a=>{"use strict";let b=(0,a.i(170106).default)("message-square-code",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}],["path",{d:"m10 8-3 3 3 3",key:"fp6dz7"}],["path",{d:"m14 14 3-3-3-3",key:"1yrceu"}]]);a.s(["MessageSquareCode",()=>b],178145)},969897,a=>{"use strict";let b=(0,a.i(170106).default)("vector-square",[["path",{d:"M19.5 7a24 24 0 0 1 0 10",key:"8n60xe"}],["path",{d:"M4.5 7a24 24 0 0 0 0 10",key:"2lmadr"}],["path",{d:"M7 19.5a24 24 0 0 0 10 0",key:"1q94o2"}],["path",{d:"M7 4.5a24 24 0 0 1 10 0",key:"2z8ypa"}],["rect",{x:"17",y:"17",width:"5",height:"5",rx:"1",key:"1ac74s"}],["rect",{x:"17",y:"2",width:"5",height:"5",rx:"1",key:"1e7h5j"}],["rect",{x:"2",y:"17",width:"5",height:"5",rx:"1",key:"1t4eah"}],["rect",{x:"2",y:"2",width:"5",height:"5",rx:"1",key:"940dhs"}]]);a.s(["VectorSquare",()=>b],969897)},924840,a=>{"use strict";var b=a.i(187924);function c({children:a}){return(0,b.jsx)("div",{className:"flex flex-wrap items-center justify-between gap-3.5 pb-5 pt-2.5",children:a})}function d({children:a}){return(0,b.jsx)("div",{className:"flex items-center gap-2.5",children:a})}function e({children:a}){return(0,b.jsx)("div",{className:"flex flex-col justify-center gap-2",children:a})}function f({children:a}){return(0,b.jsx)("h1",{className:"text-base font-medium leading-none text-foreground",children:a})}function g({children:a}){return(0,b.jsx)("div",{className:"flex items-center gap-2 text-sm font-normal text-muted-foreground",children:a})}a.s(["Toolbar",()=>c,"ToolbarActions",()=>d,"ToolbarDescription",()=>g,"ToolbarHeading",()=>e,"ToolbarPageTitle",()=>f])},849936,a=>{"use strict";var b=a.i(187924),c=a.i(924840),d=a.i(340695),e=a.i(205522),f=a.i(950463),g=a.i(944194),h=a.i(101239),i=a.i(178145),j=a.i(969897),k=a.i(587532);function l(){return(0,b.jsxs)("div",{className:"container-fluid",children:[(0,b.jsxs)(c.Toolbar,{children:[(0,b.jsx)("div",{className:"flex items-center gap-3",children:(0,b.jsxs)(c.ToolbarHeading,{children:[(0,b.jsx)(c.ToolbarPageTitle,{children:"Code Snippet"}),(0,b.jsx)(c.ToolbarDescription,{children:"Add prebuilt code blocks to projects"})]})}),(0,b.jsxs)(c.ToolbarActions,{children:[(0,b.jsxs)(e.InputWrapper,{className:"w-full lg:w-45 rounded-4xl",children:[(0,b.jsx)(k.Search,{}),(0,b.jsx)(e.Input,{type:"search",placeholder:"Search",onChange:()=>{}})]}),(0,b.jsx)(d.Button,{mode:"icon",shape:"circle",variant:"outline",children:(0,b.jsx)(g.Coffee,{})}),(0,b.jsx)(d.Button,{mode:"icon",shape:"circle",variant:"outline",children:(0,b.jsx)(i.MessageSquareCode,{})}),(0,b.jsx)(d.Button,{mode:"icon",shape:"circle",variant:"outline",children:(0,b.jsx)(h.Pin,{})}),(0,b.jsxs)(d.Button,{variant:"mono",shape:"circle",children:[(0,b.jsx)(j.VectorSquare,{}),"Share"]})]})]}),(0,b.jsx)(f.Skeleton,{className:"rounded-lg grow h-screen bg-0"})]})}a.s(["default",()=>l])}];

//# sourceMappingURL=_d98988ce._.js.map